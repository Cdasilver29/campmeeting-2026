"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { useNow } from "@/features/schedule/use-now";
import {
  LIVESTREAM_CHANNEL_ID,
  LIVESTREAM_CHANNEL_URL,
  LIVESTREAM_VIDEO_ID,
  PART_LABEL,
} from "../config";
import { currentLiveVideoId, currentSlot } from "../lib/stream-link";

/**
 * Click-to-load: no iframe, and no request to any YouTube host, until the
 * play control is activated. A visit before the event or on mobile data
 * during it costs nothing until the visitor chooses to spend it. That is
 * why this component exists in this shape and none of what follows
 * weakens it — every branch below decides what the src WOULD be; the
 * iframe is still only mounted once `activated` is true.
 *
 * ── WHICH STREAM, AND WHY IT IS NOT THE CHANNEL LOOKUP ───────────────
 *
 * The src is built in this order:
 *
 *   1. today's own id for the half of the day it is now, from
 *      `liveStreams` in ../config
 *   2. LIVESTREAM_VIDEO_ID, if one has been pinned
 *   3. the channel auto-detect embed
 *   4. no embed at all: the link-out to the channel
 *
 * 1 is new and is the normal path during the week. The channel embed at 3
 * asks YouTube to work out what is live, and on the opening morning it
 * answered "This video is unavailable" while a broadcast was genuinely
 * going out. It stays as the fallback for a day whose ids nobody has
 * typed in yet — which is exactly the state every day is in until
 * somebody adds two lines — but it is no longer what the page depends on.
 *
 * ── THE CUTOVER, AND WHAT HAPPENS TO A PLAYING VIDEO ─────────────────
 *
 * `useNow()` is the schedule feature's own 30-second clock, the same one
 * the Today view and the "Watch live" button use; no second timer
 * mechanism is introduced. So somebody who opens this at 11am and leaves
 * the tab open is not stuck on the morning stream after the afternoon
 * starts.
 *
 * What the cutover does to an ALREADY PLAYING video is a decision, and it
 * is this: the player is closed and the poster comes back, so the visitor
 * presses play once more and gets the afternoon stream. It does not swap
 * the src underneath a playing iframe. Changing an iframe's src reloads
 * it, which would interrupt playback without warning and, worse, would do
 * it to somebody who had deliberately pressed play on the morning stream
 * to catch up on it. Returning to the poster is visible, undoes nothing,
 * and costs one press — which is the trade the brief allowed for.
 */
export function LiveEmbed({ label }: { label: string }) {
  const [activated, setActivated] = useState(false);
  const now = useNow();
  const embeddable = Boolean(LIVESTREAM_VIDEO_ID || LIVESTREAM_CHANNEL_ID);

  /*
   * Undefined until mount, and undefined outside the week. Both mean "no
   * day-specific id", which falls through to the pinned id or the channel
   * — the behaviour this page had before today.
   */
  const slot = now ? currentSlot(now) : undefined;
  const todayVideoId = now ? currentLiveVideoId(now) : undefined;
  const part = slot?.part;

  /*
   * The cutover. Close the player when the half of the day changes under
   * a visitor who already pressed play; the poster returns carrying the
   * new part's id. Keyed on the part alone rather than on the video id,
   * so re-typing today's id in config does not eject anybody mid-sermon.
   */
  const [activatedPart, setActivatedPart] = useState<typeof part>(undefined);
  useEffect(() => {
    if (activated && activatedPart && part && part !== activatedPart) {
      setActivated(false);
      setActivatedPart(undefined);
    }
  }, [activated, activatedPart, part]);

  /* "Camp Meeting 2026 livestream, Morning" once the clock has resolved.
     It names the iframe and the play button, so a screen reader hears
     which half of the day is about to load rather than a title that is
     the same all week. */
  const fullLabel = part ? `${label}, ${PART_LABEL[part]}` : label;

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
    const pinned = todayVideoId ?? LIVESTREAM_VIDEO_ID;
    const src = pinned
      ? `https://www.youtube-nocookie.com/embed/${pinned}?autoplay=1`
      : `https://www.youtube-nocookie.com/embed/live_stream?channel=${LIVESTREAM_CHANNEL_ID}&autoplay=1`;

    return (
      <div className="aspect-video w-full overflow-hidden rounded-card ring-1 ring-line">
        <iframe
          src={src}
          title={fullLabel}
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
      onClick={() => {
        // Remember which half of the day was pressed, so the effect above
        // can tell a real cutover from an ordinary re-render.
        setActivatedPart(part);
        setActivated(true);
      }}
      aria-label={`Load the livestream video from YouTube: ${fullLabel}`}
      className="group flex aspect-video w-full items-center justify-center rounded-card bg-accent-700 ring-1 ring-line transition-[background-color,box-shadow] duration-fast ease-out-soft hover:bg-accent-500 active:ring-2 active:ring-accent-300/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-300"
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-white text-accent-700 transition-transform duration-fast ease-out-soft group-hover:scale-105 group-active:scale-100">
        <Play aria-hidden className="ml-1 size-7 fill-current" />
      </span>
      </button>

      {/* Click-to-load is a JavaScript mechanism, so with scripting off the
          poster above is a button that does nothing. It always was. One
          link fixes that, and it costs nothing to anyone else because
          <noscript> is inert when scripts run. It goes to the channel
          rather than to today's video id: this is server-rendered markup
          on a statically generated page, so the id it could name is the one
          that was true at BUILD time, and a stale video id is worse than a
          channel that is always right. */}
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
