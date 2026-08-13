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

/**
 * One clinic at an all-block activity, and what it is offering.
 *
 * `serviceGroups` rather than a flat `services[]` because the terms are
 * the part an attendee is reading for. Every provider at the Medical Camp
 * offers a list free of charge, two of them offer a second list at a
 * stated fee, and one of them is only present on two days of the week —
 * so "which services" and "on what terms" are two facts, and flattening
 * them into one list would drop the second.
 */
export interface ServiceProvider {
  name: string;
  serviceGroups: {
    /** As printed: "Every day, free of charge", "At a discounted fee". */
    terms: string;
    services: string[];
  }[];
}

/**
 * Something that occupies a whole block and has no clock times of its
 * own: Sunday's Medical Camp, Friday's Sabbath Preparation.
 *
 * `providers` and `standingNotes` are both optional and both empty for
 * Sabbath Preparation, which is a title and nothing else. The Medical
 * Camp is the case they exist for: the near-final programme gives it four
 * named providers with about twenty services between them, and that is
 * attendee-facing content rather than a label.
 */
export interface AllBlockActivity {
  title: string;
  ministry?: MinistryTag;
  note?: string;
  providers?: ServiceProvider[];
  /** True across every provider, e.g. the ambulance kept on site. */
  standingNotes?: string[];
}

export interface ProgramBlock {
  id: BlockId;
  label: string;
  sessions: Session[];
  /** e.g. "Medical Camp" occupying a whole block with no timed sessions */
  allBlockActivity?: AllBlockActivity;
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

/**
 * ── THE CHILDREN'S MINISTRY PROGRAMME ────────────────────────────────
 *
 * Its own shape, not `ProgramDay`, and that is a decision rather than a
 * shortcut. `ProgramDay` is one dated day with blocks in it; the
 * children's sheet is ONE day repeated Monday to Friday, with no blocks
 * and no dates, plus two tables the main programme has no equivalent of.
 * Forcing it into `ProgramDay` would have meant five identical days with
 * invented ids, which would then appear in `allSessions`, in the search
 * index and in every day count on the site.
 *
 * The timetable's entries ARE `Session`, though, so the schedule's own
 * card renders them without a translation layer. See /children.
 */

/** One class: an age band, where it meets, and who teaches it when. */
export interface ChildrenClass {
  id: string;
  /** "13-14 Years Old", as the sheet prints it. */
  ages: string;
  venue: string;
  /**
   * The teaching slots this class runs, in the order the day runs them.
   *
   * Three for most classes and two for the oldest and the nursery, whose
   * sheet cells are merged across the morning. Not a fixed four with
   * duplicates: a merged cell means one set of teachers holds one longer
   * slot, and splitting it into two identical rows would print the same
   * names twice and say something the sheet does not.
   */
  slots: { session: string; time: string; teachers: string[] }[];
}

/** "Primary Class", and the classes inside it. */
export interface ChildrenClassBand {
  label: string;
  classes: ChildrenClass[];
}

export interface ChildrenProgram {
  /** The day, Monday to Friday. Rendered with the schedule's session card. */
  timetable: Session[];
  bands: ChildrenClassBand[];
  coordinators: { role: string; people: string }[];
}

/**
 * The four teams the duty rota rosters, in the order the panel reads
 * them. Elders first because there are one or two of them and they are
 * who you ask; choristers last because there are always four.
 */
export type DutyTeamId = "elders" | "deacons" | "deaconesses" | "choristers";

/**
 * One half of a day's rota.
 *
 * `shift` is "Morning" or "Afternoon" as the sources split it. Sunday has
 * only an afternoon, and that is the programme's own table rather than a
 * gap in this data.
 *
 * `allOnDuty` names the teams that are on IN FULL rather than by list,
 * which is what both Sabbaths say and what Friday afternoon says of the
 * diaconate. It is not the same fact as an empty array: an empty array
 * means nobody is rostered, and "everybody" and "nobody" must not render
 * the same way.
 */
export interface DutyShift {
  shift: "Morning" | "Afternoon";
  elders: string[];
  deacons: string[];
  deaconesses: string[];
  choristers: string[];
  allOnDuty?: DutyTeamId[];
  /** Why the shift looks the way it does, e.g. "Sabbath preparation." */
  note?: string;
}

/** A programme day's rota. `dayId` matches `ProgramDay.id`. */
export interface DayDuty {
  dayId: string;
  shifts: DutyShift[];
  note?: string;
}

/**
 * One photograph in the gallery.
 *
 * `width` and `height` are the file's real dimensions, and they are not
 * decoration: the grid reserves each cell's space from them, so nothing
 * moves as the images decode. src/data/gallery.ts is generated by
 * tools/assets/gallery-photos.mjs for exactly that reason — a hand-kept
 * list of 31 pairs of numbers is a list that is wrong by the third edit,
 * and a wrong number here is a layout shift.
 *
 * No `alt`. The committee supplied 31 photographs and no captions, and a
 * generated description of a photograph nobody here has described would
 * be a guess presented to a screen reader as fact. The gallery is marked
 * up as a decorative set instead — see /gallery.
 */
export interface GalleryImage {
  id: string;
  /** Site-relative, under /gallery/. */
  src: string;
  width: number;
  height: number;
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
