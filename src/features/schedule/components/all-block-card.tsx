import { CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlockActivity } from "../lib/entries";
import { ministryLabels } from "../lib/today";

/**
 * An activity that occupies a whole block and has no clock times of its
 * own: Sunday's Medical Camp, Friday's Sabbath Preparation.
 *
 * Deliberately a different shape from a session card — dashed outline,
 * no time column, and an explicit line saying it runs through the block.
 * A session card with an empty time slot would read as a transcription
 * gap; this reads as a decision, which is what it is (DATA-NOTES.md
 * records the committee's confirmation for Friday).
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
        "flex flex-col gap-2 rounded-card border border-dashed border-line bg-surface-muted p-4",
        className,
      )}
    >
      <div className="flex min-h-6 flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-ink-muted uppercase">
          <CalendarRange aria-hidden className="size-3.5" />
          No set time
        </span>
        <span className="text-xs text-ink-muted">
          Runs through {blockLabel}
        </span>
      </div>

      <Heading className="text-base leading-snug font-medium text-ink">
        {activity.title}
      </Heading>

      {activity.ministry ? (
        <p className="text-xs text-ink-muted">
          {ministryLabels[activity.ministry]}
        </p>
      ) : null}

      {activity.note ? (
        <p className="text-sm text-ink-muted">{activity.note}</p>
      ) : null}
    </article>
  );
}
