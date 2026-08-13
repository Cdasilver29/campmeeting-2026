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

      {activity.providers?.length ? (
        <ProviderList
          providers={activity.providers}
          standingNotes={activity.standingNotes}
          headingLevel={Heading === "h2" ? "h3" : Heading === "h3" ? "h4" : "h5"}
        />
      ) : null}
    </article>
  );
}

/**
 * The Medical Camp's four providers.
 *
 * ── WHY IT IS OPEN RATHER THAN BEHIND A DISCLOSURE ──────────────────
 *
 * Twenty services inside a timeline would normally be a `<details>`. Not
 * here: Sunday's Morning Service block has NO timed sessions, so this
 * activity is not competing with a timeline — it is the whole of Sunday
 * morning, on the day page and in the full programme alike. A tap
 * standing between an attendee and "is there a blood pressure check" is a
 * tap that buys nothing back.
 *
 * ── AT 320 ──────────────────────────────────────────────────────────
 *
 * One column, and it stays one column until `sm`. The source is a
 * four-column table and four columns of clinical services do not go into
 * 320px by any arrangement, so the table is transposed into stacked
 * sections rather than scrolled sideways. Each provider is a heading, its
 * terms a small caps line, its services a plain list — nothing is
 * truncated, nothing is ellipsised, and the longest single service name
 * ("Laboratory services, including tuberculosis (TB) screening") wraps to
 * three lines and is still whole.
 *
 * From `sm` up, two columns, because the four sections are independent of
 * each other and reading them side by side is faster. `break-inside:avoid`
 * keeps a provider from splitting across the column break, which is the
 * one thing that would make a two-column read worse than a one-column one.
 */
function ProviderList({
  providers,
  standingNotes,
  headingLevel: Heading,
}: {
  providers: NonNullable<BlockActivity["providers"]>;
  standingNotes?: string[];
  headingLevel: "h3" | "h4" | "h5";
}) {
  return (
    <div className="mt-1 flex flex-col gap-4">
      <div className="gap-4 sm:columns-2 sm:gap-6">
        {providers.map((provider) => (
          <section
            key={provider.name}
            // The margin is bottom-only and the last child clears it, so
            // the two columns start level with each other.
            className="mb-4 break-inside-avoid last:mb-0"
          >
            <Heading className="text-sm leading-5 font-semibold text-ink">
              {provider.name}
            </Heading>
            {provider.serviceGroups.map((group) => (
              <div key={group.terms} className="mt-2">
                <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">
                  {group.terms}
                </p>
                {/* Markers outside the text box would need a left
                    indent this card has no room for at 320. `list-inside`
                    with a hanging indent keeps the bullet visible and the
                    wrapped lines aligned under the first word. */}
                <ul className="mt-1 space-y-0.5 text-sm text-ink-muted">
                  {group.services.map((service) => (
                    <li
                      key={service}
                      className="relative pl-3.5 before:absolute before:top-2 before:left-0 before:size-1 before:rounded-full before:bg-ink-muted/60 before:content-['']"
                    >
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </div>

      {standingNotes?.length ? (
        <p className="border-t border-line pt-3 text-sm font-medium text-ink">
          {standingNotes.join(" ")}
        </p>
      ) : null}
    </div>
  );
}
