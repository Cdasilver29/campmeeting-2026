import Link from "next/link";
import type { DutyShift, DutyTeamId } from "@/data";
import { cn } from "@/lib/utils";
import { dutyTeams, isWholeTeamOn, type DutyPanel } from "../lib/duty";
import { SECTION_HEADING, UPCOMING_CARD, UPCOMING_EYEBROW } from "./card-styles";

/**
 * ── ON DUTY ──────────────────────────────────────────────────────────
 *
 * Who is serving today: elders, deacons, deaconesses and choristers,
 * split Morning and Afternoon as the rota gives them.
 *
 * It is Next Up's sibling and is built from the same three pieces —
 * UPCOMING_CARD for the surface, UPCOMING_EYEBROW for the small label,
 * SECTION_HEADING for the h2 — so the two read as one pair rather than as
 * two cards that happen to sit together. It changes by itself as the days
 * pass, off the same 30-second Africa/Nairobi tick Next Up runs on.
 *
 * ── WHY IT IS NOT A TABLE ────────────────────────────────────────────
 *
 * The source is a table and this is not one. Four teams by two shifts is
 * eight cells, and the cells are wildly uneven: one elder against nine
 * deaconesses. A real table gives every column the width of its longest
 * cell, so at 320px the elder column would be one name wide and the
 * deaconess column would need a scrollbar — which the brief rules out and
 * which would be the wrong answer anyway.
 *
 * So the table is transposed. Each shift is a section, each team a row
 * inside it with its label above its names at phone width and beside them
 * from `sm`. Nothing is truncated and nothing scrolls sideways: the
 * longest name in the whole rota, "Catherine Angwenyi", sets about 130px
 * at this size and the narrowest content box the site has is 288px.
 *
 * ── WHY THE NAMES ARE CHIPS ──────────────────────────────────────────
 *
 * Nine names in a row need separating, and running text separates them
 * with commas that then wrap to the start of a line and read as leading
 * punctuation. A chip is unambiguous at any wrap point, it is the same
 * device the programme already uses for presenters, and it is a surface
 * step rather than a new colour.
 */
export function OnDutyCard({ panel }: { panel: DutyPanel }) {
  const { day, duty, lead, currentShift } = panel;

  return (
    <section aria-labelledby="on-duty-heading" className="flex flex-col gap-3">
      <h2 id="on-duty-heading" className={SECTION_HEADING}>
        On duty
      </h2>

      <article className={cn(UPCOMING_CARD, "flex flex-col gap-4")}>
        <p className={UPCOMING_EYEBROW}>
          {lead ? `${lead}, ` : ""}
          {day.displayLabel}
        </p>

        {duty.note ? (
          <p className="text-sm text-ink-muted">{duty.note}</p>
        ) : null}

        {duty.shifts.map((shift, index) => (
          <div
            key={shift.shift}
            // A hairline between the two shifts, not a box around each.
            // The card already has an outline and a second one inside it
            // is a box in a box.
            className={cn(
              "flex flex-col gap-2",
              index > 0 && "border-t border-line pt-4",
            )}
          >
            <h3 className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-ink uppercase">
                {shift.shift}
              </span>
              {shift === currentShift ? (
                /* The word, not a dot. LiveDot means "this session is
                   running"; a shift is not a session, and reusing the
                   indicator would claim something the rota does not say.

                   The ring is doing the work, not the fill. accent-50 on
                   surface-muted is a two per cent step in light mode and
                   would read as no pill at all; the hairline is what
                   makes it one at both themes. */
                <span className="rounded-control bg-accent-50 px-1.5 py-0.5 text-xs font-semibold text-accent-600 ring-1 ring-accent-500/25">
                  On now
                </span>
              ) : null}
              {shift.note ? (
                <span className="text-xs font-normal text-ink-muted">
                  {shift.note}
                </span>
              ) : null}
            </h3>

            <dl className="flex flex-col gap-2">
              {dutyTeams.map((team) => (
                <TeamRow key={team.id} shift={shift} id={team.id} label={team.label} />
              ))}
            </dl>
          </div>
        ))}

        <p className="text-sm">
          <Link
            href={`/schedule/${day.id}`}
            className="rounded-control font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            {day.displayLabel} programme
          </Link>
        </p>
      </article>
    </section>
  );
}

/**
 * One team's names.
 *
 * Three states, and they are three different facts. A list of names. The
 * whole team, which the Sabbaths say and which must not render as an
 * empty list. And nobody rostered, which is what Friday afternoon says of
 * the elders and choristers and is printed rather than hidden — a row
 * that vanishes when it is empty makes the reader wonder whether they
 * scrolled past it.
 */
function TeamRow({
  shift,
  id,
  label,
}: {
  shift: DutyShift;
  id: DutyTeamId;
  label: string;
}) {
  const whole = isWholeTeamOn(shift, id);
  const names = shift[id];

  return (
    // Label above at phone width, beside from `sm`. The label column is
    // 7.5rem, which holds "Deaconesses" — the longest of the four — on
    // one line at this size with room to spare.
    <div className="sm:grid sm:grid-cols-[7.5rem_1fr] sm:gap-3">
      <dt className="text-xs font-medium tracking-wide text-ink-muted uppercase sm:pt-1">
        {label}
      </dt>
      <dd className="mt-1 sm:mt-0">
        {whole ? (
          <p className="text-sm text-ink">All {label.toLowerCase()} on duty</p>
        ) : names.length ? (
          <ul className="flex flex-wrap gap-1.5">
            {names.map((name) => (
              <li
                key={name}
                // bg-surface, and that is not arbitrary: the card itself
                // is surface-muted now, so a muted chip on it would have
                // been a chip with no edges. The chip is the lighter of
                // the two, which is also the way round the site reads
                // everywhere else — content sits on top of its ground.
                className="rounded-control bg-surface px-2 py-0.5 text-sm whitespace-nowrap text-ink ring-1 ring-line"
              >
                {name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">Not rostered</p>
        )}
      </dd>
    </div>
  );
}
