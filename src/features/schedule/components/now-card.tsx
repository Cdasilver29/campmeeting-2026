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
 *
 * ── TWO PRESENTATIONS, BECAUSE THE TWO PAGES ASK DIFFERENT THINGS ────
 *
 * `heading` is the home page. There "Happening now" is news — the reader
 * did not come looking for it — so it gets a display-size heading and,
 * below the card, a way to go and watch it.
 *
 * `badge` is /livestream. There the live player is already the thing at
 * the top of the page, so a second display heading announcing the same
 * fact is repetition, and a "watch live" button under it points at the
 * player three inches above. It is ONE LINE: the pulsing dot, the words
 * "Live now", and nothing else — no display type, no block of its own, no
 * vertical space beyond the ordinary gap to the card under it.
 *
 * Still an `h2`, and that is deliberate rather than left over. The section
 * is named by `aria-labelledby="now-heading"`, so this element is the
 * accessible name of the whole live region; demoting it to a `span` to
 * make it look like a line would have left the section anonymous. It is a
 * heading that is set small, which is a styling decision, not a semantic
 * one.
 *
 * ── THE GREEN IS THE DOT AND ONLY THE DOT ────────────────────────────
 *
 * The obvious version of the badge sets the words in --color-live, which
 * is the brand's Tree Frog green. It was measured before it was written:
 * #448d21 is 4.14:1 on the page surface and white on it is 4.14:1 too,
 * both under the 4.5 floor. Its own token comment says "indicator fill
 * only" for this reason. So the green stays the pulsing dot, which is
 * decorative and carries no information alone, and the words stay ink.
 */
export function NowCard({
  current,
  variant = "heading",
  action,
}: {
  current: CurrentEntry;
  /** `heading` on the home page, `badge` beside a live player. */
  variant?: "heading" | "badge";
  /** Rendered under the card. The home page's link to the live player. */
  action?: React.ReactNode;
}) {
  const badge = variant === "badge";

  return (
    <section
      aria-labelledby="now-heading"
      className={`flex flex-col ${badge ? "gap-2" : "gap-3"}`}
    >
      <h2
        id="now-heading"
        className={
          badge
            ? "flex items-center gap-2 text-sm font-medium leading-5 text-ink"
            : `flex items-center gap-2 ${sectionHeading}`
        }
      >
        <LiveDot />
        {badge ? "Live now" : "Happening now"}
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

      {action}
    </section>
  );
}
