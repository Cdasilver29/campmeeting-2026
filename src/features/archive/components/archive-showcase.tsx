"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { ArchiveVideo } from "@/data/archive";
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
 * ── AND IT GETS OUT OF THE READER'S WAY ──────────────────────────────
 *
 * THE BUG THIS SECTION EXISTS TO PREVENT. The first version held the
 * rotation on hover and on focus-within only, and kept its position in an
 * `indexRef` that it incremented itself. Neither half survived contact
 * with a reader scrolling the rail by hand:
 *
 *   1. A TOUCH DRAG AND A TRACKPAD FLICK FIRE NEITHER OF THOSE EVENTS.
 *      A swipe on a phone produces no `mouseenter` at all, so the 4.5s
 *      timer went on firing `scrollTo` in the middle of the drag and the
 *      rail was pulled out from under the thumb every few seconds.
 *
 *   2. `indexRef` WAS A PHANTOM POSITION. It was never read back from the
 *      rail, so it described where the rotation had put the rail, not
 *      where the rail was. A reader who scrolled to card 12 while the
 *      counter still said 2 got yanked to card 3 on the next tick — a
 *      backwards jump of nine cards, and worst at exactly the far end
 *      where the gap between the two numbers is largest. That is the
 *      "snaps back", and it was not a snap: it was the rotation resuming
 *      from a position that no longer existed.
 *
 * Both are fixed by the same two decisions.
 *
 * THE READER'S OWN SCROLLING IS NEVER SCRIPTED. The rail is
 * `overflow-x: auto` and nothing here touches it while a reader is using
 * it — no transform, no `scrollLeft` write, no preventDefault on a wheel
 * or a touch. Momentum, rubber-banding and trackpad inertia are the
 * platform's and behave the way that platform's readers expect.
 *
 * INPUT EVENTS PAUSE IT, NOT SCROLL EVENTS. `pointerdown`, `touchstart`,
 * `wheel`, `keydown` and `focusin` are things a person does; a `scroll`
 * event is also what our own `scrollTo` produces, so a rotation listening
 * for scroll would pause itself forever on its first tick. `scroll` is
 * read for one narrow purpose only — extending an idle window that is
 * already open — which is what carries the pause through the tail of a
 * fling, where the finger has left the glass and no input event fires.
 *
 * AND IT RESUMES FROM WHERE THE RAIL IS. `advance` reads `scrollLeft` and
 * picks the next card offset past it, every time. There is no counter to
 * go stale, so resuming after a manual scroll continues from wherever the
 * reader left the rail.
 *
 * ── TWO PAUSES, AND THEY ARE NOT THE SAME PAUSE ──────────────────────
 *
 * `paused` is the reader's explicit instruction, made with the visible
 * control, and only that control clears it. The idle timer cannot, hover
 * cannot, and a scroll cannot — a rotation that restarted itself after
 * somebody pressed pause would be ignoring the one unambiguous statement
 * of intent on the whole strip.
 *
 * `interacting` is transient. It says "somebody is using this right now"
 * and it lapses on its own after IDLE_RESUME_MS.
 *
 * `focused` is between the two: it is not the reader's instruction, but
 * no timer clears it either. It releases when focus leaves and not
 * before.
 */
const ADVANCE_MS = 4500;

/**
 * How long the rail waits after the last thing a reader did before it
 * starts moving again.
 *
 * 6s, which is one advance and a third. Shorter than the 4.5s tick and
 * the rail is moving again before a reader has finished reading the card
 * they stopped on, which is the complaint this whole section is about.
 * Much longer and the strip is, in practice, a static rail for anyone who
 * touches it once — the rotation is what says "there is more of this
 * along here", and a reader who nudged it should still be told.
 *
 * It is measured from the last input event OR the last scroll frame while
 * an idle window is already open, so a fling that coasts for two seconds
 * after the finger lifts gets its six seconds from where it stops, not
 * from where it started.
 */
const IDLE_RESUME_MS = 6000;

