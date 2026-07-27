"use client";

import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { useBookmarks } from "../bookmarks";
import { allDayGroups, allEntries, groupEntries } from "../lib/entries";
import { filterEntries } from "../lib/filter";
import { hasActiveFilters, parseScheduleFilters } from "../lib/url";
import { ScheduleShell } from "./schedule-shell";

/**
 * The programme browser. All of its state is read from the query string
 * rather than held locally, so the view a reader is looking at is always
 * the view in the address bar, the back button walks their filters, and
 * a copied URL reproduces the page for someone else.
 *
 * The static HTML for this route is the Suspense fallback in page.tsx —
 * the whole programme, unfiltered — so the page is readable before this
 * component hydrates and with JavaScript unavailable.
 */
export function ScheduleBrowser() {
  const params = useSearchParams();
  const filters = parseScheduleFilters(params);
  const reduceMotion = useReducedMotion();

  const { ids } = useBookmarks();

  const { q, day, ministry, speaker, mine } = filters;
  const groups = useMemo(() => {
    // Nothing is filtered: reuse the grouping built at module load
    // rather than walking 239 entries to arrive back at it.
    if (!hasActiveFilters({ q, day, ministry, speaker, mine })) {
      return allDayGroups;
    }
    return groupEntries(
      filterEntries(allEntries, { q, day, ministry, speaker, mine }, (id) =>
        ids.has(id),
      ),
    );
  }, [q, day, ministry, speaker, mine, ids]);

  const count = useMemo(
    () => groups.reduce((total, group) => total + group.count, 0),
    [groups],
  );

  useScrollToDay(day, Boolean(reduceMotion));

  return <ScheduleShell filters={filters} groups={groups} count={count} />;
}

/**
 * Brings the chosen day into view. A deep link would otherwise land with
 * its heading below the fold, and the same movement on a rail click
 * confirms the choice took effect.
 *
 * Only on a change of day, so editing an unrelated filter later never
 * yanks the page around under the reader.
 */
function useScrollToDay(dayId: string | undefined, reduceMotion: boolean) {
  const previous = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!dayId || dayId === previous.current) {
      previous.current = dayId;
      return;
    }
    previous.current = dayId;

    document.getElementById(`day-${dayId}`)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [dayId, reduceMotion]);
}
