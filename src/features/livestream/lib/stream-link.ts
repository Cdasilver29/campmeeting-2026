import type { RecordingPart } from "../config";

/**
 * Where the livestream page lives, and how one slot of its archive is
 * addressed.
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
 * ── AND THE ARCHIVE ANCHOR WENT WITH IT ──────────────────────────────
 *
 * `currentStreamHref` used the same boundary to point the hero's "Watch
 * live" button at a slot in "Earlier this week" once the event was over.
 * That branch was already unreachable and was verified so before it was
 * deleted: `eventPhase` only returns "after" from 2026-08-23, by which
 * date the clock is never on a programme day, so the anchor lookup could
 * never hit. The button is a plain link to this path now.
 *
 * What survives is what the ARCHIVE needs, which is a different system on
 * different data — individually checked ids for broadcasts that have
 * finished — and is untouched by any of the above.
 */

export const LIVESTREAM_PATH = "/livestream";

/**
 * The DOM id of one slot in the archive.
 *
 * Rendered on the catch-up copy of the list only — see the note in
 * components/recordings-list.tsx. The page carries the after-phase copy of
 * the same list in its markup as well, and two elements with one id is a
 * broken anchor, not a duplicate one.
 */
export function slotAnchorId(dayId: string, part: RecordingPart): string {
  return `stream-${dayId}-${part}`;
}
