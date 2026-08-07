import type { EventInfo, Speaker } from "./types";

export const eventInfo: EventInfo = {
  name: "Camp Meeting",
  year: 2026,
  edition: "Camp Meeting 2026",
  startDate: "2026-08-15",
  endDate: "2026-08-22",
  timezone: "Africa/Nairobi",
  // From the official 2026 poster, which is also where the hero
  // photograph comes from. This closes the open item that stood since
  // Phase 1: the main site's pastor's letter showed "The Good News in the
  // Great Controversy", but that letter carries February dates and a
  // different pastor, so it was stale and was deliberately kept out of
  // the hero until the poster settled it.
  //
  // The verse is stored as a REFERENCE, not as verse text. Which
  // translation the church reads from is not recorded anywhere this
  // project can verify, and printing the wrong wording of Isaiah 1:19-20
  // under the theme would be worse than printing none.
  theme: "Obey and Live",
  keyVerse: "Isaiah 1:19-20",
  themeSong: "SDAH 590",
  church: {
    name: "Seventh-day Adventist Church Newlife",
    // The one word of the full name that identifies this church rather
    // than the denomination. A substring of `name`, which the header
    // lockup depends on: see the note on the type.
    shortName: "Newlife",
    address: "5th Ngong Avenue, Nairobi",
    website: "https://www.newlifesdanairobi.org",
  },
  // Phone and email are confirmed against the church's own 2025 bulletin.
  contact: {
    phone: "0795638070",
    email: "info@newlifesdanairobi.org",
    // ── COMMITTEE OWES THIS ──────────────────────────────────────────
    // This was requests@newlifesdanairobi.org, which could not be
    // verified against any church source and is probably wrong, so
    // prayer requests fall back to the confirmed info@ address. Restore
    // a dedicated prayer address only once the church confirms it
    // exists and is monitored.
    prayerEmail: "info@newlifesdanairobi.org",
  },
  // Verified from newlifesdanairobi.org, July 2026.
  social: {
    facebook: "https://www.facebook.com/newlifesdanairobi.org",
    // Handle form. The /c/NewlifeSDAChurchNairobi form is legacy.
    youtube: "https://www.youtube.com/@NewlifeSDAChurchNairobi",
    instagram: "https://www.instagram.com/newlifesdachurchnairobi/",
    twitter: "https://twitter.com/NewlifechurchKE",
    linkedin: "https://www.linkedin.com/in/newlife-sda-church-nairobi-1415b3137/",
  },
  giving: {
    paybill: { number: "861200", account: "Tithe or Offerings" },
    bank: {
      name: "Standard Chartered Bank",
      branch: "Kenyatta Ave",
      account: "0102022990600",
    },
  },
};

/**
 * ── ABOUT THE PHOTOGRAPHS ────────────────────────────────────────────
 *
 * `image` points at public/speakers/<id>.webp, cropped out of the
 * committee's own poster cards by tools/assets/speaker-photos.mjs. Read
 * the note at the top of that file before changing a crop: the supplied
 * artwork carries each person's name burnt into the lower fifth of the
 * frame, and the crop is what removes it.
 *
 * `imagePosition` is per photo and is not decoration. See types.ts.
 *
 * ── ABOUT THE THREE SPEAKERS WITH NO SESSIONS ────────────────────────
 *
 * janet-oyende-kariuki, john-clement and barrack-bosire appear in no
 * session in program.ts. Draft Program v3 credits a presenter on nearly
 * every slot and still names none of them, so this is now a programme
 * that has been revised twice without placing them rather than one that
 * simply predates their appointment. isaac-oenga was the fourth and v3
 * gives him the morning devotion on all six days that have one.
 *
 * The sessions are owed by the committee. Nothing here invents one, and
 * no ministry tag was attached to make the pages look fuller than the
 * data is. See DATA-NOTES.md.
 *
 * Their pages render, and read as "sessions to be confirmed" rather than
 * as an error. `programSpeakers` (features/schedule/lib/presenters.ts)
 * already keeps a profile with no sessions out of the programme filter,
 * so no facet offers a search that returns nothing.
 */
