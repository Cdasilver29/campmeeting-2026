import { CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlockActivity } from "../lib/entries";
import { ministryChipClasses } from "../lib/ministry-tone";
import { ministryLabels } from "../lib/today";
import { ENTRY_GRID } from "./session-card";

/**
 * An activity that occupies a whole block and has no clock times of its
 * own: Sunday's Medical Camp, Friday's Sabbath Preparation.
 *
 * Deliberately a different shape from a session card — dashed outline, a
 * warm surface rather than the session white, and "No set time" standing
 * where a session's time would be. A session card with an empty time slot
 * would read as a transcription gap; this reads as a decision, which is
 * what it is (DATA-NOTES.md records the committee's confirmation for
 * Friday).
 *
 * It shares the session card's grid so the two line up down a block: the
 * label sits in the same column the times do, at the same size, and the
 * titles start from the same edge. Being distinct is the point, but being
 * misaligned is not part of it.
 */
export function AllBlockCard({
  activity,
  blockLabel,
  headingLevel: Heading = "h4",
  className,
}: {
  activity: BlockActivity;
  blockLabel: string;
  headingLevel?: "h2" | "h3" | "h4";
  className?: string;
}) {
  return (
    <article
      className={cn(
        ENTRY_GRID,
        "rounded-card border border-dashed border-line bg-surface-warm/60 p-4",
        className,
      )}
    >
      <span className="flex min-h-6 items-center gap-1.5 text-xs font-medium tracking-wide text-ink-muted uppercase sm:col-start-1 sm:row-start-1">
        <CalendarRange aria-hidden className="size-3.5 shrink-0" />
        No set time
      </span>

      <Heading className="text-base leading-6 font-semibold text-ink">
        {activity.title}
      </Heading>

      <p className="text-sm text-ink-muted">Runs through {blockLabel}</p>

      {activity.ministry ? (
        <p data-entry="ministry" className="flex flex-wrap gap-1.5">
          <span
            className={cn(
              "inline-flex items-center rounded-control px-2 py-0.5 text-xs font-medium",
              ministryChipClasses(activity.ministry),
            )}
          >
            {ministryLabels[activity.ministry]}
          </span>
        </p>
      ) : null}

      {activity.note ? (
        <p className="text-sm text-ink-muted">{activity.note}</p>
      ) : null}
    </article>
  );
}
