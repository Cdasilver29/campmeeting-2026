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
 * ── THE RECORDINGS ARCHIVE IS NOT HERE ANY MORE ──────────────────────
 *
 * This file used to carry the whole of it: a `Recording` type, a
 * hand-maintained `recordings` array of past broadcasts, a two-value
 * `RecordingPart`, and the thumbnail and watch-URL helpers. /livestream
 * rendered the week as a grid of them underneath the player.
 *
 * All of it has moved to src/data/archive and src/features/archive, and
 * the move was structural rather than tidying. The archive there is keyed
 * by YEAR and by ISO DATE; this file's version was keyed by `dayId` from
 * src/data/program.ts, which is replaced wholesale every year. That made
 * a finished, unchanging record depend on the one file guaranteed to
 * change — so 2027's programme swap would have taken 2026's recordings
 * with it.
 *
 * What is left here is live viewing, which is the one thing this page is
 * for and the one thing that genuinely cannot be settled ahead of time:
 * the channel id, the global override, and the channel URL. The detection
 * path — /api/live-now, the channel lock, click-to-load — is untouched by
 * the move.
 *
 * Do not add a video id to this file for anything other than the global
 * override above. A finished recording belongs in src/data/archive.
 */
