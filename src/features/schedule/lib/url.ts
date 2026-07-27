import { getDay, speakerById, type MinistryTag } from "@/data";
import { ministryLabels } from "./today";

export const SCHEDULE_PATH = "/schedule";

/**
 * The programme page for one day, or the whole programme when no day is
 * given. Days are routes rather than a query param: each one is a page
 * that can carry its own title and description, so a link dropped into a
 * WhatsApp thread previews as that day instead of as the whole week.
 */
export function dayPath(dayId?: string): string {
  return dayId ? `${SCHEDULE_PATH}/${dayId}` : SCHEDULE_PATH;
}

/**
 * The whole state of the programme browser. It lives in the URL and
 * nowhere else, so any view a reader is looking at can be copied out of
 * the address bar and sent to someone, and the back button walks the
 * filter history rather than leaving the page.
 *
 * The day is the path, /schedule/{day}. Everything else is the query
 * string: q, ministry, speaker, view.
 */
export interface ScheduleFilters {
  /** Free text over title, presenters and ministry. */
  q: string;
  /** Programme day id, e.g. "friday-21". From the route, not the query. */
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
 * URL to filter state: the query string, plus the day the route is for.
 * A value that no longer exists in the data is dropped rather than
 * honoured, so a link shared before a programme update opens a wider view
 * instead of an empty one, which is the failure a reader can recover from.
 */
export function parseScheduleFilters(
  params: ReadableParams,
  day?: string,
): ScheduleFilters {
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
  if (filters.ministry) params.set("ministry", filters.ministry);
  if (filters.speaker) params.set("speaker", filters.speaker);
  if (filters.mine) params.set("view", "mine");

  const path = dayPath(filters.day);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

/**
 * Whether anything is narrowing the page a reader is on, which is what
 * "Clear filters" undoes. The day is not one of them: it is the route,
 * and clearing the filters keeps the reader on the day they opened.
 */
export function hasActiveFilters(filters: ScheduleFilters): boolean {
  return Boolean(
    filters.q || filters.ministry || filters.speaker || filters.mine,
  );
}
