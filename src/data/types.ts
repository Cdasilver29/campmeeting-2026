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
  bio?: string;
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
