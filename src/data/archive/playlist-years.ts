import type { ArchiveYear } from "./types";

/**
 * The camp meetings from 2020 to 2025, as the church holds them: one
 * YouTube playlist per year, sermons only.
 *
 * ── WHY THESE ARE NOT BROKEN DOWN, AND WHAT HAPPENS WHEN THEY ARE ────
 *
 * There is no per-session document for these years. What exists is a
 * playlist id, and a playlist id is an honest thing to publish: the page
 * embeds the playlist and YouTube supplies the titles, the order and the
 * count. Writing out session rows for them would mean inventing dates and
 * speakers for videos nobody here has catalogued.
 *
 * A themed breakdown for these years is expected — stewardship and health
 * first. When one arrives it is added by filling in that year's `themes`
 * array, and nothing else changes: the type already carries both fields
 * on every year, the page already renders sections when a year has them,
 * and a year that has both a playlist and themes shows both. See the note
 * on ArchiveYear in ./types.ts.
 *
 * Newest first, which is the order the archive reads them in.
 */
export const archivePlaylistYears: ArchiveYear[] = [
  { year: 2025, playlistId: "PLWLFuzxo1B2ceHzSXvtNMHXc39kwxwQAx", themes: [] },
  { year: 2024, playlistId: "PLWLFuzxo1B2fwLzNdnyEPh7V-5PszRV52", themes: [] },
  { year: 2023, playlistId: "PLWLFuzxo1B2cGC5zOKTLdHMk5Jo1xJuLl", themes: [] },
  { year: 2022, playlistId: "PLWLFuzxo1B2c2Ci9GitJuOQSSlzxqwfly", themes: [] },
  { year: 2021, playlistId: "PLWLFuzxo1B2fwcGjy2OTkm3HmWyPXF_0W", themes: [] },
  { year: 2020, playlistId: "PLWLFuzxo1B2exromgHAatFfiwJ9b1lK68", themes: [] },
];
