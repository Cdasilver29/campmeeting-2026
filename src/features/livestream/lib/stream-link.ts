import { program } from "@/data";
import { eventPhase, wallClock } from "@/features/schedule/lib/time";
import {
  liveStreams,
  RECORDING_PARTS,
  recordings,
  type RecordingPart,
} from "../config";

/**
 * Which of a day's two streams is the one to send somebody to right now,
 * and where on /livestream it lives.
 *
 * The home hero's "Watch live" button is the caller. It goes to
 * /livestream either way — the live player is there and that is what the
 * button is for — but during the week it lands on the half of the day the
 * viewer is actually in, so somebody opening the site at four in the
 * afternoon does not arrive at a page of sixteen cards and have to find
 * theirs.
 */

/**
 * ── WHERE THE MORNING ENDS, PER DAY, FROM THE PROGRAMME ──────────────
 *
 * This was one constant, 13:00, chosen because it sits inside the midday
 * break on all eight days. That was fine for deciding which ANCHOR to
 * scroll to and is not fine for deciding which VIDEO to embed: between
 * 13:00 and 14:00 on six of the eight days the afternoon has not started,
 * so a 13:00 boundary would have put the afternoon stream on screen for an
 * hour before there was anything on it.
 *
 * So the boundary is read from the programme, per day:
 *
 *   THE AFTERNOON BEGINS WHEN THE AFTERNOON PROGRAMME BEGINS — the
 *   earliest `start` among the sessions of that day's `afternoon-program`
 *   block. Everything before it is the morning.
 *
 * Derived, per day in program.ts:
 *
 *   sabbath-15   14:00     wednesday-19  14:00
 *   sunday-16    13:30     thursday-20   14:00
 *   monday-17    14:00     friday-21     13:00  (fallback, see below)
 *   tuesday-18   14:00     sabbath-22    14:00
 *
 * The morning STREAM therefore keeps running through the midday break,
 * which is the honest answer: the morning broadcast is the last one that
 * was live, and the afternoon one does not exist yet. It is also what a
 * viewer opening the page at 13:15 wants, since the thing they most
 * likely missed is the morning.
 *
 * FRIDAY IS THE ONE FALLBACK. Its afternoon block is real but has no timed
 * sessions — it is the untimed "Sabbath Preparation" all-block activity,
 * and the committee has confirmed there is no Friday evening service. With
 * no start time to read, the day keeps the old 13:00 constant. That is
 * also the safest value for a day with no afternoon programme to broadcast.
 *
 * The block is found by id, `afternoon-program`, which every one of the
 * eight days uses. A day without one falls back the same way Friday does
 * rather than throwing.
 */
export const MORNING_ENDS_FALLBACK = "13:00";

const AFTERNOON_BLOCK_ID = "afternoon-program";

/** Earliest start time in a day's afternoon block, or undefined. */
function afternoonStart(dayId: string): string | undefined {
  const day = program.find((entry) => entry.id === dayId);
  const block = day?.blocks.find((b) => b.id === AFTERNOON_BLOCK_ID);
  const starts = (block?.sessions ?? [])
    .map((session) => session.start)
    .filter((start): start is string => Boolean(start));
  if (starts.length === 0) return undefined;
  return starts.reduce((a, b) => (a < b ? a : b));
}

/**
 * Computed once at module load, not per call. Eight days, and the
 * programme cannot change between renders.
 */
const boundaryByDate = new Map<string, string>(
  program.map((day) => [
    day.date,
    afternoonStart(day.id) ?? MORNING_ENDS_FALLBACK,
  ]),
);

/** Where the morning ends on a given event-local date. */
export function morningEndsOn(date: string): string {
  return boundaryByDate.get(date) ?? MORNING_ENDS_FALLBACK;
}

/**
 * Which half of the day an event-local date and time falls in.
 *
 * Takes the DATE as well as the time now, because the answer differs by
 * day. A date outside the week has no programme to read and takes the
 * fallback, which keeps this total rather than optional.
 */
export function partAt(date: string, time: string): RecordingPart {
  return time < morningEndsOn(date) ? "morning" : "afternoon";
}

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

export const LIVESTREAM_PATH = "/livestream";

/**
 * Date to part to anchor, for the slots that have a recording. Keyed by
 * the programme day's DATE rather than its id, because that is what a
 * clock gives back.
 */
const anchorByDate = new Map<string, Partial<Record<RecordingPart, string>>>();

for (const day of program) {
  const parts: Partial<Record<RecordingPart, string>> = {};
  for (const part of RECORDING_PARTS) {
    const posted = recordings.some(
      (entry) => entry.dayId === day.id && entry.part === part,
    );
    if (posted) parts[part] = slotAnchorId(day.id, part);
  }
  if (Object.keys(parts).length > 0) anchorByDate.set(day.date, parts);
}

/**
 * Where "Watch live" should point, on Africa/Nairobi wall-clock.
 *
 * Plain /livestream unless today is a programme day AND the stream for
 * this half of the day has been posted. Both conditions matter: outside
 * the week there is no day to jump to, and inside it there is no sense
 * linking to a card that reads "Not posted yet" when the live player at
 * the top of the page is the better answer.
 *
 * The viewer's own timezone is never consulted. Someone watching from
 * London in their evening is in the campground's evening too, which is the
 * rule the whole schedule is built on.
 */
export function currentStreamHref(now: Date): string {
  /*
   * ── DURING THE EVENT THE ANSWER IS THE PLAYER, NOT THE ARCHIVE ─────
   *
   * This used to hand back an anchor into "Earlier this week" whenever
   * today's slot had a video posted — which, now that the ids are typed
   * in on the morning of, is most of the week. So a button labelled
   * "Watch live" scrolled the reader PAST the live player and down to a
   * card for a broadcast that had already finished. The anchor was
   * written when the player was a channel embed nobody could point at;
   * it is a real, day-specific stream now.
   *
   * So: during the event, plain /livestream, which lands on the player.
   * The anchor survives only in the `after` phase, where there is no
   * live stream and the archive IS the page.
   */
  if (eventPhase(now) !== "after") return LIVESTREAM_PATH;

  const { date, time } = wallClock(now);
  const anchor = anchorByDate.get(date)?.[partAt(date, time)];
  return anchor ? `${LIVESTREAM_PATH}#${anchor}` : LIVESTREAM_PATH;
}

/**
 * Which day and half of the week it is right now, or undefined outside it.
 *
 * The one place the clock is turned into a (dayId, part) pair. Both the
 * "Watch live" anchor above and the player's video id below are decided
 * from it, so the button and the player cannot disagree about which half
 * of the day it is.
 */
const dayIdByDate = new Map(program.map((day) => [day.date, day.id]));

export interface LiveSlot {
  dayId: string;
  part: RecordingPart;
}

export function currentSlot(now: Date): LiveSlot | undefined {
  const { date, time } = wallClock(now);
  const dayId = dayIdByDate.get(date);
  if (!dayId) return undefined;
  return { dayId, part: partAt(date, time) };
}

/**
 * The video id of the stream that should be airing right now, if somebody
 * has typed it in for today.
 *
 * Undefined outside the week, and undefined for a day whose ids have not
 * been added yet — both of which the player treats as "fall back to the
 * channel embed" rather than as an error. See config.ts for how to add a
 * day, and components/live-embed.tsx for the full priority order.
 */
export function currentLiveVideoId(now: Date): string | undefined {
  const slot = currentSlot(now);
  if (!slot) return undefined;
  return liveStreams.find(
    (entry) => entry.dayId === slot.dayId && entry.part === slot.part,
  )?.videoId;
}
