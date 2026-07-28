import type { MinistryTag } from "@/data";
import { allEntries, groupEntries, type DayGroup } from "@/features/schedule/lib/entries";

/** Every session and all-block activity tagged with this ministry, grouped by day. */
export function ministryDayGroups(tag: MinistryTag): DayGroup[] {
  return groupEntries(allEntries.filter((entry) => entry.ministry === tag));
}
