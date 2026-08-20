"use client";

import { useState } from "react";
import { ExternalLink, Play, VideoOff } from "lucide-react";
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
 *
 * ── THE COLOURS HERE ARE THE RAW BRAND TOKENS, NOT THE ACCENT SCALE ──
 *
 * `bg-emperor` and `bg-grapevine` rather than `bg-accent-500` /
 * `bg-accent-600`, and that is a correctness point rather than a
 * preference. The accent scale FLIPS with the theme — `--color-accent-500`
 * is #4b207f in light and #b89ae0 in dark — so white type on an
 * accent-filled ground measures 11.59:1 in the day and 1.41:1 at night.
 * The nine palette names carry ONE value in both themes, which is why the
 * lightbox controls are set in them too; see the note in
 * features/gallery/components/gallery-grid.tsx.
 *
 * Measured, both themes, all four:
 *   white on Emperor            11.59:1
 *   white on Grapevine (hover)   9.22:1
 *   white/85 on Emperor          8.81:1  (#e4deec composited)
 *   Emperor glyph on the disc   11.59:1
 *
 * The focus ring moved from `accent-300` to `accent-500` for the same
 * reason: accent-300 is #b89ae0 in BOTH themes, which is 2.13:1 on a white
 * page — a focus indicator that is only visible at night. accent-500
 * follows the theme and measures 10.86:1 light / 7.06:1 dark against the
 * tray the ring is painted on.
 *
 * Every ratio above is asserted rather than written down: see the
 * /livestream block in tools/perf/contrast.mjs.
 */
export function LiveEmbed({ label }: { label: string }) {
  const [activated, setActivated] = useState(false);
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const embeddable = Boolean(LIVESTREAM_VIDEO_ID || LIVESTREAM_CHANNEL_ID);

  /* Not an absence of content — a stated state. It is the same Emperor
     ground and the same white pill the poster below uses, so a reader who
     lands on this sees the player's shape holding a sentence rather than a
     grey box that failed to load. */
  if (!embeddable) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-card bg-emperor p-6 text-center">
        <VideoOff aria-hidden className="size-7 text-white/85" />
        <p className="max-w-sm text-sm text-white/85">
          The stream link has not been published yet. Watch on the church&apos;s
          YouTube channel once it goes live.
        </p>
        <a
          href={LIVESTREAM_CHANNEL_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-control bg-white px-3 text-sm font-medium text-emperor transition-colors duration-fast ease-out-soft hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
      /* bg-black under the iframe: a 16:9 frame around a stream that is
         not 16:9 letterboxes, and black is what a player letterboxes
         with. Before this the bars were the page surface showing through,
         which read as the frame having failed to fill. */
      <div className="aspect-video w-full overflow-hidden rounded-card bg-black">
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
       * THE MOST-TAPPED ELEMENT ON THIS PAGE, DRESSED AS ONE.
       *
       * It was a flat accent-700 rectangle with a white disc floating in
       * the middle of it and no words — the same visual weight as an
       * archive thumbnail a third its size, and nothing on it said what
       * pressing would do or that pressing was even required.
       *
       * What it carries now: an Emperor ground, a disc with a soft white
       * halo standing off it, and two lines of type. The halo is a `ring`,
       * i.e. a box-shadow on a 56-80px circle — not an elevation shadow on
       * the whole poster, which the brief rules out and which would put
       * this element above the page's existing elevation vocabulary.
       *
       * Three states, the same three the speaker and ministry cards use, so
       * the largest control on the site does not respond differently from
       * the smallest:
       *
       *   hover   ground Emperor -> Grapevine (the site's own 500 -> 600
       *           hue step), disc up 6%, halo 15% -> 25%
       *   active  disc back to 100%, halo to 40% so the press reads as the
       *           control being taken hold of rather than moving away
       *   focus   a 2px accent-500 outline, offset onto the tray
       *
       * `disabled:cursor-wait` during the API call so the pointer reflects
       * that work is happening. The button is not truly disabled — it ignores
       * extra clicks via the loading guard — but the cursor change is the
       * right signal to the visitor.
       *
       * The second line is the honest one and is why it is worth the space:
       * this page fetches nothing from YouTube until the press, and a
       * visitor on campground data is entitled to know that the cost is
       * theirs to spend rather than already spent.
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
        className="group flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-card bg-emperor px-6 transition-colors duration-fast ease-out-soft hover:bg-grapevine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 disabled:cursor-wait sm:gap-4"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-white text-emperor ring-8 ring-white/15 transition-[transform,box-shadow] duration-base ease-out-soft group-hover:scale-105 group-hover:ring-white/25 group-active:scale-100 group-active:ring-white/40 sm:size-16 lg:size-20">
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
            <Play aria-hidden className="ml-1 size-6 fill-current sm:size-7" />
          )}
        </span>
        {/* aria-hidden: the button already has an aria-label that says all
            of this and names the stream. Without it a screen reader hears
            the label and then the same words again as content. */}
        <span aria-hidden className="flex flex-col items-center gap-0.5">
          <span className="text-base font-medium text-white sm:text-lg">
            {loading ? "Finding the live stream" : "Watch live"}
          </span>
          <span className="text-xs text-white/85 sm:text-sm">
            Nothing loads from YouTube until you press play
          </span>
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
