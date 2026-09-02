import { archive2026 } from "./year-2026";
import { archivePlaylistYears } from "./playlist-years";
import type { ArchiveYear } from "./types";

export type {
  ArchivePart,
  ArchiveTheme,
  ArchiveVideo,
  ArchiveYear,
} from "./types";

/**
 * Every archived camp meeting, newest first.
 *
 * ── ADDING A YEAR ────────────────────────────────────────────────────
 *
 * Write src/data/archive/year-2027.ts in the shape of year-2026.ts and
 * add it to the array below. That is the whole change: the year selector,
 * the default year, the page's meta line and the home page's showcase are
 * all derived from this list, so none of them is edited.
 *
 * The sort is here rather than trusted to the order of the array, because
 * "most recent" is load-bearing in three places — see `latestArchiveYear`
 * below — and a year appended in the wrong position would move all three
 * without failing anything.
 */
export const archiveYears: [ArchiveYear, ...ArchiveYear[]] = [
  archive2026,
  ...archivePlaylistYears,
].sort((a, b) => b.year - a.year) as [ArchiveYear, ...ArchiveYear[]];

/**
 * The most recent archived year. NOT a constant, and never "2026".
 *
 * It is the year the selector opens on and the year the page calls the
 * most recent. It is deliberately not called "current": once 2027's
 * programme is live, the most recent ARCHIVED meeting is still the one
 * that has finished, and a reader needs to be able to tell those apart.
 *
 * The array above is typed as non-empty so that this, and
 * `earliestArchiveYear` in the feature's lib, are `ArchiveYear` rather
 * than `ArchiveYear | undefined` under `noUncheckedIndexedAccess`. The
 * assertion is safe by construction and not by assumption: `archive2026`
 * is a literal in the array, so it cannot be empty without this file
 * being edited to remove it — at which point the assertion is the thing
 * that has to be revisited, which is where the decision belongs.
 */
export const latestArchiveYear: ArchiveYear = archiveYears[0];

/**
 * Sessions listed for a year, across every theme it has — recorded or not.
 *
 * This is the number of CARDS the page draws.
 */
export function archiveSessionCount(entry: ArchiveYear): number {
  return entry.themes.reduce((total, theme) => total + theme.videos.length, 0);
}

/**
 * Sessions with a recording behind them.
 *
 * ── NOT THE SAME NUMBER, AND THE DIFFERENCE IS THE POINT ─────────────
 *
 * 2026 lists 55 sessions and holds 54 recordings: one Family Life session
 * has no published video. Both figures are true and they mean different
 * things, so the page says both rather than picking whichever is larger.
 * Calling 55 of them "recordings" would be a claim that 55 videos exist,
 * on the page whose whole job is being right about which ones do.
 */
export function archiveVideoCount(entry: ArchiveYear): number {
  return entry.themes.reduce(
    (total, theme) =>
      total + theme.videos.filter((video) => video.videoId).length,
    0,
  );
}

/**
 * ── TWO WAYS TO FAIL THE BUILD ───────────────────────────────────────
 *
 * A duplicated year, which would render two panels behind one tab and
 * make "most recent" depend on the sort's stability. And a
 * `showcaseThemeId` naming a theme that does not exist in its own year,
 * which would leave the home page's showcase silently empty — the exact
 * failure mode nobody notices, because an absent section looks like a
 * section that was never there.
 *
 * /archive and / are both statically generated, so throwing at module
 * scope surfaces during `next build` as a prerender failure and the
 * deploy stops. Same trade, for the same reason, as the dayId check in
 * src/features/gallery/lib/collections.ts.
 */
const seen = new Set<number>();
for (const entry of archiveYears) {
  if (seen.has(entry.year)) {
    throw new Error(
      `src/data/archive: ${entry.year} is listed twice. Each year is one entry; ` +
        `a year held as both a playlist and a set of themes carries both fields ` +
        `on the one entry.`,
    );
  }
  seen.add(entry.year);

  if (
    entry.showcaseThemeId &&
    !entry.themes.some((theme) => theme.id === entry.showcaseThemeId)
  ) {
    throw new Error(
      `src/data/archive: ${entry.year} names "${entry.showcaseThemeId}" as its ` +
        `showcase theme, but has no theme with that id. Valid ids: ` +
        `${entry.themes.map((theme) => theme.id).join(", ") || "(none)"}.`,
    );
  }
}
