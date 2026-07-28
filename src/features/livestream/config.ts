/**
 * ── COMMITTEE OWES THIS ──────────────────────────────────────────────
 * Neither id below is known yet. youtube.com/c/NewlifeSDAChurchNairobi
 * is a vanity URL and cannot be used as an embed src directly — YouTube
 * needs either a specific video/stream id or the channel's UC... id.
 * Set one of the two constants below when the committee has it; nothing
 * else in the livestream feature needs to change.
 *
 * - LIVESTREAM_VIDEO_ID: a specific video or stream id, once scheduled
 *   (takes priority if both are set).
 * - LIVESTREAM_CHANNEL_ID: the channel's UC... id, for "whatever this
 *   channel is currently streaming" without picking a video ahead of time.
 *
 * Until one is set, the livestream page links out to the channel instead
 * of attempting an embed.
 */
export const LIVESTREAM_VIDEO_ID: string | undefined = undefined;
export const LIVESTREAM_CHANNEL_ID: string | undefined = undefined;

/** Known today: the vanity channel URL, safe to link to at any time. */
export const LIVESTREAM_CHANNEL_URL =
  "https://www.youtube.com/c/NewlifeSDAChurchNairobi";
