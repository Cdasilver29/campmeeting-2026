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
 * ── ABOUT THE FOUR SPEAKERS WITH NO SESSIONS ─────────────────────────
 *
 * janet-oyiende, john-clement, isaac-oenga and barrack-bosire appear in
 * no session in program.ts, because program.ts is transcribed from
 * Draft_Program_v2 and these four were appointed after it was drawn. That
 * is a gap in the programme, not in this file: the sessions are owed by
 * the committee. Nothing here invents one, and no ministry tag was
 * attached to make the pages look fuller than the data is. See
 * DATA-NOTES.md.
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
    id: "priskillah-munda",
    name: "Priskillah Munda",
    title: "Dr.",
    role: "Health Presenter",
    // The supplied file is named preskillamunda.jpg and its own caption
    // reads "Dr. Preskilla Munda". The programme PDF prints Priskillah,
    // so the PDF wins here and the disagreement is logged rather than
    // quietly resolved. See DATA-NOTES.md.
    image: "/speakers/priskillah-munda.webp",
    imagePosition: "50% 69%",
  },
  /*
   * Appointed after Draft_Program_v2 was drawn. Roles are as printed on
   * each poster card; honorifics likewise, which is where "Pr." and
   * "Eld." below come from.
   */
  {
    id: "janet-oyiende",
    name: "Janet Oyiende",
    role: "Ambassadors",
    // The poster caption reads "Janet Oyende Kariuki" — a different
    // spelling of the surname and a third name this record does not
    // carry. Logged in DATA-NOTES.md rather than guessed at.
    image: "/speakers/janet-oyiende.webp",
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
];

export const speakerById = Object.fromEntries(
  speakers.map((s) => [s.id, s]),
) as Record<string, Speaker>;