export const speakers: Speaker[] = [
  {
    id: "kennedy-mfune",
    name: "Kennedy Mfune",
    title: "Pr.",
    role: "Main Speaker",
    image: "/speakers/kennedy-mfune.webp",
    imagePosition: "50% 0%",
  },
  {
    id: "ken-ochuka",
    name: "Ken Ochuka",
    title: "Eld.",
    // No photograph supplied. Falls back to the initials monogram, which
    // is why that fallback stays. Still owed by the committee.
  },
  {
    id: "allan-okoth",
    name: "Allan Okoth",
    role: "Children's Corner",
    image: "/speakers/allan-okoth.webp",
    imagePosition: "50% 19%",
  },
  {
    id: "preskilla-munda",
    name: "Preskilla Munda",
    title: "Dr.",
    role: "Health Presenter",
    // ── SPELLING SETTLED, AND THE ID MIGRATED WITH IT ────────────────
    //
    // This record said "Priskillah Munda" under the id `priskillah-munda`
    // through Phase 4, on the tie-break that the programme PDF was the
    // signed source. Draft Program v3 removes the tie: it prints
    // "Dr. Preskilla Munda" on all four Health sessions, agreeing with
    // the poster card's own caption and with the supplied file name
    // `preskillamunda.jpg`. Three sources to none.
    //
    // So the artwork was right and v2 had the typo, which is the case
    // the old note said would require migrating the id rather than
    // editing the name. The id, the portrait file and the crop script's
    // entry all moved together.
    //
    // The programme prints the short form; her own biography gives the
    // full "Preskilla Ochieng-Munda", which is where the bio uses it.
    image: "/speakers/preskilla-munda.webp",
    imagePosition: "50% 69%",
  },
  /*
   * Appointed after Draft_Program_v2 was drawn. Roles are as printed on
   * each poster card; honorifics likewise, which is where "Pr." and
   * "Eld." below come from.
   */
  {
    id: "janet-oyende-kariuki",
    name: "Janet Oyende-Kariuki",
    role: "Ambassadors",
    // ── SPELLING SETTLED BY HER OWN BIOGRAPHY ────────────────────────
    //
    // Two questions were open here, not one: whether the surname is
    // Oyiende or Oyende, and whether Kariuki is printed at all. She is
    // credited in no session, so the programme could not answer either.
    //
    // Her supplied biography answers both in its first line, which reads
    // "FULL NAME: Janet Oyende-Kariuki" — hyphenated, and with the third
    // name. That is her own account of her name, which outranks both the
    // appointment note this record used to follow and the poster card's
    // unhyphenated caption. The id and the portrait file moved with it.
    image: "/speakers/janet-oyende-kariuki.webp",
    imagePosition: "50% 4%",
  },
  {
    id: "john-clement",
    name: "John Clement",
    title: "Pr.",
    role: "Ambassadors",
    image: "/speakers/john-clement.webp",
    imagePosition: "50% 24%",
  },
  {
    id: "isaac-oenga",
    name: "Isaac Oenga",
    title: "Eld.",
    role: "Morning Devotion",
    image: "/speakers/isaac-oenga.webp",
    imagePosition: "50% 60%",
  },
  {
    id: "barrack-bosire",
    name: "Barrack Bosire",
    title: "Eld.",
    role: "Teens",
    image: "/speakers/barrack-bosire.webp",
    imagePosition: "50% 0%",
  },
  /*
   * Named for the first time in Draft Program v3, which credits a
   * presenter on nearly every slot where v2 left the column blank. Both
   * carry a weekday morning series, so unlike the four above they are in
   * the programme from the day they are added and appear in the
   * presenter filter straight away.
   *
   * No photograph supplied for either; both fall back to the initials
   * monogram. Owed by the committee alongside Eld. Ken Ochuka's.
   */
  {
    id: "elkanah-mose",
    name: "Elkanah Mose",
    title: "Pr.",
    role: "Stewardship",
    // v3 prints "Elkana" on Monday and Thursday and "Elkanah" on the
    // other four days he appears. "Elkanah" is used here because it is
    // both the majority spelling in the programme and the spelling in
    // his own supplied biography. DATA-NOTES.
  },
  {
    id: "kenneth-ayuo",
    name: "Kenneth Ayuo",
    title: "Pr.",
    // Four different slots across four mornings rather than one series
    // with one name, so the role names the thread rather than a tag.
    role: "Spirit of Prophecy, Prophecy, Possibility Ministry, Discipleship",
  },
];

export const speakerById = Object.fromEntries(
  speakers.map((s) => [s.id, s]),
) as Record<string, Speaker>;
