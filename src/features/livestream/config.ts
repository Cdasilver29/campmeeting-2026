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
