import { getDay, speakerById } from "@/data";
import type { ScheduleEntry } from "./entries";
import { speakerLabel } from "./presenters";
import { ministryLabels } from "./today";
import type { ScheduleFilters } from "./url";

/**
 * Every filter narrows the same list, and the text query is the last
 * test because it is the only one that has to walk a string.
 *
 * Terms are ANDed: "mfune sermon" finds the sermons he preaches, not
 * everything bearing either word. Each entry carries a prebuilt lowercase
 * haystack of its title, presenters and ministry, so a keystroke is 239
 * substring tests rather than 239 rebuilds.
 *
 * Untimed all-block activities are filtered alongside sessions, so a
 * Medical ministry filter finds Sunday's Medical Camp. They drop out of
 * the speaker and bookmark filters because they have neither.
 */
export function filterEntries(
  entries: ScheduleEntry[],
  filters: ScheduleFilters,
  isBookmarked?: (sessionId: string) => boolean,
): ScheduleEntry[] {
  const terms = filters.q.toLowerCase().split(/\s+/).filter(Boolean);

  return entries.filter((entry) => {
    if (filters.day && entry.dayId !== filters.day) return false;
    if (filters.ministry && entry.ministry !== filters.ministry) return false;

    if (filters.speaker) {
      if (entry.kind !== "session") return false;
      if (!entry.session.presenterIds?.includes(filters.speaker)) return false;
    }

    if (filters.mine) {
      if (entry.kind !== "session") return false;
      if (!isBookmarked?.(entry.key)) return false;
    }

    return terms.every((term) => entry.search.includes(term));
  });
}

/**
 * The active filters as readable phrases, so the empty state can name
 * what was ruled out instead of saying "no results" and leaving the
 * reader to work out which control to undo.
 */
export function describeFilters(filters: ScheduleFilters): string[] {
  const parts: string[] = [];

  if (filters.q) parts.push(`matching "${filters.q}"`);
  if (filters.ministry) parts.push(`tagged ${ministryLabels[filters.ministry]}`);

  const speaker = filters.speaker ? speakerById[filters.speaker] : undefined;
  if (speaker) parts.push(`presented by ${speakerLabel(speaker)}`);

  const day = filters.day ? getDay(filters.day) : undefined;
  if (day) parts.push(`on ${day.displayLabel}`);

  if (filters.mine) parts.push("in your saved sessions");

  return parts;
}

/** "a, b and c" — plain list copy for the empty state. */
export function joinPhrases(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}
