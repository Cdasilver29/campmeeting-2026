import {
  allSessions,
  program,
  type FlatSession,
  type MinistryTag,
  type ProgramBlock,
  type ProgramDay,
} from "@/data";
import { presenterNames } from "./presenters";
import { ministryLabels } from "./today";

/**
 * The programme holds two kinds of thing, and the difference is real
 * rather than a data gap: a session with clock times, and an activity
 * that occupies a whole block without any (Sunday's Medical Camp,
 * Friday's Sabbath Preparation — see DATA-NOTES.md). Search, filters and
 * rendering all work on this union so an untimed activity is a first
 * class entry, never a session with a hole where its time should be.
 */
export type BlockActivity = NonNullable<ProgramBlock["allBlockActivity"]>;

interface EntryBase {
  /** Unique across the programme: a session id, or {dayId}-{blockId}-activity. */
  key: string;
  dayId: string;
  blockId: string;
  blockLabel: string;
  ministry?: MinistryTag;
  /** Lowercased title, presenters and ministry, prebuilt for text search. */
  search: string;
}

export type ScheduleEntry =
  | (EntryBase & { kind: "session"; session: FlatSession })
  | (EntryBase & { kind: "activity"; activity: BlockActivity });

const sessionById = new Map(allSessions.map((session) => [session.id, session]));

