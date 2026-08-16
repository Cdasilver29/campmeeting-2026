"use client";

import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import {
  LIVESTREAM_CHANNEL_ID,
  LIVESTREAM_CHANNEL_URL,
  LIVESTREAM_VIDEO_ID,
} from "../config";

/**
 * Click-to-load: no iframe, and no request to any YouTube host, until the
 * play control is activated. A visit before the event or on mobile data
 * during it costs nothing until the visitor chooses to spend it. That is
 * why this component exists in this shape and none of what follows
 * weakens it — the branch below decides what the src WOULD be; the iframe
 * is still only mounted once `activated` is true.
 *
 * ── WHICH STREAM: THE CHANNEL DECIDES, NOT THIS SITE ─────────────────
 *
 * The src is built in this order:
 *
 *   1. LIVESTREAM_VIDEO_ID, if one has been pinned globally
 *   2. the channel auto-detect embed — the normal path
 *   3. no embed at all: the link-out to the channel
 *
 * 2 is what serves every live viewer. `live_stream?channel=` asks YouTube
 * what this channel is broadcasting at the moment the visitor presses
 * play, so the answer is resolved fresh, per visitor, per press — it
 * cannot go stale and there is nothing to type in before a service.
 *
 * There was briefly a step above these: a per-day, per-half-day id looked
 * up from a hand-maintained table. It is gone. One wrong id in that table
 * took a live broadcast off the site, because pinning any id — including
 * one pointing at nothing — beat the channel lookup that was working. A
 * mechanism that fails silently, and only while the thing it serves is
 * happening, is worse than the lookup it was added to protect against.
 *
 * That original complaint is not forgotten: on the opening morning the
 * channel embed did once answer "This video is unavailable" while a
 * broadcast was going out. The answer to that is the link-out below and
 * the archive further down the page, both of which reach the stream
 * without this site having to guess at an id.
 */
export function LiveEmbed({ label }: { label: string }) {
  const [activated, setActivated] = useState(false);
  const embeddable = Boolean(LIVESTREAM_VIDEO_ID || LIVESTREAM_CHANNEL_ID);

  if (!embeddable) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-card bg-accent-700 p-6 text-center ring-1 ring-line">
        <p className="max-w-sm text-sm text-white/80">
          The stream link has not been published yet. Watch on the church&apos;s
          YouTube channel once it goes live.
        </p>
        <a
          href={LIVESTREAM_CHANNEL_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-control bg-white px-3 py-1.5 text-sm font-medium text-accent-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-300"
        >
          Open the YouTube channel
          <ExternalLink aria-hidden className="size-3.5" />
        </a>
      </div>
    );
  }

  if (activated) {
    // The priority order from the note above, in one expression.
    const src = LIVESTREAM_VIDEO_ID
      ? `https://www.youtube-nocookie.com/embed/${LIVESTREAM_VIDEO_ID}?autoplay=1`
      : `https://www.youtube-nocookie.com/embed/live_stream?channel=${LIVESTREAM_CHANNEL_ID}&autoplay=1`;

    return (
      <div className="aspect-video w-full overflow-hidden rounded-card ring-1 ring-line">
        <iframe
          src={src}
          title={label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    /*
     * Three states, the same three the speaker and ministry cards use, so
     * the largest control on the site does not respond differently from
     * the smallest. Hover tints the poster and grows the disc; active puts
     * the disc back and deepens the ring to 2px accent; focus-visible is
     * the outline.
     *
     * The pressed state was the gap. This control loads a third-party
     * iframe over whatever connection the reader is on, so the gap between
     * the click and anything visible happening is longer here than
     * anywhere else on the site, and it was the one place giving no
     * acknowledgement that the press had landed.
     *
     * `group` is named-less on purpose and it IS consumed — by
     * group-hover and group-active on the disc below. The transition list
     * is explicit rather than transition-colors, because the ring is a
     * box-shadow and was previously not transitioning at all.
     *
     * The poster is accent-700 (Emperor taken 36% to black) and hovers to
     * Emperor itself, which is the same direction the navy pair it
     * replaces moved in: a step lighter, not darker, because the poster is
     * already the darkest thing on the page.
     *
     * THE PRESSED RING CHANGED COLOUR, and it had to. It was
     * `ring-primary/50`, which under the navy palette was #2e6de7 — a
     * bright blue that read clearly against #031635. --primary is now
     * Emperor, and Emperor at 50% over an Emperor-derived ground is a
     * pressed state nobody can see. accent-300 is the lightened Emperor
     * that exists for exactly this problem, and it is what dark mode
     * already points --primary at.
     */
    <>
      <button
      type="button"
      onClick={() => setActivated(true)}
      aria-label={`Load the livestream video from YouTube: ${label}`}
      className="group flex aspect-video w-full items-center justify-center rounded-card bg-accent-700 ring-1 ring-line transition-[background-color,box-shadow] duration-fast ease-out-soft hover:bg-accent-500 active:ring-2 active:ring-accent-300/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-300"
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-white text-accent-700 transition-transform duration-fast ease-out-soft group-hover:scale-105 group-active:scale-100">
        <Play aria-hidden className="ml-1 size-7 fill-current" />
      </span>
      </button>

      {/* Click-to-load is a JavaScript mechanism, so with scripting off the
          poster above is a button that does nothing. It always was. One
          link fixes that, and it costs nothing to anyone else because
          <noscript> is inert when scripts run. The channel URL is the
          right destination with or without scripting: it is what the
          embed resolves to anyway, worked out by YouTube rather than
          named by this page. */}
      <noscript>
        <a
          href={LIVESTREAM_CHANNEL_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-ink-muted underline underline-offset-4"
        >
          Watch on the church&apos;s YouTube channel
          <ExternalLink aria-hidden className="size-3.5" />
        </a>
      </noscript>
    </>
  );
}
