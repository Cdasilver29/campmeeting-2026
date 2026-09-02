"use client";

import { useState } from "react";
import { ExternalLink, ListVideo, Play } from "lucide-react";
import { playlistEmbedUrl, playlistUrl } from "../config";

/**
 * A year held as a YouTube playlist, behind a press.
 *
 * ── CLICK-TO-LOAD, THE SAME DISCIPLINE AS THE LIVE PLAYER ────────────
 *
 * No iframe, and no request to any YouTube host, until the control is
 * activated. On this page that matters more than it does on /livestream,
 * not less: /livestream carries ONE player, and /archive carries six. Six
 * eagerly framed playlists would open six connections to YouTube for
 * anybody who so much as scrolled past them, on the campground data this
 * whole phase exists to be careful with.
 *
 * The poster is the same object as the live player's — an Emperor ground,
 * a white disc with a soft halo, and two lines of type, the second of
 * which is the honest one about what the press costs. It is smaller and
 * quieter here, because the live player is the point of its page and one
 * of six year panels is not the point of this one.
 *
 * ── NO API CALL, UNLIKE THE LIVE PLAYER ──────────────────────────────
 *
 * `LiveEmbed` asks /api/live-now which video is streaming before it
 * mounts anything, because "what is live right now" is not knowable at
 * build time. A playlist id is a constant that resolves to the same
 * playlist forever, so there is nothing to resolve and no spinner state:
 * the press mounts the iframe.
 *
 * ── CONTRAST ─────────────────────────────────────────────────────────
 *
 * White on Emperor 11.59:1, white on Grapevine 9.22:1 on hover, white/85
 * 8.81:1, and the Emperor glyph in its white disc 11.59:1 — the same four
 * pairings the live poster asserts, in both themes, because these are raw
 * brand tokens that do not flip. The focus ring is accent-500, which does
 * follow the theme: 10.86:1 light, 7.06:1 dark on the surrounding card.
 */
export function PlaylistEmbed({
  playlistId,
  year,
}: {
  playlistId: string;
  year: number;
}) {
  const [activated, setActivated] = useState(false);

  if (activated) {
    return (
      /* bg-black under the iframe: a 16:9 frame around videos that are
         not all 16:9 letterboxes, and black is what a player letterboxes
         with. */
      <div className="aspect-video w-full overflow-hidden rounded-card bg-black">
        <iframe
          src={playlistEmbedUrl(playlistId)}
          title={`Camp Meeting ${year} recordings`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setActivated(true)}
        aria-label={`Load the Camp Meeting ${year} playlist from YouTube`}
        className="group flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-card bg-emperor px-6 transition-colors duration-fast ease-out-soft hover:bg-grapevine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-white text-emperor ring-8 ring-white/15 transition-[transform,box-shadow] duration-base ease-out-soft group-hover:scale-105 group-hover:ring-white/25 group-active:scale-100 group-active:ring-white/40 sm:size-16">
          <Play aria-hidden className="ml-1 size-6 fill-current sm:size-7" />
        </span>
        {/* aria-hidden: the button already has an aria-label saying all of
            this. Without it a screen reader hears the label and then the
            same words again as content. */}
        <span aria-hidden className="flex flex-col items-center gap-0.5 text-center">
          <span className="text-base font-medium text-white">
            Play the {year} recordings
          </span>
          <span className="text-xs text-white/85 sm:text-sm">
            Nothing loads from YouTube until you press play
          </span>
        </span>
      </button>

      {/* Click-to-load is a JavaScript mechanism, so with scripting off the
          poster above is a button that does nothing. One link fixes that,
          and it costs nothing to anyone else because <noscript> is inert
          when scripts run. */}
      <noscript>
        <a
          href={playlistUrl(playlistId)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-ink-muted underline underline-offset-4"
        >
          <ListVideo aria-hidden className="size-4" />
          Open the {year} playlist on YouTube
          <ExternalLink aria-hidden className="size-3.5" />
        </a>
      </noscript>
    </>
  );
}
