import { blockGaps, type BlockGroup, type DayGroup, type ScheduleGap } from "../lib/entries";
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
      <h3
        id={headingId}
        className="text-sm font-medium tracking-wide text-ink-muted uppercase"
      >
        {group.block.label}
      </h3>

      <ol className="flex flex-col gap-3">
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

function DaySection({ group, showGaps }: { group: DayGroup; showGaps: boolean }) {
  const headingId = `day-${group.day.id}-heading`;

  return (
    // The id is the deep-link target for /schedule?day=…; scroll-mt keeps
    // the heading clear of the sticky site header once scrolled to.
    <section
      id={`day-${group.day.id}`}
      aria-labelledby={headingId}
      className="flex scroll-mt-24 flex-col gap-6"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-2">
        <h2 id={headingId} className="font-display text-3xl text-ink">
          {group.day.displayLabel}
        </h2>
        <time
          dateTime={group.day.date}
          className="tabular-figures text-sm text-ink-muted"
        >
          {group.day.date}
        </time>
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
