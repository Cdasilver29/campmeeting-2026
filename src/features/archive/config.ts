/** Where the archive lives. One constant, so the path cannot drift. */
export const ARCHIVE_PATH = "/archive";

/** A watch URL from a video id. */
export function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** The public page for a playlist, for the link-out beside each embed. */
export function playlistUrl(playlistId: string): string {
  return `https://www.youtube.com/playlist?list=${playlistId}`;
}

/**
 * The privacy-preserving embed for a whole playlist.
 *
 * `youtube-nocookie.com`, like the live player, and mounted only after
 * the visitor presses play — see components/playlist-embed.tsx. Neither
 * half is decoration: this page carries six of these, and eagerly framed
 * they would be six YouTube connections opened by anybody who so much as
 * scrolled past.
 */
export function playlistEmbedUrl(playlistId: string): string {
  return `https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}&playsinline=1`;
}

/**
 * The cover image for a recording: YouTube's own thumbnail.
 *
 * ── THIRD-PARTY, AND IT STAYS THAT WAY ON PURPOSE ────────────────────
 *
 * `img.youtube.com` is not this site's origin and this URL is deliberately
 * not run through next/image. The optimizer would re-serve it from
 * `/_next/image?url=…`, which IS this origin — and a same-origin image is
 * one the service worker's default runtime rules would happily cache,
 * which is precisely what must not happen.
 *
 * Left as a bare cross-origin URL it is matched by the NetworkOnly rule
 * in src/sw.ts — `isThirdPartyHost` in src/lib/pwa.ts matches on the
 * registrable suffix, and `img.youtube.com` ends with `.youtube.com` — so
 * it is never written to a cache. It is also never in the precache
 * manifest, which is built from this site's own output and from public/
 * and cannot contain a URL on somebody else's host at all.
 *
 * That is the same discipline the gallery photographs are held to, by a
 * different mechanism: those are ours, so they need an explicit rule in
 * src/app/serwist/[path]/route.ts; these are not ours, so they cannot get
 * in.
 *
 * Rendered by a plain lazy <img>. See components/video-card.tsx.
 *
 * `hqdefault` is 480x360 and exists for every video. The `maxres` variant
 * does not — it 404s on any video YouTube has not made one for, which
 * would be a broken image on the page whose whole job is finding a
 * recording.
 */
export function thumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/** The thumbnail's intrinsic size, for reserving its space before it loads. */
export const THUMBNAIL_WIDTH = 480;
export const THUMBNAIL_HEIGHT = 360;
