import type { ArchiveTheme, ArchiveYear } from "@/data/archive";
import { archiveYears } from "@/data/archive";

/**
 * What the home page's showcase draws from.
 *
 * ── DERIVED, NEVER "2026" ────────────────────────────────────────────
 *
 * The most recent archived year that both has per-video detail and names
 * a showcase theme. Today that is 2026 and the Sermons. When 2027's file
 * is added it becomes 2027's, with no change to this file and none to the
 * component — which is the requirement this function exists to meet.
 *
 * ── WHY A NAMED THEME AND NOT "THE FIRST ONE" ────────────────────────
 *
 * The showcase needs titles that read out of context. "The Bishop's
 * Bedroom" and "Unstable as Water" do; "Morning Devotion", six times over,
 * does not — and a rotation of six identical strings is worse than no
 * rotation at all. That is an editorial judgement about a particular set
 * of videos, so it is recorded in the data as `showcaseThemeId` rather
 * than inferred here from position, which would make the home page depend
 * on the order somebody happened to write the themes in.
 *
 * ── AND WHY NOT ALL 54 ───────────────────────────────────────────────
 *
 * Because a showcase of fifty-four items is a list. Fourteen sermons is
 * the complete preaching track of the week — a whole theme rather than a
 * subset somebody picked — and every card links through to /archive, so
 * the other forty are one tap away rather than absent.
 *
 * Returns undefined when no year qualifies, and the home page renders no
 * showcase at all in that case rather than an empty frame.
 */
export interface Showcase {
  year: ArchiveYear;
  theme: ArchiveTheme;
}

export function getShowcase(): Showcase | undefined {
  for (const year of archiveYears) {
    if (!year.showcaseThemeId) continue;
    const theme = year.themes.find((entry) => entry.id === year.showcaseThemeId);
    // A showcaseThemeId that names nothing already fails the build in
    // src/data/archive/index.ts, so this is a type narrowing rather than a
    // second guard. Kept because the narrowing has to happen somewhere.
    if (theme && theme.videos.length > 0) return { year, theme };
  }
  return undefined;
}

/**
 * The cards the rail actually renders: the theme's videos that HAVE a
 * recording.
 *
 * A card with no video would be a card that does not link anywhere, in a
 * strip whose whole purpose is to be clicked. The archive page still
 * lists it — that is where the completeness of the week belongs.
 */
export function showcaseVideos(showcase: Showcase) {
  return showcase.theme.videos.filter((video) => video.videoId);
}
