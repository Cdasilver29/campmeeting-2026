import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ACTION_LINK } from "@/lib/link-styles";
import { type DayGroup } from "../lib/entries";
import { describeFilters, joinPhrases } from "../lib/filter";
import {
  hasActiveFilters,
  scheduleHref,
  type ScheduleFilters,
} from "../lib/url";
import { DayRail } from "./day-rail";
import { MyScheduleEmpty } from "./my-schedule-empty";
import { ProgramView } from "./program-view";
import { SavedHint } from "./saved-hint";
import { ScheduleFiltersBar } from "./schedule-filters";
import { ViewSwitch } from "./view-switch";

/**
 * Layout for the programme: controls, then how many entries survived
 * them, then the entries. Shared by the prerendered unfiltered page and
 * the live filtered one so the two cannot drift apart, and so hydration
 * swaps a view for the same view rather than for a different shape.
 */
export function ScheduleShell({
  filters,
  groups,
  count,
  total,
  share = false,
}: {
  filters: ScheduleFilters;
  groups: DayGroup[];
  count: number;
  /** Entries the route holds before filtering: the week, or one day. */
  total: number;
  /** Draws the per-session share control. Day routes only — see ProgramView. */
  share?: boolean;
}) {
  // Being on a day page hides other days but removes nothing from the one
  // it keeps, so the printed holes there are still real. Any filter takes
  // sessions out, and the holes left behind are its doing, not the
  // programme's.
  const showGaps = !hasActiveFilters(filters);
  // Clearing the filters leaves the day alone: the day is the page.
  const clearHref = scheduleHref({ day: filters.day });

  return (
    <div className="flex flex-col gap-(--space-item)">
      <ScheduleFiltersBar filters={filters} />

      {/* The day rail moved above the results bar. It is navigation, and
          navigation belongs over the thing it navigates; it is also the
          sticky element, so everything below it is what should scroll
          underneath it. */}
      <DayRail filters={filters} />

      {/* View switch and count on one line from sm, which is what the
          shell width bought: three stacked full-width rows of controls
          above a programme is a lot of chrome before any content. */}
      <div className="flex flex-col gap-3 border-y border-line py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <ViewSwitch filters={filters} />
        <ResultSummary
          count={count}
          total={total}
          clearHref={clearHref}
          filters={filters}
        />
      </div>

      {/* Only over the whole programme, which is the view that has the
          bookmark icons in it. On My schedule the empty state already says
          all of this at length, and two explanations of one feature stacked
          on top of each other is worse than either. */}
      {filters.mine ? null : <SavedHint />}

      {count > 0 ? (
        <ProgramView groups={groups} showGaps={showGaps} share={share} />
      ) : filters.mine ? (
        // Saved sessions are unknown until localStorage has been read,
        // so this branch decides for itself whether "nothing" means
        // "nothing saved" or "not read yet".
        <MyScheduleEmpty
          clearHref={clearHref}
          otherFiltersActive={hasActiveFilters({ ...filters, mine: false })}
        />
      ) : (
        <NoResults filters={filters} clearHref={clearHref} />
      )}
    </div>
  );
}

/**
 * Always on screen, filtered or not, so the number is a fact about the
 * programme rather than something that only appears when a search fails.
 * role="status" announces the new count to a screen reader after a
 * filter changes, since the change happens well below the controls.
 */
function ResultSummary({
  count,
  total,
  clearHref,
  filters,
}: {
  count: number;
  total: number;
  clearHref: string;
  filters: ScheduleFilters;
}) {
  return (
    // The border moved to the row this shares with the view switch, so the
    // two read as one bar rather than as a bordered strip under a control.
    <div className="flex min-h-8 flex-wrap items-center gap-x-4 gap-y-2 sm:justify-end">
      <p role="status" className="text-sm text-ink-muted">
        Showing{" "}
        <span className="tabular-figures font-medium text-ink">{count}</span> of{" "}
        <span className="tabular-figures">{total}</span> programme entries
      </p>
      {hasActiveFilters(filters) ? (
        <Link href={clearHref} scroll={false} className={ACTION_LINK}>
          Clear filters
        </Link>
      ) : null}
    </div>
  );
}

function NoResults({
  filters,
  clearHref,
}: {
  filters: ScheduleFilters;
  clearHref: string;
}) {
  const description = `No sessions ${joinPhrases(describeFilters(filters))}.`;

  return (
    <EmptyState
      icon={SearchX}
      title="Nothing matches those filters"
      description={`${description} Clear them to see the whole programme again.`}
      action={
        <Link href={clearHref} scroll={false} className={ACTION_LINK}>
          Clear filters
        </Link>
      }
    />
  );
}
