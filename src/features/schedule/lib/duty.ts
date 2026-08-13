import {
  dutyByDayId,
  program,
  type DayDuty,
  type DutyShift,
  type DutyTeamId,
  type ProgramDay,
} from "@/data";
import type { EventPhase, WallClock } from "./time";

/**
 * The teams in the order the panel reads them, with the label each one
 * gets. Order is a decision: elders first because there are one or two of
 * them and they are who a member actually goes to find, choristers last
 * because there are always exactly four and they are the least likely
 * thing anybody is looking up.
 */
export const dutyTeams: { id: DutyTeamId; label: string }[] = [
  { id: "elders", label: "Elders" },
  { id: "deacons", label: "Deacons" },
  { id: "deaconesses", label: "Deaconesses" },
  { id: "choristers", label: "Choristers" },
];

/**
 * Where the morning shift ends.
 *
 * From `Diaconete.txt`, which is the only source that puts clock times on
 * the shifts: "7AM-1PM" then "1PM-6PM" on four of the five weekdays, and
 * "2PM-6PM" on Thursday. 13:00 is therefore the boundary the rota itself
 * uses, and the one Thursday afternoon that starts at 14:00 only means
 * the panel calls the 13:00 hour "afternoon" an hour early on that day.
 *
 * This ONLY decides which of the two shifts is marked as running now. It
 * never decides what the panel shows: both shifts are always printed.
 */
const AFTERNOON_FROM = "13:00";

export interface DutyPanel {
  day: ProgramDay;
  duty: DayDuty;
  /**
   * How the panel introduces the day it is showing. Empty during the
   * event, where the day's own label already says it and a second line
   * saying "today" would be telling the reader what they can see.
   */
  lead?: string;
  /** The shift running now, or undefined outside the event and its days. */
  currentShift?: DutyShift;
}

/**
 * Which day's rota to show.
 *
 *   during  today's, resolved from the Africa/Nairobi wall clock — the
 *           same clock and the same 30-second tick the Next Up card runs
 *           on, so the two never disagree about what day it is
 *   before   the opening Sabbath's, because that is the next rota that
 *           will be true and the one somebody planning is reading for
 *   after    the closing Sabbath's, which is the last one that was true
 *
 * There is deliberately NO day picker. The panel answers one question and
 * the answer is today; anyone who wants another day wants the programme,
 * which is a link away.
 *
 * Returns undefined only if the data ever loses a day, which the types
 * make hard and `duty.ts` covers all eight of.
 */
export function getDutyPanel(
  phase: EventPhase,
  now: WallClock,
): DutyPanel | undefined {
  const first = program[0];
  const last = program.at(-1);

  // Two or three words. The lead sits inside the card's uppercase
  // eyebrow, and a sentence set that way wraps to two lines and reads as
  // a headline rather than as a label.
  const { day, lead } =
    phase === "before" && first
      ? { day: first, lead: "Opening day" }
      : phase === "after" && last
        ? { day: last, lead: "Final day" }
        : {
            day: program.find((d) => d.date === now.date),
            lead: undefined,
          };

  if (!day) return undefined;
  const duty = dutyByDayId[day.id];
  if (!duty) return undefined;

  return {
    day,
    duty,
    lead,
    currentShift:
      phase === "during" && day.date === now.date
        ? duty.shifts.find((shift) =>
            now.time < AFTERNOON_FROM
              ? shift.shift === "Morning"
              : shift.shift === "Afternoon",
          )
        : undefined,
  };
}

/** True when the whole of a team is on duty rather than a named few. */
export function isWholeTeamOn(shift: DutyShift, team: DutyTeamId): boolean {
  return Boolean(shift.allOnDuty?.includes(team));
}
