import { allEntries, groupEntries, type DayGroup } from "@/features/schedule/lib/entries";
import type { MinistryPageTag } from "./copy";

/** Every session and all-block activity tagged with this ministry, grouped by day. */
export function ministryDayGroups(tag: MinistryPageTag): DayGroup[] {
  return groupEntries(allEntries.filter((entry) => entry.ministry === tag));
}
