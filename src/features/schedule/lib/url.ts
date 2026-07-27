import { getDay, speakerById, type MinistryTag } from "@/data";
import { ministryLabels } from "./today";

export const SCHEDULE_PATH = "/schedule";

/**
 * The whole state of the programme browser. It lives in the query string
 * and nowhere else, so any view a reader is looking at can be copied out
 * of the address bar and sent to someone, and the back button walks the
 * filter history rather than leaving the page.
 *
 * Params: q, day, ministry, speaker, view.
 */
export interface ScheduleFilters {
  /** Free text over title, presenters and ministry. */
  q: string;
  /** Programme day id, e.g. "friday-21". Doubles as the day tab. */
  day?: string;
  ministry?: MinistryTag;
  /** Speaker id from speakers.ts. */
  speaker?: string;
  /** view=mine — bookmarked sessions only. */
  mine: boolean;
}

export const emptyFilters: ScheduleFilters = { q: "", mine: false };

/** Structural match for both URLSearchParams and Next's readonly wrapper. */
interface ReadableParams {
  get(name: string): string | null;
}

/**
 * Query string to filter state. A value that no longer exists in the
 * data is dropped rather than honoured: a link shared before a programme
 * update then opens a wider view instead of an empty one, which is the
 * failure a reader can recover from.
 */
export function parseScheduleFilters(params: ReadableParams): ScheduleFilters {
  const day = params.get("day");
  const ministry = params.get("ministry");
  const speaker = params.get("speaker");

  return {
    q: (params.get("q") ?? "").trim(),
    day: day && getDay(day) ? day : undefined,
    ministry:
      ministry && ministry in ministryLabels
        ? (ministry as MinistryTag)
        : undefined,
    speaker: speaker && speakerById[speaker] ? speaker : undefined,
    mine: params.get("view") === "mine",
  };
}

/**
 * Filter state back to a URL. Defaults are omitted rather than written
 * out empty, so the unfiltered programme is plain "/schedule" and two
 * readers who reach the same view get the same link.
 */
export function scheduleHref(filters: Partial<ScheduleFilters>): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.day) params.set("day", filters.day);
  if (filters.ministry) params.set("ministry", filters.ministry);
  if (filters.speaker) params.set("speaker", filters.speaker);
  if (filters.mine) params.set("view", "mine");

  const query = params.toString();
  return query ? `${SCHEDULE_PATH}?${query}` : SCHEDULE_PATH;
}

export function hasActiveFilters(filters: ScheduleFilters): boolean {
  return Boolean(
    filters.q ||
      filters.day ||
      filters.ministry ||
      filters.speaker ||
      filters.mine,
  );
}
