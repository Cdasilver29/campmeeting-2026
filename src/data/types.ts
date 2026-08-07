/**
 * Camp Meeting program data model.
 * Future years: replace the data files, never these types.
 * All times are 24h "HH:MM" strings in Africa/Nairobi (EAT, UTC+3).
 */

export type MinistryTag =
  | "worship"
  | "music"
  | "bible-study"
  | "spirit-of-prophecy"
  | "prophecy"
  | "possibility-ministry"
  | "evangelism"
  | "discipleship"
  | "publishing"
  | "stewardship"
  | "health"
  | "family-life"
  | "children"
  | "christian-education"
  | "prayer"
  | "medical"
  | "fellowship";

export type BlockId =
  | "morning-service"
  | "mid-morning-service"
  | "divine-service"
  | "afternoon-program"
  | "evening-service";

export interface Session {
  /** Stable, unique across the whole event. Format: {dayId}-{slug} */
  id: string;
  title: string;
  /**
   * The session's own title, where the programme gives one under the
   * slot's name. Draft Program v3 introduced this: the four Health
   * sessions are each "Health" in the timetable and carry a distinct
   * title beneath it ("What Broke? Broken Identity"), which is the part
   * a reader is actually choosing between.
   *
   * Not a second line of `title`: `title` is the slot as the programme
   * names it, and the schedule groups, searches and links by that.
   */
  subtitle?: string;
  /** "HH:MM" 24h. Omitted for untimed blocks (e.g. Medical Camp, Sabbath Preparation). */
  start?: string;
  end?: string;
  /** speaker ids from speakers.ts */
  presenterIds?: string[];
  /** free-text presenters/groups not worth a speaker profile (choirs etc.) */
  presentedBy?: string[];
  ministry?: MinistryTag;
  /** marked red/bold in the printed program — treat as a featured session */
  featured?: boolean;
  note?: string;
}

export interface ProgramBlock {
  id: BlockId;
  label: string;
  sessions: Session[];
  /** e.g. "Medical Camp" occupying a whole block with no timed sessions */
  allBlockActivity?: { title: string; ministry?: MinistryTag; note?: string };
}

export interface ProgramDay {
  /** e.g. "sabbath-15" */
  id: string;
  /** ISO date, e.g. "2026-08-15" */
  date: string;
  /** e.g. "Sabbath" | "Sunday" ... as printed */
  dayLabel: string;
  /** e.g. "Sabbath 15th August" */
  displayLabel: string;
  blocks: ProgramBlock[];
}

export interface Speaker {
  id: string;
  name: string;
  /** honorific as printed: Pr. | Eld. | Dr. */
  title?: string;
  role?: string;
  /** Cloudinary public id or /images path — fill in when photos are available */
  image?: string;
  /**
   * CSS `object-position` for `image`, e.g. "50% 19%".
   *
   * Every portrait is a 3:4 frame and the card avatar is a circle, so the
   * avatar shows 75% of the file's height and this is which 75%. Centring
   * is not the default answer: the supplied artwork frames each person
   * differently, and the same value across seven files cuts a face off
   * two of them. Derived per photo by tools/assets/speaker-photos.mjs,
   * which also renders the resulting circle so it can be checked.
   *
   * Omitted means "50% 50%", which is what a photograph shot for this
   * purpose would need.
   */
  imagePosition?: string;
  /**
   * The speaker's biography, one string per paragraph.
   *
   * An array rather than one string with blank lines in it, because the
   * supplied biographies are three to five paragraphs long and something
   * has to decide where they break. A single string pushes that decision
   * into the renderer, where it becomes a split on a whitespace
   * convention nobody wrote down; the shape of the text belongs with the
   * text.
   *
   * These are the speakers' own words, transcribed with typos corrected
   * and nothing else touched. Two are written in the first person and
   * stay that way. DATA-NOTES.md lists every character that changed.
   */
  bio?: string[];
}

/**
 * Someone who hosts the camp meeting rather than presents at it: the
 * pastoral team, the chair, the head elder.
 *
 * A separate type from `Speaker`, and a separate array, because the two
 * answer different questions. A speaker is someone you might come to
 * hear, is on the programme, has a page of their own and a session
 * count; a host is who is running the week. Some people are both — Eld.
 * Ken Ochuka chairs and also opens the first Sabbath — and `speakerId`
 * is how the same person is joined up rather than duplicated.
 *
 * The photo and biography slots are here and empty on purpose. None of
 * the five has sent either, and the point of declaring the fields now is
 * that arriving photographs and paragraphs are a data edit in event.ts
 * and nothing else: the card already draws both when they are present,
 * and falls back to the initials monogram and to no biography at all
 * when they are not.
 */
export interface Host {
  /** Stable key. Matches `speakerId` where the person has a profile. */
  id: string;
  name: string;
  /** Honorific as printed: Pr. | Eld. */
  title?: string;
  /** The office held, e.g. "Senior Pastor". Not a ministry tag. */
  role: string;
  /** Same contract as Speaker.image. Empty today for all five. */
  image?: string;
  imagePosition?: string;
  /** Same contract as Speaker.bio. Empty today for all five. */
  bio?: string[];
  /** Set when this person also has a speaker profile to link through to. */
  speakerId?: string;
}

export type AnnouncementPriority = "normal" | "urgent";

/**
 * Programme updates published during camp meeting. Phase 5 owns the
 * announcements page; the shape is fixed here so the schedule UI can
 * flag affected sessions without a later refactor.
 */
export interface Announcement {
  id: string;
  /** full ISO 8601 instant, e.g. "2026-08-17T09:12:00+03:00" */
  publishedAt: string;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  /**
   * Session ids this announcement amends (cancellation, speaker change,
   * time change). Ids are the stable `{dayId}-{slug}` form from program.ts.
   */
  affectedSessionIds?: string[];
}

export interface EventInfo {
  name: string;
  year: number;
  edition: string;
  startDate: string;
  endDate: string;
  timezone: string;
  /**
   * The three strings the official poster carries above everything else.
   * Required rather than optional: a future year that swaps the data files
   * and forgets the theme should fail to compile, not render a hero with a
   * hole where its subject was.
   */
  /** The camp meeting theme, as printed. */
  theme: string;
  /** The theme's key verse, as a reference. Not the verse text. */
  keyVerse: string;
  /** Theme song as a hymnal reference, e.g. "SDAH 590". */
  themeSong: string;
  church: {
    name: string;
    /**
     * The name at the width where the full one cannot be set. The header
     * lockup uses it below `sm`, where a mark, a wordmark and a 48px
     * control have to share 280px of content box.
     *
     * It must be a SUBSTRING of `name`. The lockup shows this and
     * announces `name`, and WCAG 2.5.3 requires the visible label to
     * appear in the accessible name.
     */
    shortName: string;
    address: string;
    website: string;
  };
  contact: { phone: string; email: string; prayerEmail?: string };
  social: {
    facebook?: string;
    youtube?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  giving: {
    paybill: { number: string; account: string };
    bank: { name: string; branch: string; account: string };
  };
}
