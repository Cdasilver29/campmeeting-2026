import { program, type BlockId, type ProgramDay } from "@/data";
import { fullDayLabel } from "@/features/schedule/lib/entries";
import {
  PART_LABEL,
  RECORDING_PARTS,
  recordings,
  type Recording,
  type RecordingPart,
} from "../config";

/**
 * The archive: every day of the week, in programme order, with a slot for
 * each of its two streams.
 *
 * ── THE GRID IS THE PROGRAMME'S, NOT THE ARRAY'S ─────────────────────
 *
 * This used to be a list of whatever had been posted, sorted newest first.
 * It is now the shape of the whole week — every day, morning and
 * afternoon — with the recordings dropped into it. Days with nothing
 * posted are still rendered, in place, as unavailable.
 *
 * That is the point of it. A reader looking for Tuesday morning gets an
 * answer either way: here it is, or it is not up yet. The old list could
 * only answer the first, and a missing day was indistinguishable from a
 * day that never happened. It also means the page reads as a week filling
 * in rather than as a pile of links, which is what somebody checking back
 * on the Thursday is actually watching.
 *
 * ── AND A HALF-DAY WITH NO SERVICES HAS NO SLOT AT ALL ───────────────
 *
 * Fourteen slots, not sixteen. "Not posted yet" is a promise that a video
 * is coming, and on two halves of this week nothing was ever going to be
 * broadcast because nothing is scheduled:
 *
 *   - SUNDAY MORNING is the Medical Camp — an untimed all-block activity
 *     with no sessions and no sermon. There is no Day 2 morning stream
 *     and there will not be one.
 *   - FRIDAY AFTERNOON AND EVENING is Sabbath Preparation, and the
 *     committee has confirmed there is no Friday evening service.
 *
 * Both are read from `program` rather than listed here: a half-day whose
 * blocks hold no timed sessions is a half-day nobody streams. So the two
 * gaps cannot drift from the programme, and a future year that schedules
 * a Sunday morning gets its slot back by editing the schedule, which is
 * where that fact belongs.
 *
 * A slot is ALSO drawn wherever a recording actually exists, whatever the
 * programme says. That way this rule can never swallow a posted video: if
 * the committee streams the Medical Camp after all, the line added to
 * `recordings` appears in place rather than failing a build mid-week or,
 * worse, vanishing.
 *
 * Order is day 1 to day 8, forwards. Not newest first: this is a grid of
 * fixed size that a reader scans for a known position, and the position of
 * Tuesday should not move because Wednesday was uploaded.
 *
 * A line appended anywhere in `recordings` still lands in the right place,
 * which was the property the old sort existed to protect — see DEPLOY.md.
 *
 * ── TWO WAYS TO FAIL THE BUILD ───────────────────────────────────────
 *
 * An unknown `dayId`, as before: a link to a programme day that does not
 * exist is a 404 from the page whose whole job that week is the catch-up.
 *
 * And the same day and part written TWICE, which is new and is the cost of
 * a fixed grid: one slot cannot hold two videos, so the second would
 * silently replace the first and nobody would find out until somebody went
 * looking for a stream that had been published and then vanished.
 *
 * Every route here is statically generated, so throwing at module scope
 * surfaces during `next build` as a prerender failure on /livestream and
 * the deploy stops — the same trade src/features/forms/lib/web3forms.ts
 * makes, and for the same reason: a loud failure at build time is cheaper
 * than a quiet one in front of readers.
 */
export interface ResolvedRecording extends Recording {
  /** `label` where one was written, otherwise the part's own name. */
  title: string;
}

export interface ArchiveSlot {
  part: RecordingPart;
  /** "Morning" / "Afternoon". */
  partLabel: string;
  /** Absent until the video is posted. The slot renders either way. */
  recording?: ResolvedRecording;
}

export interface ArchiveDay {
  day: ProgramDay;
  /** 1-based position in the programme, for "Day 3". */
  dayNumber: number;
  /** "Sabbath 15th August 2026", as the schedule writes it. */
  dayLabel: string;
  /** The programme day these are recordings of. */
  dayHref: string;
  /**
   * The parts of this day that are broadcast, in the order it runs them.
   * Usually both. One on the two half-days the programme leaves empty —
   * see the note above.
   */
  slots: ArchiveSlot[];
}

/**
 * Which programme blocks each half of the day covers.
 *
 * The stream names are the halves of the DAY and the block ids are the
 * programme's own, so the mapping has to be written down somewhere; this
 * is the one place. A morning stream runs from the Morning Service
 * through the Divine or Mid Morning Service; an afternoon stream picks up
 * at the Afternoon Program and runs through the Evening Service.
 *
 * Typed as `BlockId[]` so a renamed block in program.ts fails the build
 * here rather than quietly matching nothing and deleting a slot.
 */
const PART_BLOCKS: Record<RecordingPart, readonly BlockId[]> = {
  morning: ["morning-service", "mid-morning-service", "divine-service"],
  afternoon: ["afternoon-program", "evening-service"],
};

/**
 * Is anything scheduled in this half of this day?
 *
 * Timed sessions only. `allBlockActivity` is deliberately not counted:
 * the two blocks that carry one — Sunday's Medical Camp and Friday's
 * Sabbath Preparation — are exactly the two halves nobody broadcasts.
 */
function isBroadcast(day: ProgramDay, part: RecordingPart): boolean {
  return day.blocks.some(
    (block) =>
      PART_BLOCKS[part].includes(block.id) && block.sessions.length > 0,
  );
}

/** Keyed by `${dayId}:${part}`, which is the slot a recording belongs to. */
const bySlot = new Map<string, ResolvedRecording>();

for (const entry of recordings) {
  if (!program.some((day) => day.id === entry.dayId)) {
    throw new Error(
      `Recording "${entry.videoId}" has dayId "${entry.dayId}", which is not a day in src/data/program.ts. ` +
        `Valid ids: ${program.map((d) => d.id).join(", ")}. See src/features/livestream/config.ts.`,
    );
  }

  const key = `${entry.dayId}:${entry.part}`;
  const clash = bySlot.get(key);
  if (clash) {
    throw new Error(
      `Two recordings are both "${entry.dayId}" / "${entry.part}": ${clash.videoId} and ${entry.videoId}. ` +
        `Each day has one morning stream and one afternoon stream, so one of these has the wrong day or the wrong part. ` +
        `See src/features/livestream/config.ts.`,
    );
  }

  bySlot.set(key, { ...entry, title: entry.label ?? PART_LABEL[entry.part] });
}

export const archiveDays: ArchiveDay[] = program.map((day, index) => ({
  day,
  dayNumber: index + 1,
  dayLabel: fullDayLabel(day),
  dayHref: `/schedule/${day.id}`,
  slots: RECORDING_PARTS.filter(
    // Scheduled, or posted anyway. See the note at the top of the file.
    (part) => isBroadcast(day, part) || bySlot.has(`${day.id}:${part}`),
  ).map((part) => ({
    part,
    partLabel: PART_LABEL[part],
    recording: bySlot.get(`${day.id}:${part}`),
  })),
}));

/** How many of the week's streams have been posted, and how many there are. */
export const recordingCount = bySlot.size;
/**
 * Counted from the grid rather than as days times parts, because the grid
 * is no longer a rectangle: two half-days of the week hold no service and
 * are not slots. "3 of 14" has to mean the fourteen a reader can see.
 */
export const totalSlots = archiveDays.reduce(
  (total, entry) => total + entry.slots.length,
  0,
);

export const hasRecordings = recordingCount > 0;
