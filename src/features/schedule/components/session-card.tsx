import type { ReactNode } from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type FlatSession } from "@/data";
import { cn } from "@/lib/utils";
import { presenterNames } from "../lib/presenters";
import { ministryLabels } from "../lib/today";

/**
 * Times are set in tabular figures so the column stays flush down a
 * timeline. Rendered as a <time> pair rather than one string so the
 * machine-readable values survive for the Phase 6 structured data.
 */
export function TimeRange({
  start,
  end,
  className,
}: {
  start?: string;
  end?: string;
  className?: string;
}) {
  if (!start) {
    return (
      <span className={cn("text-sm text-ink-muted", className)}>All block</span>
    );
  }

  return (
    <span className={cn("tabular-figures text-sm text-ink-muted", className)}>
      <time dateTime={start}>{start}</time>
      {end ? (
        <>
          <span aria-hidden> – </span>
          <span className="sr-only"> to </span>
          <time dateTime={end}>{end}</time>
        </>
      ) : null}
    </span>
  );
}

export function PresenterChips({ session }: { session: FlatSession }) {
  const names = presenterNames(session);
  if (names.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {names.map((name) => (
        <li key={name}>
          <Badge variant="secondary">{name}</Badge>
        </li>
      ))}
    </ul>
  );
}

export function SessionCard({
  session,
  headingLevel: Heading = "h3",
  showBlockLabel = true,
  meta,
  className,
}: {
  session: FlatSession;
  headingLevel?: "h2" | "h3" | "h4";
  /** Off inside the full programme, where the block is already a heading. */
  showBlockLabel?: boolean;
  /** Trailing control on the meta row, e.g. the bookmark toggle. */
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-2 rounded-card bg-surface p-4 ring-1 ring-line",
        className,
      )}
    >
      {/* min-h-6 holds the row at the height of a 24px control, so a
          bookmark toggle appearing after mount shifts nothing. */}
      <div className="flex min-h-6 flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <TimeRange start={session.start} end={session.end} />
        <div className="flex items-center gap-2">
          {showBlockLabel ? (
            <span className="text-xs text-ink-muted">{session.blockLabel}</span>
          ) : null}
          {meta}
        </div>
      </div>

      <Heading className="flex items-start gap-1.5 text-base leading-snug font-medium text-ink">
        {session.featured ? (
          <Star
            aria-hidden
            className="mt-0.5 size-4 shrink-0 fill-featured text-featured"
          />
        ) : null}
        <span>
          {session.title}
          {session.featured ? (
            <span className="sr-only"> (highlighted session)</span>
          ) : null}
        </span>
      </Heading>

      <PresenterChips session={session} />

      {session.ministry ? (
        <p className="text-xs text-ink-muted">
          {ministryLabels[session.ministry]}
        </p>
      ) : null}

      {session.note ? (
        <p className="text-sm text-ink-muted">{session.note}</p>
      ) : null}
    </article>
  );
}
