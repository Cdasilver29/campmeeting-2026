import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { totalEntryCount, type DayGroup } from "../lib/entries";
import { describeFilters, joinPhrases } from "../lib/filter";
import {
  hasActiveFilters,
  SCHEDULE_PATH,
  type ScheduleFilters,
} from "../lib/url";
import { DayRail } from "./day-rail";
import { ProgramView } from "./program-view";
import { ScheduleFiltersBar } from "./schedule-filters";

const clearLinkClasses =
  "inline-flex h-8 items-center rounded-control px-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";

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
}: {
  filters: ScheduleFilters;
  groups: DayGroup[];
  count: number;
}) {
  // A day filter hides other days but removes nothing from the ones it
  // keeps, so the printed holes are still real. Any other filter takes
  // sessions out, and the holes left behind are its doing, not the
  // programme's.
  const showGaps =
    !filters.q && !filters.ministry && !filters.speaker && !filters.mine;

  return (
    <div className="flex flex-col gap-6">
      <ScheduleFiltersBar filters={filters} />
      <DayRail filters={filters} />
      <ResultSummary count={count} filters={filters} />
      {count === 0 ? (
        <NoResults filters={filters} />
      ) : (
        <ProgramView groups={groups} showGaps={showGaps} />
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
  filters,
}: {
  count: number;
  filters: ScheduleFilters;
}) {
  return (
    <div className="flex min-h-8 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-y border-line py-1">
      <p role="status" className="text-sm text-ink-muted">
        Showing{" "}
        <span className="tabular-figures font-medium text-ink">{count}</span> of{" "}
        <span className="tabular-figures">{totalEntryCount}</span> programme
        entries
      </p>
      {hasActiveFilters(filters) ? (
        <Link href={SCHEDULE_PATH} scroll={false} className={clearLinkClasses}>
          Clear filters
        </Link>
      ) : null}
    </div>
  );
}

function NoResults({ filters }: { filters: ScheduleFilters }) {
  const description = `No sessions ${joinPhrases(describeFilters(filters))}.`;

  return (
    <EmptyState
      icon={SearchX}
      title="Nothing matches those filters"
      description={`${description} Clear them to see the whole programme again.`}
      action={
        <Link href={SCHEDULE_PATH} scroll={false} className={clearLinkClasses}>
          Clear filters
        </Link>
      }
    />
  );
}
