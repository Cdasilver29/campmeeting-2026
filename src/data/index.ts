export * from "./types";
export {
  eventInfo,
  speakers,
  speakerById,
  hosts,
  hostById,
  sundownByDate,
} from "./event";
export { hostLetters, hostLetter } from "./host-letters";
export { program } from "./program";
export { duty, dutyByDayId } from "./duty";
export { childrenProgram } from "./children";
export { galleryImages } from "./gallery";
export {
  DOWNLOADS_DIR,
  PROGRAMME_PDF_FILE,
  programmePdfPath,
} from "./downloads";
export {
  announcements,
  announcementsByDate,
  announcementsBySessionId,
} from "./announcements";

import { program } from "./program";
import type { Session, ProgramDay } from "./types";

export interface FlatSession extends Session {
  dayId: string;
  date: string;
  blockId: string;
  blockLabel: string;
}

/** Flat list for search, filters, and the "now playing" indicator. */
export const allSessions: FlatSession[] = program.flatMap((day) =>
  day.blocks.flatMap((block) =>
    block.sessions.map((s) => ({
      ...s,
      dayId: day.id,
      date: day.date,
      blockId: block.id,
      blockLabel: block.label,
    })),
  ),
);

export function getDay(dayId: string): ProgramDay | undefined {
  return program.find((d) => d.id === dayId);
}

export function getDayByDate(isoDate: string): ProgramDay | undefined {
  return program.find((d) => d.date === isoDate);
}

/**
 * Current session for the live indicator.
 * Pass `new Date()` from the client; comparison is done in event-local
 * wall-clock time (Africa/Nairobi) so it's correct for remote viewers too.
 */
export function getCurrentSession(now: Date): FlatSession | undefined {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    // h23, not hour12:false — the latter renders midnight as "24" on some
    // ICU builds, which would never match a session's "HH:MM".
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(now).map((p) => [p.type, p.value]),
  );
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const time = `${parts.hour}:${parts.minute}`;
  return allSessions.find(
    (s) => s.date === date && s.start && s.end && s.start <= time && time < s.end,
  );
}
