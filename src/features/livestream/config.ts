import { eventInfo } from "@/data";

/**
 * YouTube needs either a specific video/stream id or the channel's UC...
 * id as an embed src — the vanity URL cannot be embedded directly.
 *
 * - LIVESTREAM_CHANNEL_ID: the channel's UC... id. `live_stream?channel=`
 *   resolves whatever that channel is broadcasting at the moment the
 *   visitor presses play, so the embed needs no per-event edit and no
 *   video id chosen ahead of time. THIS IS THE PATH. Live viewing has no
 *   other mechanism and needs none.
 * - LIVESTREAM_VIDEO_ID: a specific video or stream id. Deliberately
 *   unset, and it is a global override rather than anything per-day: it
 *   exists to pin one video for everybody (a re-run of a particular
 *   meeting, say) and takes priority over the channel when set, which
 *   freezes the embed on that video until it is unset again.
 *
 * ── WHY THERE IS NO PER-DAY LIVE ID ANY MORE ─────────────────────────
 *
 * There used to be a `liveStreams` array here holding two ids a day, one
 * per half of the day, looked up against a boundary derived from
 * program.ts. It was removed after a mistyped id took a live broadcast
 * off the site mid-week — a pinned id that did not exist beat the channel
 * embed, which had been resolving the real stream correctly on its own.
 *
 * The lesson taken was not "check the ids harder". It was that a
 * mechanism which can silently point the player at the wrong video, and
 * whose failure only shows during the broadcast it exists to serve, is
 * not worth what it bought — and it bought nothing the channel lookup was
 * not already delivering. Do not reintroduce it.
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
  afternoon: "Evening",
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
 * ── THE ARCHIVE IS THE ONLY PLACE VIDEO IDS LIVE NOW ─────────────────
 *
 * These are PAST broadcasts, and that is what makes ids the right tool
 * here where they were the wrong one for live viewing. A recording is
 * finished: somebody has watched it, checked the id resolves, and given
 * it a title. It is verifiable before it ships and it does not change
 * under anybody. The live player, by contrast, was being handed ids for
 * broadcasts that had not started yet — unverifiable by definition, and
 * wrong in a way nobody could see until the stream was on.
 *
 * So this array stays exactly as it is, and it is not a fallback for
 * anything: it fills "Earlier this week", and the live player never
 * reads it.
 *
 * These hold edited sermon cuts rather than the raw stream, which is what
 * somebody catching up wants — a sermon with a title, not eight hours of
 * broadcast.
 *
 * No id here carries a `?si=` share token, a `&list=`, an `&index=` or a
 * `&t=`. Those are a playlist position and a timestamp belonging to
 * whoever copied the link, not part of the id, and they are stripped
 * before an id is written down. `-5LBJ9QHyJw` beginning with a hyphen is
 * normal — the id alphabet includes `-` and `_`, and it is not a stray
 * character.
 *
 * ── EVERY ID IS OEMBED-CHECKED BEFORE IT IS COMMITTED ────────────────
 *
 * `https://www.youtube.com/oembed?url=…&format=json` returns the title
 * and the channel for a real id and 404s for one that is wrong. A wrong
 * id took a live broadcast off the site earlier this week, and the labels
 * below are written FROM what oembed returned rather than from what
 * anybody expected it to say — which is the check that catches a video
 * that exists but is the wrong meeting. All five have been through it and
 * all five are on the church's own channel.
 *
 * ── DAY 2 HAS NO MORNING LINE, AND THAT IS NOT AN OMISSION ───────────
 *
 * There was no morning sermon on Sunday the 16th: the morning is the
 * Medical Camp. No entry is written for it, and the archive draws no
 * Day 2 morning slot at all rather than a "not posted yet" frame
 * promising a video that does not exist. See lib/recordings.ts.
 */
export const recordings: Recording[] = [
  { dayId: "sabbath-15", part: "morning", label: "Morning Sermon — You Are on a Subscription Fee", videoId: "a83sJFk7bB0" },
  { dayId: "sabbath-15", part: "afternoon", label: "Afternoon/Evening Sermon — The Game Is Not Over", videoId: "-5LBJ9QHyJw" },
  // Preached by Ev. Andrew Owino, per the channel's own title — the same
  // man the committee has just given the five weekday Bible Studies to.
  // The label follows the two above and names the sermon, not the
  // preacher; the programme is where credits belong.
  { dayId: "sunday-16", part: "afternoon", label: "Evening Sermon — Obey and Enjoy", videoId: "GyLV5dkqpDw" },
  // The channel's title sets this one as "''The Bishop's Bedroom'" with
  // unbalanced quotes. Quoted plainly here, which is how the other four
  // are set; the words are untouched.
  { dayId: "monday-17", part: "morning", label: "Morning Sermon — The Bishop's Bedroom", videoId: "bWHo14MGJ44" },
  { dayId: "monday-17", part: "afternoon", label: "Evening Sermon — New Level, New Evil", videoId: "fpcfaILn4V0" },
  { dayId: "tuesday-18", part: "morning", label: "Morning Sermon — ''In The Right Place, But...''", videoId: "uwoFZyIBakU" },
  { dayId: "tuesday-18", part: "afternoon", label: "Evening Sermon — \"Spot the Difference\"", videoId: "BXH4YXR-Y94" },
  { dayId: "wednesday-19", part: "morning", label: "Morning Sermon — \"Life Is Complicated, You Never Know\"", videoId: "SgfedHK75do" },
  { dayId: "wednesday-19", part: "afternoon", label: "Evening Sermon — \"Unstable as Water\"", videoId: "fAHYbQfipQo" },
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
