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

export const totalEntryCount = allEntries.length;

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
