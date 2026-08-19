import { LIVESTREAM_CHANNEL_ID } from "@/features/livestream/config";

/**
 * ── WHAT IS THIS CHANNEL BROADCASTING RIGHT NOW ──────────────────────
 *
 * Answers with the live video's id, or with nothing. It exists because
 * the mechanism that used to answer this question stopped working
 * DURING the event, twice.
 *
 * ── WHY THERE IS A ROUTE HANDLER ON A STATIC SITE ────────────────────
 *
 * CLAUDE.md says static generation everywhere and no backend, and this
 * is the one question that cannot be answered that way. "Which video is
 * live" is true for ninety minutes and false either side of it, so it
 * cannot be baked into a build, and every other way of asking has been
 * tried on this site and has failed:
 *
 *   - `youtube.com/embed/live_stream?channel=…` — YouTube's own
 *     auto-detect embed, and what this replaces. It answered "This
 *     video is unavailable" over a running broadcast on the opening
 *     morning, and again on day 4 with the morning service going out.
 *     It is a legacy endpoint; the channel id it is given is correct and
 *     the broadcast it fails to find is public and embeddable.
 *   - A hand-typed table of ids. Tried, and it took a broadcast off the
 *     site when one character was wrong. Not coming back — see the note
 *     in features/livestream/config.ts.
 *   - Asking YouTube from the BROWSER. Cross-origin, so the channel page
 *     and the RSS feed are both unreadable there, and the Data API needs
 *     a key to hold, rotate and stay under quota for.
 *
 * So the question is asked from this origin, where none of those apply,
 * and the answer is read out of the page YouTube already publishes at
 * `/channel/<id>/live`. No key, no quota, no id typed by anybody, and
 * nothing to do before a service.
 *
 * This is 40 lines that read one URL and return one string. It holds no
 * state, has no database, writes nothing, and is not a backend in the
 * sense CLAUDE.md rules out — but it IS the first dynamic route on the
 * site, and that is a deliberate exception rather than an oversight.
 *
 * ── IT CANNOT MAKE THINGS WORSE ──────────────────────────────────────
 *
 * Every failure here returns `{ videoId: null }`, and the player falls
 * back to exactly what it does today: the legacy channel embed, and
 * under that the link out to the channel. A YouTube layout change, a
 * timeout, a blocked request from Vercel's network — all of them land on
 * the current behaviour rather than on a broken page.
 */

/** Never prerendered: the answer is different every ninety minutes. */
export const dynamic = "force-dynamic";

/**
 * The two pages that name the live broadcast, in the order they are
 * tried. The channel-id URL is first because it is derived from the same
 * constant the embed uses, so it cannot drift from it; the handle is a
 * second chance in case YouTube changes what `/channel/…/live` serves.
 */
const LIVE_PAGES = [
  `https://www.youtube.com/channel/${LIVESTREAM_CHANNEL_ID}/live`,
  "https://www.youtube.com/@NewlifeSDAChurchNairobi/live",
];

/**
 * A desktop UA and an English Accept-Language, because YouTube serves a
 * consent interstitial to requests that look like neither, and that page
 * carries no canonical video link.
 */
const HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "accept-language": "en-US,en;q=0.9",
};

/**
 * The canonical link is the id. On a channel that IS live,
 * `/channel/<id>/live` resolves to the broadcast and sets
 * `<link rel="canonical" href="https://www.youtube.com/watch?v=…">`. On a
 * channel that is not, it resolves to the channel page and the canonical
 * is the channel URL, which has no `watch?v=` in it — so the absence of
 * a match is the "nothing is live" answer rather than a parse failure.
 *
 * ── WHY THE LOOSE "videoId" PATTERN WAS REMOVED ──────────────────────
 *
 * The earlier fallback `/"videoId":"([\w-]{11})"/` matched the FIRST
 * "videoId" occurrence in YouTube's serialised page JSON, which is NOT
 * guaranteed to be the live stream. YouTube's HTML embeds video ids for
 * recommended/related content from ANY channel. During the event it
 * returned an unrelated video from a different channel because that
 * video appeared earlier in the JSON than the live stream itself.
 *
 * The canonical <link> is set by YouTube specifically to the live video
 * when the channel is broadcasting. It is the only source used now.
 */
function canonicalVideoId(html: string): string | null {
  const match = html.match(
    /<link\s+rel="canonical"\s+href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/,
  );
  return match?.[1] ?? null;
}

/**
 * Whether the video found is broadcasting NOW rather than being the last
 * stream to have ended. An ended stream still answers at `/live` for a
 * while, and embedding it would put yesterday's service on the page
 * under a "live now" heading.
 */
function isLiveNow(html: string): boolean {
  return (
    html.includes("hlsManifestUrl") ||
    html.includes('"isLiveNow":true') ||
    html.includes('"isLive":true')
  );
}

/**
 * Confirm the page we fetched belongs to our channel before trusting
 * any video id found in it. YouTube's page HTML embeds the channel id
 * in multiple places in its serialised data. If LIVESTREAM_CHANNEL_ID
 * does not appear at all, we fetched the wrong page (redirect, layout
 * change, geo-block interstitial, etc.) and must not use any id from it.
 */
function belongsToOurChannel(html: string): boolean {
  if (!LIVESTREAM_CHANNEL_ID) return true; // no id configured → skip check
  return html.includes(LIVESTREAM_CHANNEL_ID);
}

export async function GET() {
  for (const url of LIVE_PAGES) {
    try {
      const response = await fetch(url, {
        headers: HEADERS,
        // The page is 1-2 MB of markup and the reader is waiting on it
        // behind a play button, so a slow answer is a wrong answer.
        signal: AbortSignal.timeout(4000),
        cache: "no-store",
      });
      if (!response.ok) continue;

      const html = await response.text();

      // Guard: verify this page belongs to our channel before reading
      // any video id from it. Protects against redirects or layout
      // changes that land on a generic YouTube page.
      if (!belongsToOurChannel(html)) continue;

      const videoId = canonicalVideoId(html);
      if (!videoId) continue;

      return Response.json(
        { videoId, live: isLiveNow(html) },
        {
          headers: {
            // 30 seconds at the CDN, so a full congregation opening the
            // page at 07:00 costs YouTube a handful of requests rather
            // than one each, and a stream that starts is picked up
            // within half a minute.
            "cache-control": "public, s-maxage=30, stale-while-revalidate=60",
          },
        },
      );
    } catch {
      // Timeout, network refusal, or a body that could not be read.
      // Try the next URL, then give up quietly — see the note above on
      // why every failure here is the current behaviour and not a break.
      continue;
    }
  }

  return Response.json(
    { videoId: null, live: false },
    { headers: { "cache-control": "public, s-maxage=15" } },
  );
}
