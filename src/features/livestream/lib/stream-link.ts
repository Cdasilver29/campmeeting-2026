import { program } from "@/data";
import { wallClock } from "@/features/schedule/lib/time";
import { RECORDING_PARTS, recordings, type RecordingPart } from "../config";

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
 * ── WHERE THE MORNING ENDS: 13:00 EAT ────────────────────────────────
 *
 * One constant rather than a per-day boundary derived from the programme,
 * because the programme leaves a wide and consistent gap and a single
 * number that sits inside all eight of them is easier to reason about than
 * eight computed ones.
 *
 * Checked against every day in program.ts. The latest a morning runs is
 * 12:45 (the weekday Mid Morning Services); the earliest an afternoon
 * starts is 13:30 (Sunday). 13:00 is inside the break on all eight days,
 * with 15 minutes of clearance on one side and 30 on the other. Sunday's
 * Medical Camp and Friday's Sabbath Preparation are untimed and do not
 * narrow it.
 *
 * If the programme is retimed so that a morning runs past 13:00 or an
 * afternoon starts before it, this number moves with it.
 */
export const MORNING_ENDS = "13:00";

/** Which half of the day an event-local "HH:MM" falls in. */
export function partAt(time: string): RecordingPart {
  return time < MORNING_ENDS ? "morning" : "afternoon";
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
  const { date, time } = wallClock(now);
  const anchor = anchorByDate.get(date)?.[partAt(time)];
  return anchor ? `${LIVESTREAM_PATH}#${anchor}` : LIVESTREAM_PATH;
}
