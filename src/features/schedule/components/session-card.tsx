import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { speakerById, type FlatSession } from "@/data";
import { cn } from "@/lib/utils";
import { ministryLabels } from "../lib/today";

/** "Pr. Kennedy Mfune" from a speaker id, plus any free-text credits. */
export function presenterNames(session: FlatSession): string[] {
  const named = (session.presenterIds ?? []).map((id) => {
    const speaker = speakerById[id];
    if (!speaker) return id;
    return speaker.title ? `${speaker.title} ${speaker.name}` : speaker.name;
  });
  return [...named, ...(session.presentedBy ?? [])];
}

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
  className,
}: {
  session: FlatSession;
  headingLevel?: "h2" | "h3" | "h4";
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-2 rounded-card bg-surface p-4 ring-1 ring-line",
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <TimeRange start={session.start} end={session.end} />
        <span className="text-xs text-ink-muted">{session.blockLabel}</span>
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
