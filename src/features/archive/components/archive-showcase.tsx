"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { ArchiveVideo } from "@/data/archive";
import { DOC_HEADING } from "@/lib/typography";
import {
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH,
  ARCHIVE_PATH,
  thumbnailUrl,
} from "../config";
import { speakerLabel, videoKey, whenLabel } from "../lib/entries";

/**
 * The home page's moving showcase of the archive.
 *
 * ── WHAT IS IN IT, AND WHAT IS NOT ───────────────────────────────────
 *
 * One theme of one year: the most recent archived year's `showcaseThemeId`
 * — today that is 2026's fourteen sermons. Both halves are derived from
 * the data and neither is written down here, so when 2027's file lands
 * this strip follows it with no change to this file. See
 * ../lib/showcase.ts.
 *
 * Not the 2020-2025 years: those are held as playlists, with no per-video
 * titles or speakers to put on a card. Not all fifty-four of 2026 either.
 * A showcase of fifty-four items is a list, and the fourteen sermons are
 * the ones whose titles read out of context — "The Bishop's Bedroom",
 * "Unstable as Water" — where "Morning Devotion", six times over, does
 * not.
 *
 * ── EVERY CARD GOES TO /archive, NOT TO YOUTUBE ──────────────────────
 *
 * Deliberate, and the opposite of what the same card does on /archive
 * itself. This strip is an advertisement for a page, so a press on it
 * should arrive at that page rather than leave the site from its front
 * door. The link carries the theme's anchor, so it lands on the section
 * the card came from with the other thirteen around it, and it is an
 * internal Link — prefetched, and it works from the precache with no
 * signal, which a YouTube URL never does.
 *
 * ── MOTION ───────────────────────────────────────────────────────────
 *
 * A scroll rail that advances itself, not a carousel that swaps content.
 * That choice is what makes every requirement below cheap:
 *
 *   STOPS DEAD under prefers-reduced-motion. `rotating` is false, no
 *   interval is ever created, nothing moves, and the rail stays a rail —
 *   every card is still reachable by scrolling or by tabbing, which is
 *   not true of a carousel that has been frozen on slide one. Not slowed:
 *   a slowed carousel is still a carousel.
 *
 *   NO LAYOUT SHIFT. The cards are laid out identically on the server and
 *   on the client; the rotation only changes `scrollLeft`, which moves
 *   nothing in the layout. The one element that appears at hydration is
 *   the pause button, and it appears into a fixed-size slot that is in the
 *   markup either way — the same technique, for the same measured reason,
 *   as the hero caption's control slot.
 *
 *   NOTHING DELAYS LCP. The thumbnails are lazy, low priority and
 *   cross-origin; the hero above is the LCP element and nothing here may
 *   queue in front of it.
 *
 * ── AND IT PAUSES WHEN SOMEBODY IS USING IT ──────────────────────────
 *
 * On hover, and on focus within. The hero's rotation needs neither,
 * because nothing in it is interactive. Here a reader tabbing through
 * fourteen links would otherwise have the rail scrolled out from under
 * them every four seconds, which is a keyboard trap in everything but
 * name.
 */
const ADVANCE_MS = 4500;

/**
 * The card. A quieter relative of ../components/video-card.tsx: no play
 * disc and no "Watch on YouTube" line, because pressing this does not
 * play anything.
 *
 * Title in `primary` on `surface-muted` 10.86:1 light / 7.06:1 dark, the
 * two meta lines in `ink-muted` on the same ground 5.96:1 / 10.49:1, and
 * the part chip white on Emperor 11.59:1 in both themes. Every pairing is
 * one the archive card already uses, so this introduces none of its own.
 */
function ShowcaseCard({ video, href }: { video: ArchiveVideo; href: string }) {
  return (
    <Link
      href={href}
      className="group/card flex h-full flex-col overflow-hidden rounded-card bg-surface-muted ring-1 ring-line transition-[box-shadow] duration-fast ease-out-soft hover:ring-2 hover:ring-accent-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
    >
      <span className="relative aspect-video w-full overflow-hidden bg-surface-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- deliberately
            not next/image: the optimizer would re-serve this from our own
            origin, where the service worker would cache it. See the note on
            thumbnailUrl in ../config.ts. */}
        <img
          src={thumbnailUrl(video.videoId as string)}
          alt=""
          width={THUMBNAIL_WIDTH}
          height={THUMBNAIL_HEIGHT}
          loading="lazy"
          fetchPriority="low"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-base ease-out-soft group-hover/card:scale-105"
        />
        {video.part ? (
          <span className="absolute left-2 top-2 rounded-control bg-emperor px-2 py-0.5 text-xs font-medium text-white">
            {video.part}
          </span>
        ) : null}
      </span>
      {/* min-h so a one-line and a two-line title make the same card, and
          the row's height does not depend on which cards are in view. */}
      <span className="flex min-h-[5.5rem] flex-1 flex-col gap-1 p-3">
        <span className="text-sm font-medium text-primary underline-offset-4 group-hover/card:underline">
          {video.subtitle ?? video.title}
        </span>
        <span className="text-xs text-ink-muted">{speakerLabel(video)}</span>
        <span className="text-xs text-ink-muted">{whenLabel(video)}</span>
      </span>
    </Link>
  );
}

