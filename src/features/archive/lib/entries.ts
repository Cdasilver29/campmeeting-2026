import {
  archiveSessionCount,
  archiveVideoCount,
  archiveYears,
  latestArchiveYear,
  type ArchiveTheme,
  type ArchiveVideo,
  type ArchiveYear,
} from "@/data/archive";

/**
 * What the archive pages read.
 *
 * Everything here is derived from src/data/archive and from nothing else.
 * No import from program.ts, event.ts or any schedule helper — see the
 * note at the top of src/data/archive/types.ts for why that boundary is
 * the point of the feature rather than a tidiness preference.
 *
 * A consequence worth stating: the date labels below are formatted here
 * rather than borrowed from features/schedule/lib/entries.ts, which reads
 * `program`. A dozen lines of Intl is the price of the archive surviving
 * next year's data swap untouched.
 */

/**
 * "15 August 2026" from "2026-08-15".
 *
 * UTC, deliberately. These are plain calendar dates with no time and no
 * place attached; parsed as local they would land a few hours either side
 * of midnight and render as the day before for a reader west of Nairobi.
 */
const DATE_LABEL = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function dateLabel(isoDate: string): string {
  return DATE_LABEL.format(new Date(`${isoDate}T00:00:00Z`));
}

/**
 * The line under a card's title: the date, and the part of the day where
 * the document gave one.
 *
 * One row of 2026 has no part. It gets the date alone rather than an
 * invented "Morning" — see the note in src/data/archive/year-2026.ts.
 */
export function whenLabel(video: ArchiveVideo): string {
  return video.part
    ? `${dateLabel(video.date)} · ${video.part}`
    : dateLabel(video.date);
}

/** "Pr. Kenneth Ayuo" or "Dr. Preskilla Munda and Mercy Oduwour". */
export function speakerLabel(video: ArchiveVideo): string {
  const [first, ...rest] = video.speakers;
  if (!first) return "";
  if (!rest.length) return first;
  return `${video.speakers.slice(0, -1).join(", ")} and ${rest[rest.length - 1]}`;
}

/**
 * A stable key for one video.
 *
 * Not the videoId: one session has none, and a `key` that is `undefined`
 * for one row of a list is a React warning and a re-mount. Date, part and
 * title together are unique across the 2026 set and cannot collide — two
 * sessions cannot share all three.
 */
export function videoKey(video: ArchiveVideo): string {
  return `${video.date}-${video.part ?? "unstated"}-${video.title}`;
}

/** Every video in a year, in theme order then chronological. */
export function yearVideos(entry: ArchiveYear): ArchiveVideo[] {
  return entry.themes.flatMap((theme) => theme.videos);
}

/**
 * Every distinct speaker in a year, alphabetically, for the filter.
 *
 * Sorted by the name as printed, honorific included. "Dr. Preskilla
 * Munda" therefore files under D. That is worse alphabetically and better
 * in use: the filter is a short list a reader scans rather than searches,
 * and stripping honorifics to sort by surname would mean the label in the
 * list and its position in the list disagreeing.
 */
export function yearSpeakers(entry: ArchiveYear): string[] {
  const names = new Set<string>();
  for (const video of yearVideos(entry)) {
    for (const name of video.speakers) names.add(name);
  }
  return [...names].sort((a, b) => a.localeCompare(b, "en"));
}

/** Themes that still have a video in them once a filter has been applied. */
export function filterThemes(
  themes: ArchiveTheme[],
  keep: (video: ArchiveVideo) => boolean,
): ArchiveTheme[] {
  return themes
    .map((theme) => ({ ...theme, videos: theme.videos.filter(keep) }))
    .filter((theme) => theme.videos.length > 0);
}

/**
 * Does this video match a free-text query?
 *
 * Title, subtitle and speakers. Not the date: "2026" would match every
 * row of the year and "August" every row of the archive, so a date search
 * returns the whole page and reads as a search that did not work.
 */
export function matchesQuery(video: ArchiveVideo, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [video.title, video.subtitle ?? "", ...video.speakers]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

/**
 * How many recordings the most recent archived year holds.
 *
 * Named for the year rather than for the archive, because that is what
 * the sentences using it say: "54 recordings from 2026". A site-wide
 * total lived here first and was wrong in waiting — the moment a themed
 * breakdown is added to 2024 it would have grown, while the sentence
 * around it still said "from 2026".
 */
export const latestYearRecordings = archiveVideoCount(latestArchiveYear);

/** Years held only as a playlist, for the page's own summary line. */
export const playlistYearCount = archiveYears.filter(
  (entry) => entry.playlistId,
).length;

/**
 * The earliest year in the archive, for "back to 2020".
 *
 * Read off the sorted list rather than written down, so the sentence on
 * the page follows the data.
 */
export const earliestArchiveYear: ArchiveYear =
  archiveYears[archiveYears.length - 1] ?? archiveYears[0];

export {
  archiveYears,
  archiveSessionCount,
  archiveVideoCount,
  latestArchiveYear,
};
