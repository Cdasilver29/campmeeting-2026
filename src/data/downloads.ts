/**
 * The daily programme PDFs.
 *
 * ── ONE LINE PER DAY, AND NOTHING ELSE ───────────────────────────────
 *
 * There are eight of these, one per day of the week, and they arrive one
 * at a time — the committee prints each day's sheet the evening before.
 * So this file lists only the days whose PDF has actually shipped, and
 * everything else about the list is derived:
 *
 *   - the WEEK comes from `program` in ./program.ts, so the downloads page
 *     always shows eight days in programme order whether or not their PDFs
 *     exist. A day that has not arrived is shown as pending, not hidden.
 *   - the LABEL comes from that day's own `displayLabel`, so a download
 *     cannot end up captioned differently from the schedule page it
 *     belongs to.
 *   - the SIZE is read off disk at build time by the downloads page, using
 *     the same `fs.statSync` probe the full programme PDF already uses.
 *     Carrying a byte count here as well would be a second source of truth
 *     for a number the file itself already knows, and it would go stale the
 *     first time a PDF was re-exported.
 *
 * ── ADDING DAY 2 ─────────────────────────────────────────────────────
 *
 * Drop the file at `public/downloads/camp-meeting-day-2.pdf` and add one
 * line below:
 *
 *     { dayId: "sunday-16", file: "camp-meeting-day-2.pdf" },
 *
 * That is the whole change. No component is touched, and the pending row
 * that was standing in for that day becomes a real download on the next
 * build. The day numbers in the filenames are the day's position in
 * `program`, which is also the "Day N" the rest of the site counts with.
 *
 * `dayId` must match a `ProgramDay.id`. It is checked rather than trusted:
 * `dailyProgrammeFor()` returns undefined for an id that is not in the
 * programme, so a typo shows up as a day stuck on "not yet available"
 * rather than as a broken link.
 */

export interface DailyProgramme {
  /** A `ProgramDay.id` from ./program.ts. */
  dayId: string;
  /** Filename inside `public/downloads/`. */
  file: string;
}

export const dailyProgrammes: DailyProgramme[] = [
  { dayId: "sabbath-15", file: "camp-meeting-day-1.pdf" },
];

/** Where these live in `public/`, and therefore the URL prefix. */
export const DOWNLOADS_DIR = "/downloads";

export function dailyProgrammeFor(dayId: string): DailyProgramme | undefined {
  return dailyProgrammes.find((entry) => entry.dayId === dayId);
}