export function ArchiveShowcase({
  year,
  themeId,
  themeLabel,
  videos,
  totalInYear,
}: {
  year: number;
  themeId: string;
  themeLabel: string;
  videos: ArchiveVideo[];
  totalInYear: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const railRef = useRef<HTMLUListElement>(null);
  const indexRef = useRef(0);

  useEffect(() => setMounted(true), []);

  const rotating = mounted && !shouldReduceMotion && videos.length > 1;
  const href = `${ARCHIVE_PATH}#${themeId}`;

  /* Advance by reading the NEXT CARD'S OWN OFFSET rather than multiplying
     an index by a card width. The cards are one width on a phone and
     another from sm, and a computed width would be wrong at every
     breakpoint but the one it was written for. The DOM already knows. */
  const advance = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const cards = rail.children;
    if (!cards.length) return;

    const next = (indexRef.current + 1) % cards.length;
    indexRef.current = next;
    const card = cards[next] as HTMLElement;
    rail.scrollTo({ left: card.offsetLeft - rail.offsetLeft, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!rotating || paused || held) return;
    const id = window.setInterval(advance, ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [rotating, paused, held, advance]);

  return (
    <section
      aria-labelledby="archive-showcase-heading"
      className="flex flex-col gap-(--space-item)"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="flex flex-col gap-1">
          <h2 id="archive-showcase-heading" className={DOC_HEADING}>
            Watch again
          </h2>
          <p className="text-sm text-ink-muted">
            {themeLabel} from {year}, and {totalInYear} recordings in all.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* The control's SLOT, not the control. A fixed 20px box that
              exists whether or not there is a button in it, so the row is
              the same shape before hydration, after it, and under
              prefers-reduced-motion. Without it the button's arrival at
              hydration would narrow the row beside it — a width change,
              which counts as layout shift even though nothing visibly
              moves. The hero caption's control slot is there for the same
              reason and the same measurement. */}
          <div className="size-5 shrink-0">
            {rotating ? (
              <button
                type="button"
                onClick={() => setPaused((current) => !current)}
                // The state is in the label, not only in the icon.
                aria-label={
                  paused
                    ? "Play the archive highlights"
                    : "Pause the archive highlights"
                }
                // A pseudo-element hit area, the same technique the hero
                // control and the bookmark toggle use: the painted control
                // is 20px because it sits beside 14px type, and the target
                // is 44px. tools/perf/responsive.mjs reads the negative
                // insets back and scores the real target.
                className="relative block rounded-control text-ink-muted transition-colors duration-fast ease-out-soft before:absolute before:-inset-3 before:content-[''] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
              >
                {paused ? (
                  <Play aria-hidden className="size-5" />
                ) : (
                  <Pause aria-hidden className="size-5" />
                )}
              </button>
            ) : null}
          </div>

          <Link
            href={ARCHIVE_PATH}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 transition-colors duration-fast hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            All recordings
            <ArrowRight aria-hidden className="size-4 shrink-0" />
          </Link>
        </div>
      </div>

      {/* A focusable scroll region, so a keyboard reader can pan it with
          the arrow keys rather than only by tabbing card to card. It holds
          focusable children, which is why `held` pauses on focus-within as
          well as on hover: a rail that scrolls itself while somebody is
          tabbing through it is a trap in everything but name.

          `overscroll-x-contain` stops a swipe that runs off the end of the
          rail from turning into a browser back gesture. */}
      <ul
        ref={railRef}
        tabIndex={0}
        aria-label={`${themeLabel} from ${year}`}
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={() => setHeld(false)}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 sm:gap-4"
      >
        {videos.map((video) => (
          <li
            key={videoKey(video)}
            className="w-56 shrink-0 snap-start sm:w-64"
          >
            <ShowcaseCard video={video} href={href} />
          </li>
        ))}
      </ul>
    </section>
  );
}
