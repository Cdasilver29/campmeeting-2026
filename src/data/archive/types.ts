/**
 * The recordings archive.
 *
 * ── THIS IS DELIBERATELY NOT PART OF THE PROGRAMME DATA ──────────────
 *
 * Nothing under src/data/archive/ imports from program.ts, event.ts or
 * anything else that describes a CURRENT camp meeting, and nothing here
 * may start to. That is the whole design.
 *
 * program.ts is replaced wholesale each year: in 2027 it holds 2027's
 * eight days, its ids, its speakers. The archive is the opposite kind of
 * data — a finished year does not change again — and if a 2026 recording
 * were keyed to a `dayId` in program.ts, or to a speaker id in event.ts,
 * then next year's swap would either break the archive or silently refile
 * 2026's videos under 2027's days.
 *
 * So an archive entry carries an ISO DATE rather than a day id, and
 * SPEAKER NAMES as plain strings rather than speaker ids. Both are
 * self-contained: they mean the same thing in ten years' time with no
 * other file present. The cost is that a name here is not a link to a
 * speaker page, and that is the correct trade — a speaker page describes
 * somebody's part in THIS year's programme, and a 2021 preacher may have
 * no page at all.
 *
 * The livestream feature makes the opposite trade for the opposite
 * reason; see src/features/livestream/config.ts.
 */

/**
 * Which part of the day, as the programme document states it.
 *
 * Three values, not the livestream's two. That file models a BROADCAST,
 * and the week was streamed in two halves; this models a SESSION, and the
 * programme runs morning, afternoon and evening sessions as three
 * distinct things.
 *
 * OPTIONAL, because one row of the 2026 document does not give one — the
 * Book Promotion on the 20th. It is left absent rather than guessed at
 * from the rows around it, and the card simply shows the date. See the
 * note in year-2026.ts.
 */
export type ArchivePart = "Morning" | "Afternoon" | "Evening";

export interface ArchiveVideo {
  /** "YYYY-MM-DD". The date the session was held, not the upload date. */
  date: string;
  part?: ArchivePart;
  /**
   * As printed in the programme document. Free text on purpose — see the
   * note at the top of this file on why these are not speaker ids.
   *
   * An array because a session can be led by two people, and the document
   * writes them on two lines of one cell.
   */
  speakers: string[];
  /**
   * The slot as the programme names it: "Bible Study", "Children's
   * Sermon", "Family Life Session (0-10yrs)". For the sermons, which the
   * document gives no slot name, this is the sermon's own title.
   */
  title: string;
  /**
   * The session's own title where the document gives one under the slot
   * name — "Children's Sermon - God Always Shows Up". Same split, and for
   * the same reason, as `subtitle` on Session in src/data/types.ts: the
   * subtitle is the part a reader is actually choosing between.
   */
  subtitle?: string;
  /**
   * The 11-character YouTube id. Not a URL, and never the `?si=...` a
   * YouTube share button appends — that is a share-tracking token
   * belonging to whoever copied the link.
   *
   * ── ABSENT MEANS NO RECORDING WAS PUBLISHED ──────────────────────────
   *
   * One 2026 session has no link in the source document. It is listed
   * anyway, with no video, and rendered as unavailable. Dropping it would
   * misrepresent the week as one session shorter than it was, and
   * inventing an id would be worse than both — a wrong id took a live
   * broadcast off this site during the week the archive is of.
   */
  videoId?: string;
}

export interface ArchiveTheme {
  /** URL-safe slug. Used for the section anchor and the filter chips. */
  id: string;
  label: string;
  /** One line under the heading. */
  blurb?: string;
  /** Chronological within the theme. */
  videos: ArchiveVideo[];
}

/**
 * One camp meeting year.
 *
 * ── WHY BOTH FIELDS EXIST ON EVERY YEAR ──────────────────────────────
 *
 * 2026 arrived as a per-session document, so it has `themes` and no
 * playlist. 2020 to 2025 arrived as one YouTube playlist each, so they
 * have `playlistId` and no themes.
 *
 * Neither field is what distinguishes a year. They are both optional on
 * every year, so a themed breakdown of 2024's stewardship talks — which
 * is expected eventually — is added by pushing entries into that year's
 * `themes`, with no change to this file and no change to any component.
 * A year can carry both, and a year carrying both renders both: the
 * themed sections, and the playlist for everything else.
 */
export interface ArchiveYear {
  year: number;
  /** A YouTube playlist id, for a year held as a playlist. */
  playlistId?: string;
  /** Thematic collections. Empty where only a playlist is held. */
  themes: ArchiveTheme[];
  /**
   * Marks the theme whose videos the home page showcases, by `id`.
   *
   * On the DATA rather than in the component, so that next year's
   * showcase follows next year's archive without a code change: 2027's
   * file names its own theme and the home page picks up the most recent
   * year that names one. See src/features/archive/lib/showcase.ts.
   */
  showcaseThemeId?: string;
}
