import { ministryLabels, type CurrentEntry } from "../lib/today";
import { ministryChipClasses } from "../lib/ministry-tone";
import {
  SECTION_HEADING,
  UPCOMING_EYEBROW,
  UPCOMING_TITLE,
} from "./card-styles";
import { LiveDot } from "./live-dot";
import { ENTRY_GRID, SessionCard, TimeRange } from "./session-card";

const sectionHeading = SECTION_HEADING;

/*
 * What makes the now card unmistakable, in one place because both
 * branches below have to look identical.
 *
 * Four cues, so none of them is doing the job alone: a 2px accent ring
 * where every other card has a 1px hairline, a tinted surface, the
 * heading's live dot, and the size of the title. Deliberately not a
 * shadow — the brief rules out oversized shadows and a ring reads as
 * emphasis at any elevation.
 */
const NOW_SURFACE = "bg-primary/[0.06] ring-2 ring-primary";

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
          className={`${NOW_SURFACE} [&>h3]:text-lg`}
        />
      ) : (
        <article
          className={`${ENTRY_GRID} rounded-card p-4 ${NOW_SURFACE}`}
        >
          <span className="flex min-h-6 items-center sm:col-start-1 sm:row-start-1">
            <TimeRange />
          </span>
          <span className={UPCOMING_EYEBROW}>{current.block.label}</span>
          <h3 className={UPCOMING_TITLE}>{current.activity.title}</h3>
          {current.activity.ministry ? (
            <p data-entry="ministry" className="flex flex-wrap gap-1.5">
              <span
                className={`inline-flex items-center rounded-control px-2 py-0.5 text-xs font-medium ${ministryChipClasses(current.activity.ministry)}`}
              >
                {ministryLabels[current.activity.ministry]}
              </span>
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