/** Slack, in px, for comparing a scroll offset against a card's own. */
const EPSILON = 2;

/**
 * The card. A quieter relative of ../components/video-card.tsx: it keeps
 * the play disc and drops the "Watch on YouTube" line.
 *
 * ── THE DISC IS BACK, AND IT IS A DELIBERATE TRADE ───────────────────
 *
 * This card had no disc and no hover wash, on the reasoning that pressing
 * it does not play anything — it goes to /archive at this theme's anchor.
 * That reasoning is still true and the destination has not changed.
 *
 * What it cost was the whole affordance. Most of this congregation reads
 * on a phone and never enters a hover state, so at rest the strip was
 * fourteen flat rectangles with small type under them, and nothing on any
 * of them said "this is a recording you can watch" — on the one strip
 * whose entire purpose is to be pressed.
 *
 * The disc says "recording", which is true of every card here, and it is
 * the mark this site already uses to say it. What it does NOT say is
 * "plays in place", and the cost of that ambiguity is one extra press on
 * a page that is one press away regardless. The alternative — pointing
 * these at YouTube so the disc means exactly what it means on /archive —
 * is ruled out for reasons that have nothing to do with appearance: an
 * internal Link is prefetched and works from the precache with no signal,
 * and a card that left the site from its front door is the opposite of
 * what this strip is for.
 *
 * Same tokens as the archive card, no new ones: emperor disc, white
 * glyph, ring-white/80, and the emperor/25 wash on hover.
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
        <span
          aria-hidden
          className="absolute inset-0 bg-emperor/0 transition-colors duration-fast ease-out-soft group-hover/card:bg-emperor/25"
        />
        {video.part ? (
          <span className="absolute left-2 top-2 rounded-control bg-emperor px-2 py-0.5 text-xs font-medium text-white">
            {video.part}
          </span>
        ) : null}
        {/* At rest, not on hover, and for the reason the archive card
            gives: most of this congregation reads on a phone and never
            enters a hover state, so an affordance that only exists on
            hover does not exist. */}
        <span
          aria-hidden
          className="absolute right-2 bottom-2 flex size-9 items-center justify-center rounded-full bg-emperor text-white ring-2 ring-white/80 transition-transform duration-fast ease-out-soft group-hover/card:scale-110"
        >
          <Play className="ml-0.5 size-4 fill-current" />
        </span>
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
  /** The reader's explicit instruction. Only the visible control moves it. */
  const [paused, setPaused] = useState(false);
  /**
   * Focus is inside the rail. A HARD hold: it does not lapse, and no idle
   * timer clears it. A reader tabbing through fourteen links must not have
   * the rail scrolled out from under them, and unlike a resting pointer,
   * focus is never accidental.
   */
  const [focused, setFocused] = useState(false);
  /** Somebody touched, dragged, wheeled, typed at or moved over the rail. */
  const [interacting, setInteracting] = useState(false);
  const railRef = useRef<HTMLUListElement>(null);
  /** +1 rightwards, -1 leftwards. See the note on reaching an end below. */
  const directionRef = useRef(1);
  const idleRef = useRef(0);
  /**
   * Whether an idle window is currently open, as a ref the passive scroll
   * listener can read without being re-attached on every state change.
   *
   * It is NOT the timeout id. Reading `idleRef.current` for this is the
   * bug this ref exists to prevent: a timeout id is truthy from the first
   * interaction and is never cleared when the timer fires, so the scroll
   * listener would have treated every subsequent scroll — including the
   * rotation's own smooth scroll — as a reason to stay paused, and the
   * rail would have stopped for good the first time anybody touched it.
   */
  const idleOpenRef = useRef(false);

  useEffect(() => setMounted(true), []);

  const rotating = mounted && !shouldReduceMotion && videos.length > 1;
  const href = `${ARCHIVE_PATH}#${themeId}`;

  /*
     Advance by reading the rail's CURRENT scroll position and the NEXT
     CARD'S OWN OFFSET past it. Two things follow from that, and both are
     the point:

       - No card width is computed. The cards are one width on a phone and
         another from sm, and a number derived from one breakpoint is wrong
         at every other. The DOM already knows where each card starts.
       - No index is kept. A counter is a second, private idea of where the
         rail is, and it goes stale the moment a reader scrolls; reading
         `scrollLeft` cannot. This is what makes "resume from wherever the
         rail now sits" fall out rather than have to be implemented.

     ── AT EITHER END IT TURNS ROUND. IT DOES NOT WRAP ─────────────────

     Chosen over both alternatives, deliberately.

     Wrapping means going from the last card to the first, and on a scroll
     rail there is no way to do that which is not worse than this: a smooth
     scroll back is the whole rail rewinding past every card at speed, and
     an instant jump is 3,000px of content teleporting under a reader who
     did not ask for it. Neither is a movement this page's manner allows.

     Stopping at the end means the strip dies about a minute after it
     loads and parks itself at its right-hand end, where the heading above
     it sits over what looks like an empty rail — and the pause control,
     the one moving-thing affordance, is then a button that stops
     something already stopped.

     Turning round keeps the motion continuous and every step of it one
     card long, in either direction. A reader who leaves the page open sees
     the fourteen sermons go by and come back, which is what a showcase is
     for.
  */
  const advance = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const cards = [...rail.children] as HTMLElement[];
    if (cards.length === 0) return;

    /* offsetLeft is a layout position and is unaffected by scrolling, so
       card-minus-rail is the scroll offset that brings that card flush to
       the rail's leading edge. Both share an offset parent: the rail is
       statically positioned. */
    const offsets = cards.map((card) => card.offsetLeft - rail.offsetLeft);
    const furthest = rail.scrollWidth - rail.clientWidth;
    if (furthest <= EPSILON) return; // nothing to scroll: every card fits

    const here = rail.scrollLeft;

    /* The next offset in `direction` that the rail can actually reach.
       The clamp matters at the right-hand end, where the last card sits
       flush to the edge and its own offset is past `furthest` — without
       it the rotation would keep asking for a position it is already at
       and the rail would sit still rather than turn round. */
    const nextIn = (direction: number) => {
      const found =
        direction > 0
          ? offsets.find((offset) => offset > here + EPSILON)
          : [...offsets].reverse().find((offset) => offset < here - EPSILON);
      if (found === undefined) return undefined;
      const reachable = Math.max(0, Math.min(found, furthest));
      return Math.abs(reachable - here) > EPSILON ? reachable : undefined;
    };

    let target = nextIn(directionRef.current);
    if (target === undefined) {
      directionRef.current = -directionRef.current;
      target = nextIn(directionRef.current);
    }
    if (target === undefined) return;

    rail.scrollTo({ left: target, behavior: "smooth" });
  }, []);

  /* Any input event opens the idle window and restarts it. These are all
     things a person does; none of them is produced by our own scrollTo,
     which is why the rotation cannot pause itself. */
  const noteInteraction = useCallback(() => {
    idleOpenRef.current = true;
    setInteracting(true);
    window.clearTimeout(idleRef.current);
    idleRef.current = window.setTimeout(() => {
      idleOpenRef.current = false;
      setInteracting(false);
    }, IDLE_RESUME_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(idleRef.current), []);

  /* Listeners go on the element rather than through React props for one
     reason: `wheel` and `touchstart` have to be passive. React attaches
     both as non-passive by default, and a non-passive wheel listener on a
     scroll container tells the compositor it might be cancelled, which
     costs the reader the very smoothness this change is about. Nothing
     here calls preventDefault, so passive is also simply true.

     Only attached while the rail can rotate. Under prefers-reduced-motion
     there is nothing to pause, so there is nothing to listen for either —
     and manual scrolling, which is untouched by any of this, goes on
     working exactly as the platform provides it. */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !rotating) return;

    const passive = { passive: true } as const;
    /* `pointermove` and `pointerenter` are in this list rather than being a
       hard hover hold, and that is the one judgement call in here.

       A hard hold was the first version and it is why a trackpad reader
       could scroll the rail once and never see it move again: the pointer
       comes to rest over the rail as a side effect of scrolling it, and a
       pointer at rest held the rotation for as long as it sat there. A
       pointer that is not moving is not a reader using this.

       As an interaction it does the useful half and drops the rest: any
       actual movement across the rail — including the jitter before a
       press — restarts the six seconds, so the rotation never scrolls a
       card out from under a hand that is going somewhere, and a pointer
       parked and forgotten lets it resume. Focus, above, is the hold that
       does not lapse, because focus is never accidental. */
    for (const type of [
      "pointerenter",
      "pointermove",
      "pointerdown",
      "touchstart",
      "wheel",
      "keydown",
    ]) {
      rail.addEventListener(type, noteInteraction, passive);
    }

    /* Scroll is NOT an interaction on its own — our own smooth scroll
       fires it. It only extends a window that a real input already
       opened, which is how a fling's coast keeps the rail paused after
       the finger has gone. */
    const onScroll = () => {
      if (idleOpenRef.current) noteInteraction();
    };
    rail.addEventListener("scroll", onScroll, passive);

    return () => {
      for (const type of [
        "pointerenter",
        "pointermove",
        "pointerdown",
        "touchstart",
        "wheel",
        "keydown",
      ]) {
        rail.removeEventListener(type, noteInteraction);
      }
      rail.removeEventListener("scroll", onScroll);
    };
  }, [rotating, noteInteraction]);

  useEffect(() => {
    if (!rotating || paused || focused || interacting) return;
    const id = window.setInterval(advance, ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [rotating, paused, focused, interacting, advance]);

  return (
    <section
      aria-labelledby="archive-showcase-heading"
      className="flex flex-col gap-(--space-item)"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="flex flex-col gap-1">
          {/* ── THE ONE HEADING ON THIS PAGE THAT IS NOT DOC_HEADING ──
              text-3xl, where every other section heading below the hero
              is text-2xl.

              In the `after` phase — eleven and a half months of every
              year — this IS the home page's content: the hero, and then
              seven years of recordings. Under it sat "Camp Meeting 2026
              has ended" and "A welcome from our senior pastor", both at
              text-2xl in the same display face, so three sections
              announced themselves at identical weight and the page had no
              primary. Worse, the largest type in the whole column
              belonged to the empty state, because that heading is centred
              in a tall dashed panel.

              One step of the existing type scale, on the section that has
              the strongest claim to the reader in this phase. Nothing
              else moves: the other headings are unchanged, so the
              difference is a hierarchy rather than a general enlargement.
              The h2 level is unchanged too — this is a size, not a
              promotion in the document outline. */}
          <h2
            id="archive-showcase-heading"
            className="font-display text-3xl text-ink"
          >
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
          focusable children, which is why focus-within is the ONE hold
          here that does not lapse: a rail that scrolls itself while
          somebody is tabbing through it is a trap in everything but name,
          and no timer should decide they have finished.

          onFocus / onBlur are React's focusin / focusout, so they cover
          focus arriving on any card inside as well as on the rail itself.
          Blur opens the idle window rather than releasing outright, so the
          rail does not lurch the instant focus leaves it.

          Everything else a reader does — touch, drag, wheel, arrow keys,
          moving the pointer across it — is handled by the listeners in the
          effect above, because those have to be passive. See the note
          there.

          `overflow-x-auto` and nothing else: the reader's own scrolling is
          the platform's, with the platform's momentum. Snapping stays
          mandatory. It is what makes both a fling and the rotation come to
          rest on a card edge rather than mid-thumbnail, it is applied by
          the compositor after the gesture rather than during it, and it
          was never the thing that pulled the rail backwards — that was the
          stale index, and it is gone.

          `overscroll-x-contain` stops a swipe that runs off the end of the
          rail from turning into a browser back gesture. */}
      <ul
        ref={railRef}
        tabIndex={0}
        aria-label={`${themeLabel} from ${year}`}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          noteInteraction();
        }}
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
