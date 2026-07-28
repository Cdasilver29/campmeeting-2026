import { ministryLabels, type CurrentEntry } from "../lib/today";
import { LiveDot } from "./live-dot";
import { SessionCard, TimeRange } from "./session-card";

const sectionHeading = "font-display text-2xl text-ink";

/**
 * The live indicator card: a timed session and an all-block activity are
 * the same thing to a reader ("what is on right now"), so they share a
 * heading and differ only in body. Shared by the Today view and the
 * livestream page, which both need "happening now" but must never
 * re-derive it independently.
 */
export function NowCard({ current }: { current: CurrentEntry }) {
  return (
    <section aria-labelledby="now-heading" className="flex flex-col gap-3">
      <h2 id="now-heading" className={`flex items-center gap-2 ${sectionHeading}`}>
        <LiveDot />
        Happening now
      </h2>

      {current.kind === "session" ? (
        <SessionCard
          session={current.session}
          className="bg-surface-muted ring-2 ring-primary"
        />
      ) : (
        <article className="flex flex-col gap-2 rounded-card bg-surface-muted p-4 ring-2 ring-primary">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <TimeRange />
            <span className="text-xs text-ink-muted">
              {current.block.label}
            </span>
          </div>
          <h3 className="text-base leading-snug font-medium text-ink">
            {current.activity.title}
          </h3>
          {current.activity.ministry ? (
            <p className="text-xs text-ink-muted">
              {ministryLabels[current.activity.ministry]}
            </p>
          ) : null}
          {current.activity.note ? (
            <p className="text-sm text-ink-muted">{current.activity.note}</p>
          ) : null}
        </article>
      )}
    </section>
  );
}
