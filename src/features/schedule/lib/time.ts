import { eventInfo, program } from "@/data";

/**
 * Everything the schedule shows is anchored to Africa/Nairobi wall-clock
 * time, never the viewer's local zone. A member watching the livestream
 * from London must see the same "happening now" as someone on the
 * campground. All comparisons therefore happen on "YYYY-MM-DD" and
 * "HH:MM" strings, which sort correctly as plain text.
 */

export interface WallClock {
  /** "YYYY-MM-DD" in the event timezone */
  date: string;
  /** "HH:MM", 24h, in the event timezone */
  time: string;
}

const zoneFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: eventInfo.timezone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  // h23 rather than hour12:false: the latter renders midnight as "24"
  // on some ICU builds.
  hourCycle: "h23",
});

function zonedParts(instant: Date) {
  const parts = Object.fromEntries(
    zoneFormatter.formatToParts(instant).map((p) => [p.type, p.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/** An instant, expressed as event-local date and time. */
export function wallClock(instant: Date): WallClock {
  const p = zonedParts(instant);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${p.year}-${pad(p.month)}-${pad(p.day)}`,
    time: `${pad(p.hour)}:${pad(p.minute)}`,
  };
}

/**
 * The inverse: an event-local date and time back to an absolute instant.
 * Needed for the countdown, which has to measure a real duration.
 *
 * The zone offset is discovered by round-tripping through the formatter
 * rather than hardcoding +03:00, and iterated twice so a zone with DST
 * would still settle. Africa/Nairobi has no DST, but the helper has no
 * business knowing that.
 */
export function toInstant(date: string, time: string): Date {
  // The defaults exist only to satisfy noUncheckedIndexedAccess. Both
  // arguments come from validated programme data or from ISO strings we
  // produced, so no field is ever actually missing.
  const [year = 1970, month = 1, day = 1] = date.split("-").map(Number);
  const [hour = 0, minute = 0] = time.split(":").map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute);

  let guess = target;
  for (let i = 0; i < 2; i++) {
    const p = zonedParts(new Date(guess));
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
    guess = target + (guess - asUtc);
  }
  return new Date(guess);
}

export type EventPhase = "before" | "during" | "after";

/**
 * Which of the three modes the site is in. Read from eventInfo so a
 * future year needs no code change.
 */
export function eventPhase(instant: Date): EventPhase {
  const { date } = wallClock(instant);
  if (date < eventInfo.startDate) return "before";
  if (date > eventInfo.endDate) return "after";
  return "during";
}

/**
 * The moment the programme opens: the first timed session on the first
 * programme day, not midnight on the start date. Derived from the data,
 * so it moves when the programme does.
 */
export const eventStartInstant = (() => {
  const firstDay = program[0];
  const firstStart = firstDay?.blocks
    .flatMap((block) => block.sessions)
    .map((session) => session.start)
    .filter((start): start is string => Boolean(start))
    .sort()[0];
  return toInstant(firstDay?.date ?? eventInfo.startDate, firstStart ?? "00:00");
})();
