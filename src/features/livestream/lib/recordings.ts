import { program, type ProgramDay } from "@/data";
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
 * It is now the shape of the whole week — eight days, morning and
 * afternoon, sixteen slots — with the recordings dropped into it. Days
 * with nothing posted are still rendered, in place, as unavailable.
 *
 * That is the point of it. A reader looking for Tuesday morning gets an
 * answer either way: here it is, or it is not up yet. The old list could
 * only answer the first, and a missing day was indistinguishable from a
 * day that never happened. It also means the page reads as a week filling
 * in rather than as a pile of links, which is what somebody checking back
 * on the Thursday is actually watching.
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
  /** Always both parts, in the order a day runs them. */
  slots: ArchiveSlot[];
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
  slots: RECORDING_PARTS.map((part) => ({
    part,
    partLabel: PART_LABEL[part],
    recording: bySlot.get(`${day.id}:${part}`),
  })),
}));

/** How many of the week's streams have been posted, and how many there are. */
export const recordingCount = bySlot.size;
export const totalSlots = program.length * RECORDING_PARTS.length;

export const hasRecordings = recordingCount > 0;
