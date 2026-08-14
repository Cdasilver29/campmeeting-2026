"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useBookmarks } from "../bookmarks";
import { groupEntries, scheduleScope } from "../lib/entries";
import { filterEntries } from "../lib/filter";
import { hasActiveFilters, parseScheduleFilters } from "../lib/url";
import { ScheduleShell } from "./schedule-shell";

/**
 * The programme browser. All of its state is read from the URL rather
 * than held locally, so the view a reader is looking at is always the
 * view in the address bar, the back button walks their filters, and a
 * copied URL reproduces the page for someone else. The day comes from
 * the route and the rest from the query string.
 *
 * The static HTML for these routes is the Suspense fallback in
 * schedule-programme.tsx — the same scope, unfiltered — so the page is
 * readable before this component hydrates and with JavaScript
 * unavailable.
 */
export function ScheduleBrowser({ day }: { day?: string }) {
  const params = useSearchParams();
  const filters = parseScheduleFilters(params, day);

  const { ids } = useBookmarks();

  const { q, ministry, speaker, mine } = filters;
  const scope = scheduleScope(day);

  const groups = useMemo(() => {
    // Nothing is filtered: reuse the grouping built at module load
    // rather than walking the scope to arrive back at it.
    if (!hasActiveFilters({ q, ministry, speaker, mine })) {
      return scope.groups;
    }
    return groupEntries(
      // No day here: the scope is already this day's entries.
      filterEntries(scope.entries, { q, ministry, speaker, mine }, (id) =>
        ids.has(id),
      ),
    );
  }, [scope, q, ministry, speaker, mine, ids]);

  const count = useMemo(
    () => groups.reduce((total, group) => total + group.count, 0),
    [groups],
  );

  return (
    <ScheduleShell
      filters={filters}
      groups={groups}
      count={count}
      total={scope.total}
      share={Boolean(day)}
    />
  );
}
