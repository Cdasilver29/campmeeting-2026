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
 * It is Next Up's sibling and is built from the same pieces —
 * UPCOMING_CARD for the surface, UPCOMING_EYEBROW for the small label,
 * SECTION_HEADING for the h2 — so the two read as one pair rather than as
 * two cards that happen to sit together. It changes by itself as the days
 * pass, off the same 30-second Africa/Nairobi tick Next Up runs on.
 *
 * ── IT IS A REAL TABLE, AT EVERY WIDTH ───────────────────────────────
 *
 * Four teams across, the shifts down, and the source's own column
 * headings. Not a stacked list that turns into a table at `md`, and not a
 * table that turns into a stacked list below it: one `<table>`, one DOM,
 * the same reading at 320 and at 1440. A responsive table that swaps
 * layouts either duplicates the markup or breaks the table semantics that
 * make it navigable in the first place.
 *
 * ── HOW IT FITS 320px ────────────────────────────────────────────────
 *
 * `table-fixed` with declared column widths, and that is a correction
 * rather than a first guess. Auto layout was tried first, on the
 * reasoning that it would size each column to its own longest word: it
 * does, and then it lets the TABLE overflow rather than shrinking the
 * columns, so at 320 the Choristers column was cut off at the card's
 * edge. Auto layout fits content to columns; it does not fit columns to a
 * box.
 *
 * The widths are 25/23/28/24 rather than four 25s, weighted to what each
 * column actually holds: the deaconess column carries the two longest
 * names in the rota ("Scholastica", "Angwenyi") and up to nine of them,
 * the deacons' are the shortest.
 *
 * Two things give at 320 and both are below `sm` only. The headings drop
 * to sentence case at 10px, because "DEACONESSES" set uppercase with
 * tracking needs 79px in a 69px column and is the one string in the table
 * that cannot wrap. And the whole-team cell reads "All on duty" rather
 * than "All deaconesses" — the column already names the team, so the
 * longer form said it twice AND was 2px too wide to say it in.
 *
 * From 360 up nothing gives: uppercase headings, 14px names, and every
 * cell inside its own column. Checked at 320, 360, 390, 768 and 1280.
 *
 * The shift is a full-width row spanning all four columns rather than a
 * fifth column of its own. A row-header column would have been a fifth
 * thing to fit in 288px, and "Afternoon" is wider than three of the four
 * name columns.
 *
 * One name per line inside a cell, not chips: a chip's padding is
 * horizontal space, and horizontal space is the whole constraint here.
 */
export function OnDutyCard({ panel }: { panel: DutyPanel }) {
  const { day, duty, lead, currentShift } = panel;

  return (
    <section aria-labelledby="on-duty-heading" className="flex flex-col gap-3">
      <h2 id="on-duty-heading" className={SECTION_HEADING}>
        On duty
      </h2>

      <article className={cn(UPCOMING_CARD, "flex flex-col gap-3")}>
        <p className={UPCOMING_EYEBROW}>
          {lead ? `${lead}, ` : ""}
          {day.displayLabel}
        </p>

        {duty.note ? (
          <p className="text-sm text-ink-muted">{duty.note}</p>
        ) : null}

        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">
            {`Duty rota for ${day.displayLabel}, by team and shift`}
          </caption>
          {/* Declared here rather than as a class on each th, so the
              widths are one row of numbers that add to 100 and can be
              read as such. */}
          <colgroup>
            <col className="w-[25%]" />
            <col className="w-[23%]" />
            <col className="w-[28%]" />
            <col className="w-[24%]" />
          </colgroup>
          <thead>
            <tr>
              {dutyTeams.map((team) => (
                <th
                  key={team.id}
                  scope="col"
                  // align-bottom so a heading that wraps to two lines
                  // ("Deaconesses" does, at 320) sits on the same
                  // baseline as the three that do not.
                  className="border-b border-line px-0.5 pb-1.5 align-bottom text-[0.625rem] font-semibold tracking-normal text-ink-muted hyphens-auto sm:px-3 sm:text-xs sm:tracking-wide sm:uppercase"
                >
                  {team.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* One tbody per shift, which is what makes the shift a row
              GROUP rather than a row: a screen reader announces it as the
              heading of the rows under it. */}
          {duty.shifts.map((shift) => (
            <tbody key={shift.shift}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={dutyTeams.length}
                  className="px-0.5 pt-3 pb-1 sm:px-3"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold tracking-wide text-ink uppercase">
                      {shift.shift}
                    </span>
                    {shift === currentShift ? (
                      /* The word, not a dot. LiveDot means "this session
                         is running"; a shift is not a session, and
                         reusing the indicator would claim something the
                         rota does not say.

                         The ring does the work, not the fill: accent-50
                         on surface-muted is a two per cent step in light
                         mode and would read as no pill at all. */
                      <span className="rounded-control bg-accent-50 px-1.5 py-0.5 text-xs font-semibold text-accent-600 ring-1 ring-accent-500/25">
                        On now
                      </span>
                    ) : null}
                    {shift.note ? (
                      <span className="text-xs font-normal text-ink-muted">
                        {shift.note}
                      </span>
                    ) : null}
                  </span>
                </th>
              </tr>
              <tr>
                {dutyTeams.map((team) => (
                  <TeamCell key={team.id} shift={shift} id={team.id} />
                ))}
              </tr>
            </tbody>
          ))}
        </table>

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
 * One team's names for one shift.
 *
 * Three states, and they are three different facts. A list of names. The
 * whole team, which both Sabbaths say and which must not render as an
 * empty cell. And nobody rostered, which is what Friday afternoon says of
 * the elders and choristers and is printed rather than left blank — an
 * empty cell in a table reads as missing data, and this is not missing.
 */
function TeamCell({ shift, id }: { shift: DutyShift; id: DutyTeamId }) {
  const whole = isWholeTeamOn(shift, id);
  const names = shift[id];

  return (
    // hyphens-auto is the safety net, not the plan. Every name in the
    // 2026 rota fits its column whole; a longer one in a future year
    // hyphenates rather than pushing the table past the card's edge,
    // which is the failure that is actually hard to see coming.
    <td className="px-0.5 py-1 align-top text-[0.6875rem] leading-5 text-ink hyphens-auto sm:px-3 sm:text-sm sm:leading-6">
      {whole ? (
        <span className="text-ink">All on duty</span>
      ) : names.length ? (
        <ul>
          {names.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      ) : (
        <span className="text-ink-muted">Not rostered</span>
      )}
    </td>
  );
}
