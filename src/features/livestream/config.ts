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
 * One recording of one meeting, as posted to the church's channel.
 *
 * ── HAND-MAINTAINED, AND THAT IS THE DECISION ────────────────────────
 *
 * The YouTube Data API would fill this in on its own and is the wrong
 * trade for eight videos a year: an API key to hold and rotate, a daily
 * quota to stay under, and a rebuild trigger to wire up so a statically
 * generated site notices a video that appeared after its last deploy.
 * All of that to save eight lines of typing, once, in a week that already
 * has someone at a laptop. Do not add it.
 *
 * ── HOW TO ADD ONE ───────────────────────────────────────────────────
 *
 * Append an entry. Order in this array does not matter — the list is
 * sorted by the day's own position in `program`, newest first, so a line
 * pasted at the end lands in the right place. See DEPLOY.md.
 *
 *   { dayId: "sabbath-15", label: "Divine Service", videoId: "dQw4w9WgXcQ" }
 *
 * `dayId` is a day id from src/data/program.ts, so each recording links to
 * the programme it is a recording OF: sabbath-15, sunday-16, monday-17,
 * tuesday-18, wednesday-19, thursday-20, friday-21, sabbath-22. An id that
 * is not one of those FAILS THE BUILD rather than shipping a link to a
 * missing day — see lib/recordings.ts.
 *
 * `videoId` is the 11 characters after `v=` in a watch URL, not the URL.
 * `label` is what that recording is, and the day is added around it, so
 * write "Divine Service" and not "Sabbath 15th August Divine Service".
 */
export interface Recording {
  /** A day id from src/data/program.ts. */
  dayId: string;
  /** What the recording is. The day is supplied around it. */
  label: string;
  /** The 11-character YouTube video id, not a URL. */
  videoId: string;
}

/**
 * DELIBERATELY EMPTY, and it is not a placeholder to be filled with
 * examples. Nothing has been recorded yet. The after phase and the
 * catch-up slot both read as "recordings are coming" while this is empty,
 * which is the true state and the one that ships until camp meeting.
 */
export const recordings: Recording[] = [];

/** A watch URL from a video id. One place, so the shape cannot drift. */
export function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
