"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { allDayGroups } from "../lib/entries";
import { parseScheduleFilters } from "../lib/url";
import { DayRail } from "./day-rail";
import { ProgramView } from "./program-view";

/**
 * The programme browser. All of its state is read from the query string
 * rather than held locally, so the view a reader is looking at is always
 * the view in the address bar.
 *
 * The static HTML for this route is the Suspense fallback in page.tsx —
 * the whole programme, unfiltered — so the page is readable before this
 * component hydrates and with JavaScript unavailable.
 */
export function ScheduleBrowser() {
  const params = useSearchParams();
  const filters = parseScheduleFilters(params);
  const reduceMotion = useReducedMotion();

  const groups = filters.day
    ? allDayGroups.filter((group) => group.day.id === filters.day)
    : allDayGroups;

  useScrollToDay(filters.day, Boolean(reduceMotion));

  return (
    <div className="flex flex-col gap-8">
      <DayRail filters={filters} />
      <ProgramView groups={groups} />
    </div>
  );
}

/**
 * Brings the chosen day into view. Deep links land on the page with the
 * heading already past the fold otherwise, and the same movement on a
 * rail click confirms the choice took effect.
 *
 * Skipped when the day is unchanged, so unrelated filter edits later on
 * never yank the page around under the reader.
 */
function useScrollToDay(dayId: string | undefined, reduceMotion: boolean) {
  const previous = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!dayId || dayId === previous.current) {
      previous.current = dayId;
      return;
    }
    previous.current = dayId;

    const target = document.getElementById(`day-${dayId}`);
    target?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [dayId, reduceMotion]);
}
