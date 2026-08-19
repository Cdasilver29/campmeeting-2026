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
 * ── WHICH STREAM: THE API DECIDES, NOT THE EMBED ─────────────────────
 *
 * When the visitor presses play we first call /api/live-now. That route
 * runs on the server, scrapes the channel page, and returns the specific
 * video id that is streaming right now. We then embed THAT id directly —
 * a specific-id embed is reliable, unlike live_stream?channel= which has
 * twice returned "This video is unavailable" over a running broadcast
 * (opening morning and day 4).
 *
 * The priority order:
 *
 *   1. LIVESTREAM_VIDEO_ID — a global override, same as before.
 *   2. The id returned by /api/live-now — the normal live path.
 *   3. live_stream?channel= — fallback if the API returns null or errors.
 *   4. No embed at all: the link-out to the channel.
 *
 * Steps 3 and 4 are the same fallbacks that have always existed, so any
 * failure in the API leaves the page exactly as it was before this change.
 *
 * ── WHY THERE IS NO autoplay=1 ───────────────────────────────────────
 *
 * With autoplay=1 the iframe mounted into a black rectangle with no
 * poster, no controls, and no error — confirmed against a live broadcast
 * on day 3, six ways, on both youtube-nocookie.com and youtube.com,
 * channel embed and direct id. Without it, every combination rendered the
 * poster and played on the press. The cost is one extra press on
 * YouTube's own button; the gain is a working player.
 *
 * ── WHY THE BUTTON IS ASYNC ───────────────────────────────────────────
 *
 * The /api/live-now call takes ~200 ms on a good connection. The button
 * shows a spinner for that window so the press lands visibly. On a slow
 * or failing connection, the API times out server-side at 4 s and this
 * fetch resolves to an empty result; activation proceeds immediately
 * after, falling through to the channel embed. The visitor waits at most
 * as long as it takes to find out there is nothing better to show.
 */
export function LiveEmbed({ label }: { label: string }) {
  const [activated, setActivated] = useState(false);
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
    // Priority: global pin → API-resolved live id → channel auto-detect.
    const src = LIVESTREAM_VIDEO_ID
      ? `https://www.youtube-nocookie.com/embed/${LIVESTREAM_VIDEO_ID}?playsinline=1`
      : resolvedId
        ? `https://www.youtube-nocookie.com/embed/${resolvedId}?playsinline=1`
        : `https://www.youtube-nocookie.com/embed/live_stream?channel=${LIVESTREAM_CHANNEL_ID}&playsinline=1`;

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

  async function handleActivate() {
    // Show loading state immediately so the press feels responsive.
    setLoading(true);
    try {
      const res = await fetch("/api/live-now", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as {
          videoId: string | null;
          live: boolean;
        };
        // Only use the resolved id when the channel is actually live right
        // now; otherwise the channel embed is the better choice (it shows
        // the channel page rather than an ended stream).
        if (data.videoId && data.live) {
          setResolvedId(data.videoId);
        }
      }
    } catch {
      // Network error or timeout — fall through to the channel embed.
    }
    setActivated(true);
    setLoading(false);
  }

  return (
    <>
      {/*
       * Three states, the same three the speaker and ministry cards use, so
       * the largest control on the site does not respond differently from
       * the smallest. Hover tints the poster and grows the disc; active puts
       * the disc back and deepens the ring to 2px accent; focus-visible is
       * the outline.
       *
       * `disabled:cursor-wait` during the API call so the pointer reflects
       * that work is happening. The button is not truly disabled — it ignores
       * extra clicks via the loading guard — but the cursor change is the
       * right signal to the visitor.
       */}
      <button
        type="button"
        onClick={handleActivate}
        disabled={loading}
        aria-label={
          loading
            ? "Loading the livestream…"
            : `Load the livestream video from YouTube: ${label}`
        }
        className="group flex aspect-video w-full items-center justify-center rounded-card bg-accent-700 ring-1 ring-line transition-[background-color,box-shadow] duration-fast ease-out-soft hover:bg-accent-500 active:ring-2 active:ring-accent-300/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-300 disabled:cursor-wait"
      >
        <span className="flex size-16 items-center justify-center rounded-full bg-white text-accent-700 transition-transform duration-fast ease-out-soft group-hover:scale-105 group-active:scale-100">
          {loading ? (
            /* Spinner while /api/live-now resolves (~200 ms typical). */
            <svg
              aria-hidden
              className="size-7 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : (
            <Play aria-hidden className="ml-1 size-7 fill-current" />
          )}
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
