import { program, type ProgramDay } from "@/data";
import { fullDayLabel } from "@/features/schedule/lib/entries";
import { recordings, type Recording } from "../config";

/**
 * The curated recordings list, ordered and joined to the programme.
 *
 * ── WHY THE ORDER IS NOT THE ARRAY'S ─────────────────────────────────
 *
 * The whole point of the workflow in DEPLOY.md is that adding a recording
 * is one pasted line and nothing else. If the array's order were the
 * rendered order, "newest first" would mean pasting each new line at the
 * TOP of the array — which is the one instruction a person typing on a
 * phone at the end of a long day will get wrong, and getting it wrong
 * produces a list that is silently in the wrong order rather than an
 * error anybody sees.
 *
 * So the order is derived: each recording's position is its day's position
 * in `program`, reversed. A line appended at the end of the array sorts
 * into the right place on its own. Two recordings of the same day keep the
 * order they were written in, which is the only thing the array can
 * usefully say — Array.prototype.sort is stable in every engine this
 * ships to.
 *
 * ── AN UNKNOWN dayId FAILS THE BUILD ─────────────────────────────────
 *
 * Not silently dropped and not rendered without its link. A typo in a day
 * id is a link to a programme day that does not exist, which is a 404 from
 * the page whose job that week is to be the catch-up. Every route here is
 * statically generated, so throwing at module scope surfaces during
 * `next build` as a prerender failure on /livestream and the deploy stops
 * — the same trade `src/features/forms/lib/web3forms.ts` makes, and for
 * the same reason: a loud failure at build time is cheaper than a quiet
 * one in front of readers.
 */
export interface ResolvedRecording extends Recording {
  day: ProgramDay;
  /** "Sabbath 15th August", as the schedule writes it. */
  dayLabel: string;
  /** The programme day this is a recording of. */
  dayHref: string;
}

const dayOrder = new Map(program.map((day, i) => [day.id, i]));

export const resolvedRecordings: ResolvedRecording[] = recordings
  .map((entry) => {
    const day = program.find((d) => d.id === entry.dayId);
    if (!day) {
      throw new Error(
        `Recording "${entry.label}" has dayId "${entry.dayId}", which is not a day in src/data/program.ts. ` +
          `Valid ids: ${program.map((d) => d.id).join(", ")}. See src/features/livestream/config.ts.`,
      );
    }
    return {
      ...entry,
      day,
      dayLabel: fullDayLabel(day),
      dayHref: `/schedule/${day.id}`,
    };
  })
  // Newest day first. `??` is unreachable given the throw above and is
  // written so the comparator does not depend on that being true.
  .sort((a, b) => (dayOrder.get(b.dayId) ?? 0) - (dayOrder.get(a.dayId) ?? 0));

export const hasRecordings = resolvedRecordings.length > 0;
