/**
 * Where the livestream page lives.
 *
 * ── WHAT USED TO BE HERE, AND WHY IT IS NOT ──────────────────────────
 *
 * This file used to decide which specific video was "live right now": it
 * read each day's `afternoon-program` block out of program.ts to derive a
 * per-day morning/afternoon boundary, turned the Nairobi clock into a
 * (dayId, part) pair, and looked that pair up in a hand-maintained
 * `liveStreams` array to pin an exact video id on the player.
 *
 * All of it is gone, and deliberately. A mistyped id in that array took
 * a live broadcast off the site during the week: pinning an id that did
 * not exist OVERRODE the channel embed, which had been resolving the
 * real broadcast on its own the whole time. The failure was not one bad
 * character — it was that the mechanism could fail at all, silently, and
 * only during the broadcast it was meant to serve.
 *
 * The channel embed needs no per-session configuration, cannot be typed
 * wrong, and is right by construction: it asks YouTube what this channel
 * is broadcasting at the moment somebody presses play. So it is the only
 * mechanism for live viewing now, not a fallback of last resort. See
 * components/live-embed.tsx.
 *
 * ── AND `slotAnchorId` WENT WITH THE ARCHIVE ─────────────────────────
 *
 * There was one more export here: the DOM id of a slot in the "Earlier
 * this week" grid, so a link could land on the half of the day a reader
 * was in. The grid it addressed has moved to /archive, which is organised
 * by theme rather than by half-day, so there is no slot left to anchor.
 *
 * Nothing outside this feature ever imported it, and nothing linked to
 * one of those anchors from another page — the only caller was the
 * recordings list itself. A hash is never sent to the server either, so
 * an old `#stream-tuesday-18-morning` bookmark cannot 404: it resolves to
 * /livestream, which still exists, and lands at the top of the page.
 * There is nothing to redirect.
 */

export const LIVESTREAM_PATH = "/livestream";
