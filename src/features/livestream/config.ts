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
 * ── THE ARCHIVE AND THE LIVE LOOP ARE NOW DIFFERENT VIDEOS ───────────
 *
 * These two started life as the same ids the live player uses, because on
 * the opening day the broadcast and the recording of it were one YouTube
 * object. They are not any more: the church has published edited sermon
 * cuts of the two halves of Sabbath 15, and those are what somebody
 * catching up wants — a sermon with a title, not eight hours of stream.
 *
 * So `recordings` below holds a83sJFk7bB0 and -5LBJ9QHyJw, and
 * `liveStreams` further down holds vPsSmmV-Vps and MT1z3LU1IL4. No id
 * appears in both arrays, and that separation is the point of having two:
 * the live player embeds what is going out now, the archive lists what has
 * been published since. Changing one must not change the other.
 *
 * The day is still ASSUMED to be the opening Sabbath, 15th August, day 1.
 * If these belong elsewhere, change `dayId` on both lines and nothing else.
 *
 * Neither id carries a `?si=` share token; both are the bare eleven
 * characters. `-5LBJ9QHyJw` beginning with a hyphen is normal — the id
 * alphabet includes `-` and `_`, and it is not a stray character.
 */
export const recordings: Recording[] = [
  { dayId: "sabbath-15", part: "morning", label: "Morning Sermon — You Are on a Subscription Fee", videoId: "a83sJFk7bB0" },
  { dayId: "sabbath-15", part: "afternoon", label: "Afternoon/Evening Sermon — The Game Is Not Over", videoId: "-5LBJ9QHyJw" },
];

/**
 * The stream that is AIRING, per day and per half-day.
 *
 * ── WHY THIS IS NOT `recordings` ─────────────────────────────────────
 *
 * A recording is a finished upload somebody has watched and can label. A
 * live entry is the broadcast currently going out, typed in before or
 * during it, and it is what the player embeds. The two happen to hold the
 * same eleven characters for the same broadcast — a YouTube stream keeps
 * its id when it stops being live and becomes a video — but they are
 * filled in at different times, by different people, for different parts
 * of the page, and merging them would mean the archive could not list a
 * video until the player was ready to embed it, or the reverse.
 *
 * ── WHY NOT JUST LET YOUTUBE FIND IT ─────────────────────────────────
 *
 * The player used to embed `live_stream?channel=…`, which asks YouTube to
 * resolve whatever the channel is broadcasting. On the opening morning it
 * answered "This video is unavailable" at 08:37 while vPsSmmV-Vps was
 * genuinely live. Whatever the cause, the answer is not to depend on the
 * lookup: a known id embeds a known stream. The channel embed stays as the
 * fallback for a day nobody has typed ids for yet — see
 * components/live-embed.tsx for the full order.
 *
 * ── HOW TO ADD ONE ───────────────────────────────────────────────────
 *
 * Two lines a day, ideally before the morning goes out. Order in this
 * array does not matter; it is looked up by day and part.
 *
 *   { dayId: "sunday-16", part: "morning", videoId: "dQw4w9WgXcQ" },
 *   { dayId: "sunday-16", part: "afternoon", videoId: "aBcDeFgHiJk" },
 *
 * `dayId` and `videoId` follow exactly the rules `recordings` above sets
 * out: a day id from src/data/program.ts, and the 11 characters after
 * `v=` in a watch URL — never the URL, and never the `?si=…` a share
 * button appends. A day with no entry falls back to the channel embed
 * rather than breaking, so a morning that gets away from you degrades to
 * the behaviour the page had before this existed.
 *
 * Which of the two is showing at any moment is decided from the
 * PROGRAMME, not from a fixed clock time — the afternoon starts at 14:00
 * on Sabbath and 13:30 on Sunday. See lib/stream-link.ts.
 */
export interface LiveStream {
  /** A day id from src/data/program.ts. */
  dayId: string;
  /** Which half of the day this broadcast covers. */
  part: RecordingPart;
  /** The 11-character YouTube video id, not a URL. */
  videoId: string;
}

export const liveStreams: LiveStream[] = [
  { dayId: "sabbath-15", part: "morning", videoId: "vPsSmmV-Vps" },
  { dayId: "sabbath-15", part: "afternoon", videoId: "MT1z3LU1IL4" },
  { dayId: "sunday-16", part: "afternoon", videoId: "kX9mQ2vLp3A" },
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
