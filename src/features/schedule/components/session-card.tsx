import type { ReactNode } from "react";
import Link from "next/link";
import { Star, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { announcementsBySessionId, type Announcement, type FlatSession } from "@/data";
import { cn } from "@/lib/utils";
import { ministryChipClasses } from "../lib/ministry-tone";
import { presenterNames } from "../lib/presenters";
import { ministryLabels } from "../lib/today";

/**
 * Times are set in tabular figures so the column stays flush down a
 * timeline. Rendered as a <time> pair rather than one string so the
 * machine-readable values survive for the Phase 6 structured data.
 *
 * Light weight and muted ink on purpose. A time is how you find the
 * session you want, not what the session is, and it reads better as a
 * quiet index down the left edge than as a competing headline. The title
 * carries the weight.
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
    <span
      className={cn(
        // nowrap, and the column is sized to fit the longest range. A
        // wrapped range reads as two times rather than one span, and the
        // dash ends up stranded at the end of the first line.
        "tabular-figures text-sm leading-6 font-normal whitespace-nowrap text-ink-muted",
        className,
      )}
    >
      <time dateTime={start}>{start}</time>
      {end ? (
        <>
          <span aria-hidden className="text-ink-muted/70">
            {" – "}
          </span>
          <span className="sr-only"> to </span>
          <time dateTime={end}>{end}</time>
        </>
      ) : null}
    </span>
  );
}

/**
 * The card's own grid.
 *
 * One column on a phone, where a 5rem gutter would leave the titles no
 * room. From `sm` up, a fixed time column and a content column: the time
 * rail is placed explicitly in column one, everything else declares
 * column two, so the times line up down the whole programme and the
 * titles start from one edge.
 *
 * A variant on the parent rather than a wrapper element around the
 * content. `/schedule` server-renders 238 entries, so one wrapper div per
 * card is 238 more elements to lay out; this costs no markup at all.
 * Nothing sets an explicit row: auto-placement fills column two from row
 * one, which is what puts the first line of content level with the time
 * whether that line is the title or the block eyebrow.
 *
 * `:not(:first-child)` is load-bearing. Written as `[&>*]:col-start-2` the
 * rule also matches the rail, and `.parent > *` and `.sm\:col-start-1` have
 * identical specificity, so the tie broke on stylesheet order — column 2
 * won and every card rendered with an empty gutter and its times sitting
 * where the titles should be. Excluding the first child removes the
 * conflict rather than escalating it with `!important`.
 */
export const ENTRY_GRID =
  "grid gap-x-4 gap-y-1.5" +
  " sm:grid-cols-[9.5rem_minmax(0,1fr)]" +
  // From lg the row opens out: the title keeps column two and the
  // presenter and ministry chips move up beside it into columns three and
  // four of the same row, instead of stacking underneath. At 768px there
  // was no room for that; at the 80rem shell the content column is 944px
  // at lg and 1200px above it, and a title, a name and a ministry on one
  // line is how a programme is read.
  //
  // Placed by data-entry rather than by position, because which children
  // exist varies per entry — notices, presenters, ministry and note are
  // each optional — so nth-child cannot address them, and by element type
  // two pairs collide (notices and presenters are both ul, ministry and
  // note are both p).
  //
  // Written as :not() exclusions on the sm rule rather than as lg
  // overrides of it. `.parent > *:not(:first-child)` and
  // `.parent > [data-entry=presenters]` have identical specificity, so an
  // override would have been settled by Tailwind's sort order — which is
  // exactly the tie that once put every time in the title's place. Taking
  // the two elements out of the general rule removes the conflict instead
  // of betting on it.
  " sm:[&>*:not(:first-child):not([data-entry=presenters]):not([data-entry=ministry])]:col-start-2" +
  " sm:[&>[data-entry=presenters]]:col-start-2 sm:[&>[data-entry=ministry]]:col-start-2" +
  // minmax(0,auto) rather than plain auto on the two chip tracks, so a
  // long presenter name shrinks its own column instead of squeezing the
  // title out of the 1fr one.
  " lg:grid-cols-[9.5rem_minmax(0,1fr)_minmax(0,auto)_minmax(0,auto)]" +
  " lg:[&>[data-entry=presenters]]:col-start-3 lg:[&>[data-entry=presenters]]:row-start-1" +
  " lg:[&>[data-entry=ministry]]:col-start-4 lg:[&>[data-entry=ministry]]:row-start-1" +
  // Everything that stays in column two spans the two new columns at lg,
  // so a long title or a programme notice still uses the full row rather
  // than being squeezed into a third of it.
  " lg:[&>*:not(:first-child):not([data-entry=presenters]):not([data-entry=ministry])]:col-end-[-1]" +
  // The chips sit on the title's baseline rather than at the top of the
  // row, so a two-line title does not leave them floating.
  " lg:[&>[data-entry=presenters]]:self-start lg:[&>[data-entry=ministry]]:self-start";

/**
 * Column one: the time and the save control, on one line.
 *
 * One line rather than stacked, and this is why the gutter is 9.5rem
 * rather than the 7rem the times alone would need. Stacked, the rail was
 * the tallest thing in row one — a time plus a 24px control — so the
 * title sat alone at the top of a 56px row and the ministry chip was
 * pushed 38px clear of it. Every card carried that hole.
 *
 * `row-span-full` looks like the fix and is not: it compiles to
 * `grid-row: 1 / -1`, and with no explicit row template `-1` resolves back
 * to the first line, so the rail stays in row one and nothing changes.
 * Keeping the rail one line tall solves it at the source.
 *
 * min-h-6 holds the line at the height of a 24px control, so the bookmark
 * toggle appearing after mount shifts nothing.
 */
const CARD_RAIL =
  "flex min-h-6 items-center justify-between gap-2 sm:col-start-1 sm:row-start-1 sm:justify-start";

export function PresenterChips({ session }: { session: FlatSession }) {
  const names = presenterNames(session);
  if (names.length === 0) return null;

  return (
    // data-entry is what ENTRY_GRID places this by at lg. An attribute
    // rather than a wrapper element: /schedule renders 238 entries and a
    // wrapper each would be 238 more boxes to lay out.
    <ul data-entry="presenters" className="flex flex-wrap gap-1.5">
      {names.map((name) => (
        <li key={name}>
          <Badge variant="secondary">{name}</Badge>
        </li>
      ))}
    </ul>
  );
}

/**
 * The ministry, as a tinted chip rather than a grey line of text.
 *
 * The tint groups seventeen tags into four families (see
 * ../lib/ministry-tone.ts). It is a second cue, never the only one: the
 * ministry's name is written in the chip, so nothing here depends on
 * telling one muted hue from another.
 */
export function MinistryChip({
  session,
  className,
}: {
  session: Pick<FlatSession, "ministry">;
  className?: string;
}) {
  if (!session.ministry) return null;

  return (
    <p data-entry="ministry" className={cn("flex flex-wrap gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex items-center rounded-control px-2 py-0.5 text-xs font-medium",
          ministryChipClasses(session.ministry),
        )}
      >
        {ministryLabels[session.ministry]}
      </span>
    </p>
  );
}

/**
 * Programme changes surfaced right on the session they affect, so a
 * reader on Friday's day page sees a moved session without a separate
 * trip to /announcements. Distinct by more than the featured colour: an
 * icon and an "Update" label carry the same meaning independent of it.
 */
function SessionNotices({ sessionId }: { sessionId: string }) {
  const notices = announcementsBySessionId[sessionId];
  if (!notices || notices.length === 0) return null;

  return (
    <ul className="flex flex-col gap-1.5">
      {notices.map((notice: Announcement) => (
        <li key={notice.id}>
          <Link
            href="/announcements"
            className="flex items-start gap-1.5 rounded-control bg-featured/10 p-2 text-sm ring-1 ring-featured/40 transition-colors hover:bg-featured/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            <TriangleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0 text-featured" />
            <span>
              <span className="font-medium text-ink">Update: {notice.title}</span>{" "}
              <span className="text-ink-muted">{notice.body}</span>
            </span>
          </Link>
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
        ENTRY_GRID,
        "rounded-card bg-surface p-4 ring-1 ring-line",
        // A row is not a link and must not pretend to be one, so the hover
        // is on the hairline only — enough to say "this is the row under
        // your cursor", not enough to promise a click. The one thing in it
        // that IS interactive is a 16px bookmark icon, and it gains
        // contrast on the same hover so it can be found.
        "transition-[box-shadow] duration-fast ease-out-soft hover:ring-ink-muted/30",
        // Featured sessions carry real weight rather than an icon alone:
        // the ring takes the featured colour and the surface a trace of
        // it. Still not colour on its own — the star and its sr-only
        // label say the same thing.
        session.featured && "bg-featured/[0.04] ring-featured/35",
        "group/entry",
        className,
      )}
    >
      <div className={CARD_RAIL}>
        <TimeRange start={session.start} end={session.end} />
        {meta}
      </div>

      {showBlockLabel ? (
        <span className="text-xs tracking-wide text-ink-muted uppercase">
          {session.blockLabel}
        </span>
      ) : null}

      <Heading className="flex items-start gap-1.5 text-base leading-6 font-semibold text-ink">
        {session.featured ? (
          <Star
            aria-hidden
            className="mt-1 size-3.5 shrink-0 fill-featured text-featured"
          />
        ) : null}
        <span>
          {session.title}
          {session.featured ? (
            <span className="sr-only"> (highlighted session)</span>
          ) : null}
        </span>
      </Heading>

      {/*
        Inside the heading's own column rather than under the time rail,
        so the title and its subtitle read as one unit. Regular weight and
        full ink: it is the sentence a reader chooses the session by, so
        it must not be quieter than the note underneath it.
      */}
      {session.subtitle ? (
        <p className="text-sm leading-6 text-ink">{session.subtitle}</p>
      ) : null}

      <SessionNotices sessionId={session.id} />

      <PresenterChips session={session} />

      <MinistryChip session={session} />

      {session.note ? (
        <p className="text-sm text-ink-muted">{session.note}</p>
      ) : null}
    </article>
  );
}