function haystack(parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

/**
 * Structure comes from `program` so blocks and their order are honoured,
 * but each session is looked up in `allSessions` rather than re-flattened
 * here — there is one flattening in the data layer and this reuses it.
 */
export const allEntries: ScheduleEntry[] = program.flatMap((day) =>
  day.blocks.flatMap((block): ScheduleEntry[] => {
    const sessions: ScheduleEntry[] = block.sessions
      .map((session) => sessionById.get(session.id))
      .filter((session): session is FlatSession => Boolean(session))
      .map((session) => ({
        kind: "session",
        key: session.id,
        dayId: day.id,
        blockId: block.id,
        blockLabel: block.label,
        ministry: session.ministry,
        search: haystack([
          session.title,
          // Searchable, because "Broken Identity" is what someone who
          // heard about the Health series will actually type — "Health"
          // alone would return all four and distinguish none of them.
          session.subtitle,
          ...presenterNames(session),
          session.ministry,
          session.ministry && ministryLabels[session.ministry],
        ]),
        session,
      }));

    const activity = block.allBlockActivity;
    if (!activity) return sessions;

    return [
      ...sessions,
      {
        kind: "activity",
        key: `${day.id}-${block.id}-activity`,
        dayId: day.id,
        blockId: block.id,
        blockLabel: block.label,
        ministry: activity.ministry,
        search: haystack([
          activity.title,
          block.label,
          activity.ministry,
          activity.ministry && ministryLabels[activity.ministry],
          // The Medical Camp's providers and services. Someone looking
          // for a dentist types "dental", not "medical camp", and the
          // programme now holds the answer — so the search has to reach
          // it or the content is there and unfindable.
          ...(activity.providers ?? []).flatMap((provider) => [
            provider.name,
            ...provider.serviceGroups.flatMap((group) => group.services),
          ]),
        ]),
        activity,
      },
    ];
  }),
);

export interface BlockGroup {
  block: ProgramBlock;
  entries: ScheduleEntry[];
}

export interface DayGroup {
  day: ProgramDay;
  blocks: BlockGroup[];
  count: number;
}

/**
 * Entries back into day and block order for rendering. Days and blocks
 * that keep nothing are dropped, so a filtered view never shows an empty
 * "Evening Service" heading with nothing under it.
 */
export function groupEntries(entries: ScheduleEntry[]): DayGroup[] {
  const byBlock = new Map<string, ScheduleEntry[]>();
  for (const entry of entries) {
    const key = `${entry.dayId}|${entry.blockId}`;
    const bucket = byBlock.get(key);
    if (bucket) bucket.push(entry);
    else byBlock.set(key, [entry]);
  }

  return program
    .map((day) => {
      const blocks = day.blocks
        .map((block) => ({
          block,
          entries: byBlock.get(`${day.id}|${block.id}`) ?? [],
        }))
        .filter((group) => group.entries.length > 0);
      return {
        day,
        blocks,
        count: blocks.reduce((total, group) => total + group.entries.length, 0),
      };
    })
    .filter((group) => group.blocks.length > 0);
}

/** The whole programme, grouped. Built once at module load. */
export const allDayGroups: DayGroup[] = groupEntries(allEntries);

/**
 * What a programme route is looking at before any filter runs: the whole
 * week on /schedule, one day on /schedule/{day}. Both forms are built
 * once at module load, so an unfiltered page renders a prepared grouping
 * instead of walking 240 entries to arrive back at it, and the "of N" in
 * the count is the size of the page's own scope rather than of the week.
 */
export interface ScheduleScope {
  /** Everything in scope, for the filters to narrow. */
  entries: ScheduleEntry[];
  /** The same entries, grouped, for the unfiltered render. */
  groups: DayGroup[];
  total: number;
}

export const wholeProgramme: ScheduleScope = {
  entries: allEntries,
  groups: allDayGroups,
  total: allEntries.length,
};

const scopeByDay = new Map<string, ScheduleScope>(
  program.map((day) => {
    const entries = allEntries.filter((entry) => entry.dayId === day.id);
    return [
      day.id,
      { entries, groups: groupEntries(entries), total: entries.length },
    ];
  }),
);

/** Falls back to the whole programme, so an unknown day is never empty. */
export function scheduleScope(dayId?: string): ScheduleScope {
  return (dayId ? scopeByDay.get(dayId) : undefined) ?? wholeProgramme;
}

/**
 * "Friday 21st August 2026" — displayLabel exactly as printed in the
 * programme, plus the year, which the printed labels leave off.
 *
 * Shared by the day page, its metadata and its share card so all three
 * name the day the same way.
 */
export function fullDayLabel(day: Pick<ProgramDay, "displayLabel" | "date">): string {
  return `${day.displayLabel} ${day.date.slice(0, 4)}`;
}

/** 1-based position of a day in the programme, for "Day 6 of 8". */
export function dayNumber(dayId: string): number {
  return program.findIndex((day) => day.id === dayId) + 1;
}

function minutesOf(time: string): number {
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
}

export interface ScheduleGap {
  start: string;
  end: string;
}

/**
 * Holes inside a block, as printed. The closing Sabbath really does stop
 * at 15:00 and restart at 16:00 (DATA-NOTES.md), and an unexplained hour
 * in a timeline reads as a bug, so the gap is labelled instead of hidden.
 * Keyed by the entry that follows the gap.
 *
 * Only meaningful on an unfiltered block: once search or a facet removes
 * sessions, every remaining hole is an artefact of the filter rather than
 * the programme, which is why the caller decides when to ask.
 */
export function blockGaps(
  entries: ScheduleEntry[],
  minimumMinutes = 30,
): Map<string, ScheduleGap> {
  const gaps = new Map<string, ScheduleGap>();
  let previousEnd: string | undefined;

  for (const entry of entries) {
    if (entry.kind !== "session") {
      previousEnd = undefined;
      continue;
    }
    const { start, end } = entry.session;
    if (!start || !end) continue;
    if (previousEnd && minutesOf(start) - minutesOf(previousEnd) >= minimumMinutes) {
      gaps.set(entry.key, { start: previousEnd, end: start });
    }
    previousEnd = end;
  }

  return gaps;
}

/** Ministry tags that appear somewhere in the programme, in label order. */
export const programMinistries: MinistryTag[] = [
  ...new Set(
    allEntries
      .map((entry) => entry.ministry)
      .filter((tag): tag is MinistryTag => Boolean(tag)),
  ),
].sort((a, b) => ministryLabels[a].localeCompare(ministryLabels[b]));
