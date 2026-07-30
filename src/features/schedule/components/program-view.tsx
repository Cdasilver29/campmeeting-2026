import { blockGaps, dayNumber, type BlockGroup, type DayGroup, type ScheduleGap } from "../lib/entries";
import { AllBlockCard } from "./all-block-card";
import { BookmarkToggle } from "./bookmark-toggle";
import { SessionCard } from "./session-card";

/**
 * A labelled hole in a block. The closing Sabbath stops at 15:00 and
 * restarts at 16:00 with nothing in between; saying so is kinder than
 * leaving the reader to notice the jump and wonder what is missing.
 */
function GapMarker({ gap }: { gap: ScheduleGap }) {
  return (
    <p className="flex items-center gap-3 pb-3 text-xs text-ink-muted">
      <span aria-hidden className="h-px flex-1 bg-line" />
      <span className="tabular-figures">
        Nothing scheduled {gap.start} to {gap.end}
      </span>
      <span aria-hidden className="h-px flex-1 bg-line" />
    </p>
  );
}

function BlockSection({
  group,
  dayId,
  showGaps,
}: {
  group: BlockGroup;
  dayId: string;
  showGaps: boolean;
}) {
  const headingId = `block-${dayId}-${group.block.id}`;
  const gaps = showGaps ? blockGaps(group.entries) : undefined;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      {/* A real divider in the display face, not bold body text. The block
          is the second level of the programme's structure and reads as
          one. */}
      <h3
        id={headingId}
        className="border-b border-line pb-1.5 font-display text-xl text-ink"
      >
        {group.block.label}
      </h3>

      {/*
        The rail connecting a block's sessions is a border on this list,
        drawn once per block. Not an element per row: `/schedule` renders
        237 entries and a rail segment each would be 237 more.
      */}
      <ol className="flex flex-col gap-3 border-l-2 border-line pl-4 sm:pl-6">
        {group.entries.map((entry) => {
          const gap = gaps?.get(entry.key);
          return (
            <li key={entry.key}>
              {gap ? <GapMarker gap={gap} /> : null}
              {entry.kind === "session" ? (
                <SessionCard
                  session={entry.session}
                  headingLevel="h4"
                  showBlockLabel={false}
                  meta={
                    <BookmarkToggle
                      sessionId={entry.key}
                      title={entry.session.title}
                    />
                  }
                />
              ) : (
                // Untimed activities are not saveable: a bookmark keys
                // off a session id and an all-block activity has none.
                <AllBlockCard
                  activity={entry.activity}
                  blockLabel={entry.blockLabel}
                />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/**
 * How tall a day is likely to be, for `contain-intrinsic-size`.
 *
 * Only used for days that have never been on screen: the `auto` keyword
 * means the browser replaces this with the real measurement the first
 * time it renders one. So this needs to be roughly right, not exact —
 * being roughly right is what keeps the scrollbar honest before anything
 * has scrolled.
 *
 * Derived from the parts rather than measured and pasted, so a future
 * year's programme with different day lengths still gets a sane number.
 * Against the 2026 programme it totals about 27,000px where the rendered
 * document is about 27,700.
 */
function intrinsicHeight(group: DayGroup): number {
  return 140 + group.blocks.length * 64 + group.count * 100;
}

function DaySection({ group, showGaps }: { group: DayGroup; showGaps: boolean }) {
  const headingId = `day-${group.day.id}-heading`;

  return (
    // The id is the deep-link target for /schedule?day=…; scroll-mt clears
    // both the sticky site header and the sticky day rail beneath it.
    //
    // content-visibility: auto skips style, layout and paint for days that
    // are not near the viewport, which on a 27,000px page is nearly all of
    // them. Measured on /schedule, forced style+layout of the whole
    // programme: 7.30ms without, 0.90ms with. The content stays in the DOM
    // and in the accessibility tree, so the page still reads offline and
    // before hydration, which is the reason it is server-rendered whole.
    <section
      id={`day-${group.day.id}`}
      aria-labelledby={headingId}
      // scroll-margin from --scroll-offset, which day-rail-behaviour.tsx
      // sets to the measured header plus the measured rail. The 10rem
      // fallback is what this was hardcoded to and is what applies before
      // hydration, which is also when a deep link is most likely to land.
      className="flex scroll-mt-[var(--scroll-offset,10rem)] flex-col gap-6 [content-visibility:auto]"
      style={{ containIntrinsicSize: `auto ${intrinsicHeight(group)}px` }}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-ink/15 pb-2">
        <h2 id={headingId} className="font-display text-3xl text-ink">
          {group.day.displayLabel}
        </h2>
        <p className="flex items-baseline gap-3 text-sm text-ink-muted">
          <span>Day {dayNumber(group.day.id)}</span>
          <time dateTime={group.day.date} className="tabular-figures">
            {group.day.date}
          </time>
        </p>
      </header>

      <div className="flex flex-col gap-8">
        {group.blocks.map((blockGroup) => (
          <BlockSection
            key={blockGroup.block.id}
            group={blockGroup}
            dayId={group.day.id}
            showGaps={showGaps}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * The programme itself. Pure and server-renderable: it takes grouped
 * entries and draws them, so the prerendered fallback and the filtered
 * client view are the same component rather than two that must be kept
 * looking alike.
 */
export function ProgramView({
  groups,
  showGaps = true,
}: {
  groups: DayGroup[];
  /** Off once a filter is on: the remaining holes are the filter's, not the programme's. */
  showGaps?: boolean;
}) {
  return (
    <div className="flex flex-col gap-14">
      {groups.map((group) => (
        <DaySection key={group.day.id} group={group} showGaps={showGaps} />
      ))}
    </div>
  );
}
