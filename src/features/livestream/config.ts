import { eventInfo } from "@/data";

/**
 * YouTube needs either a specific video/stream id or the channel's UC...
 * id as an embed src — the vanity URL cannot be embedded directly.
 *
 * - LIVESTREAM_CHANNEL_ID: the channel's UC... id. `live_stream?channel=`
 *   resolves whatever that channel is broadcasting at the moment the
 *   visitor presses play, so the embed needs no per-event edit and no
 *   video id chosen ahead of time. This is the normal path.
 * - LIVESTREAM_VIDEO_ID: a specific video or stream id. Deliberately
 *   unset. It exists only to pin one recording later (a re-run of a
 *   particular meeting, say) and takes priority over the channel when set,
 *   which would freeze the embed on that video for everyone.
 */
export const LIVESTREAM_VIDEO_ID: string | undefined = undefined;

/** Verified channel id for youtube.com/@NewlifeSDAChurchNairobi. */
export const LIVESTREAM_CHANNEL_ID: string | undefined =
  "UCU4gnC-uS7GPT27rUxBs_Fw";

/**
 * The human-facing channel link, for the "watch on YouTube" fallbacks.
 * Read from event.ts rather than repeated here so the site has one
 * YouTube URL, not two that can drift apart.
 */
export const LIVESTREAM_CHANNEL_URL =
  eventInfo.social.youtube ?? eventInfo.church.website;

/**
 * ── TWO STREAMS A DAY ────────────────────────────────────────────────
 *
 * The week is broadcast in two halves, not one: a morning stream and an
 * afternoon stream, every day. So a recording is identified by its day AND
 * its half, and this is a closed set of two rather than free text — the
 * archive lays out a fixed grid of eight days by two parts, and a third
 * value would have nowhere to land in it.
 *
 * The names are the halves of the DAY, not of the programme's blocks. A
 * morning stream runs across the Morning Service and whatever follows it
 * before the break; an afternoon stream picks up from the Afternoon
 * Program. The programme's own block labels stay in program.ts, where
 * they are exact.
 */
export type RecordingPart = "morning" | "afternoon";

/** Both parts, in the order a day runs them. The archive's column order. */
export const RECORDING_PARTS: readonly RecordingPart[] = [
  "morning",
  "afternoon",
] as const;

/** What each part is called on the page. */
export const PART_LABEL: Record<RecordingPart, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
};

/**
 * One recording of one half of one day, as posted to the church's channel.
 *
 * ── HAND-MAINTAINED, AND THAT IS THE DECISION ────────────────────────
 *
 * The YouTube Data API would fill this in on its own and is the wrong
 * trade for sixteen videos a year: an API key to hold and rotate, a daily
 * quota to stay under, and a rebuild trigger to wire up so a statically
 * generated site notices a video that appeared after its last deploy.
 * All of that to save sixteen lines of typing, in a week that already has
 * someone at a laptop. Do not add it.
 *
 * ── HOW TO ADD ONE ───────────────────────────────────────────────────
 *
 * Append an entry. Order in this array does not matter — the archive is
 * laid out from `program`, day 1 to day 8, and each entry is slotted into
 * its day and part wherever it was typed. See DEPLOY.md.
 *
 *   { dayId: "sabbath-15", part: "morning", videoId: "dQw4w9WgXcQ" }
 *
 * `dayId` is a day id from src/data/program.ts, so each recording links to
 * the programme it is a recording OF: sabbath-15, sunday-16, monday-17,
 * tuesday-18, wednesday-19, thursday-20, friday-21, sabbath-22. An id that
 * is not one of those FAILS THE BUILD rather than shipping a link to a
 * missing day — as does the same day and part twice, which would be one
 * video silently overwriting another. See lib/recordings.ts.
 *
 * `videoId` is the 11 characters after `v=` in a watch URL, not the URL,
 * and NOT the `?si=...` that a YouTube share button appends. That is a
 * share-tracking token belonging to whoever copied the link; it is not
 * part of the id and it is stripped before the id is written here.
 */
export interface Recording {
  /** A day id from src/data/program.ts. */
  dayId: string;
  /** Which half of the day this is the stream of. */
  part: RecordingPart;
  /**
   * What the recording is, where that is known and is more than the part
   * already says: "Divine Service", "Morning Devotion". The day and the
   * part are written around it, so do not repeat either.
   *
   * OPTIONAL, and the fallback is the part's own name. A stream covers a
   * whole half-day and usually several items of the programme, so there
   * is often no one honest answer — and a label invented for a video
   * nobody here has watched would be a claim about its contents printed
   * on a public page. Absent, the row reads "Morning", which is true.
   */
  label?: string;
  /** The 11-character YouTube video id, not a URL. */
  videoId: string;
}

/**
 * ── THE FIRST TWO, AND THE DAY THEY ARE ASSIGNED TO ──────────────────
 *
 * ASSUMED to be the opening Sabbath, 15th August, which is day 1. The two
 * ids were supplied without a day. Sabbath 15 is much the likeliest — they
 * are the first two videos of the week and the week opens on it — but it
 * is an assumption and it is recorded as one here rather than left to be
 * discovered from a wrong link. If they belong to another day, change
 * `dayId` on both lines and nothing else.
 */
export const recordings: Recording[] = [
  { dayId: "sabbath-15", part: "morning", label: "Morning Service", videoId: "vPsSmmV-Vps" },
  { dayId: "sabbath-15", part: "afternoon", label: "Afternoon and Evening", videoId: "MT1z3LU1IL4" },
];

/** A watch URL from a video id. One place, so the shape cannot drift. */
export function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * The cover image for a recording: YouTube's own thumbnail for the video.
 *
 * ── THIRD-PARTY, AND IT STAYS THAT WAY ON PURPOSE ────────────────────
 *
 * `img.youtube.com` is not this site's origin and this URL is deliberately
 * not run through next/image. The optimizer would re-serve it from
 * `/_next/image?url=…`, which IS this origin — and a same-origin image is
 * one the service worker's default runtime rules would happily cache,
 * which is precisely what must not happen. Left as a bare cross-origin
 * URL it is matched by the NetworkOnly rule in src/sw.ts and is never
 * stored. It is also never in the precache manifest, which is built from
 * the site's own output and from public/ and cannot contain a URL on
 * somebody else's host.
 *
 * Rendered by a plain lazy <img>. See components/recordings-list.tsx.
 *
 * `hqdefault` is 480x360 and exists for every video. The `maxres` variant
 * does not — it 404s on any stream YouTube has not made one for, which
 * would be a broken image on the page whose job is catching people up.
 */
export function thumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/** The thumbnail's intrinsic size, for reserving its space before it loads. */
export const THUMBNAIL_WIDTH = 480;
export const THUMBNAIL_HEIGHT = 360;
