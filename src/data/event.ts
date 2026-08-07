import type { EventInfo, Host, Speaker } from "./types";

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
    // ── THE ONE BIOGRAPHY THAT NEEDS THE COMMITTEE BACK ─────────────
    //
    // Supplied as a single unpunctuated run of about 110 words that
    // changes from third person to first halfway through ("...as the
    // Spiritual Director in 2010 moved to Kenya while in Kenya I
    // served..."). Only spellings and spacing were corrected, because
    // the brief was to fix typos and not to rewrite anyone's voice, and
    // punctuating this into sentences would be writing it.
    //
    // Still open, all listed in DATA-NOTES: the person switch, "jukat
    // karen Campus" (probably JKUAT Karen), "Naps", and "Nu vision".
    // The last line is his own and must not be tidied: he is blessed
    // with "Four Hebrew boys and one Shunammite girl".
    bio: [
      "Pastor Kennedy Mfune is from Zambia who has been in ministry for more than two decades worked with a missionary Organization from the USA Naps for 10 years as the Spiritual Director in 2010 moved to Kenya while in Kenya I served as chaplain for jukat karen Campus for two years then left Kenya in 2022 for Rwanda Kigali where I served as pastor for Nu vision under Kigali English church in 2024 I lost my beloved wife In Rwanda, am blessed with Four Hebrew boys and one Shunammite girl am Currently in Zambia with Naps Missionary Organization as a Religious and spiritual Director",
    ],
  },
  {
    id: "ken-ochuka",
    name: "Ken Ochuka",
    title: "Eld.",
    // No photograph supplied. Falls back to the initials monogram, which
    // is why that fallback stays. Still owed by the committee, along
    // with a biography: he is the Camp Meeting Chair and one of the two
    // people who open the opening Sabbath.
  },
  {
    id: "allan-okoth",
    name: "Allan Okoth",
    role: "Children's Corner",
    image: "/speakers/allan-okoth.webp",
    imagePosition: "50% 19%",
    // No biography supplied. He carries the Children's Corner on all
    // seven days that have one, so this is the emptiest page relative to
    // how much of the programme its subject is actually doing.
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
    // The full "Preskilla Ochieng-Munda" is her own opening words, so it
    // stands here even though the programme and the card use the short
    // form. Corrected: "adolscents". Left alone: the dash in
    // "stronger—emotionally grounded", which is her punctuation.
    bio: [
      "Dr. Preskilla Ochieng-Munda is a committed Christian, Clinical Psychologist, scholar, author, and trainer whose work centers on restoring the mind, strengthening relationships, and rediscovering purpose. Her interdisciplinary academic background includes a B.Sc., an MBA, M.A. in Counselling Psychology, and a Ph.D. in Clinical Psychology.",
      "She serves as a Lecturer in Clinical Psychology at Africa International University, where she contributes to research, teaches, supervises Master's and PhD students. With over a decade of experience in the mental health field, her research includes the book Cognitive Behavioral Intervention for Trauma among Adolescents in Kenya.",
      "Beyond academia, she founded the Build Mind Muscle which led to her book Awareness Amplified – Beyond the Surface (2025), offering practical psychological tools for addressing burnout, blind spots, so individuals can lead purpose-driven lives. Working closely with adolescents, young adults and women in different community networks, Dr. Preskilla is a devoted member of Oasis Seventh-day Adventist Church, where she serves in the Health Ministry, and her prayer cell promoting mental wellness, temperance, stress management, stewardship, and Christ-centered holistic living.",
      "At the core of her work is a steady conviction - when psychological wisdom is anchored in faith and lived with integrity, individuals and families grow stronger—emotionally grounded, relationally mature, and spiritually rooted in Christ.",
    ],
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
    // Supplied on a form: FULL NAME, CHURCH OF SERVICE, then "Bio :".
    // Only what the form called the bio is here. Her church of service
    // is Nairobi Central SDA Church — recorded in this comment rather
    // than dropped, because `Speaker` has no field for it and inventing
    // a sentence to carry it would be writing her biography for her.
    // Nothing corrected. The two long dashes are hers.
    bio: [
      "Mission-minded servant at heart, she works in PR and Marketing at the Adventist University of Africa while serving with GYC Africa and ALIVE Kenya— youth-driven movements committed to Bible truth and active mission. Her real passion? Mentoring and discipling teenagers and young adults as they navigate life, faith, and purpose (thrivecoach365.github.io). She lives with her eyes set on the heavenly city, deeply aware that she remains clay in the Master Potter's hands—learning, growing, and being shaped every single day. She is thrilled to be with you this Camp Meeting as we pursue God together!",
    ],
  },
  {
    id: "john-clement",
    name: "John Clement",
    title: "Pr.",
    role: "Ambassadors",
    image: "/speakers/john-clement.webp",
    imagePosition: "50% 24%",
    // Written in the first person and signed "Pr J.M Clement". The
    // signature is dropped — the page is already headed with his name —
    // and the "Message:" label is kept on the line it introduces rather
    // than left as a one-word paragraph. Nothing corrected: "spoilt of
    // choices" and "develop strong, Christ-centered walk" are both
    // his phrasing rather than misspellings, and are flagged in
    // DATA-NOTES instead of smoothed out.
    bio: [
      "Married with 3 kids",
      "I have a special passion for mentoring and inspiring young people to develop strong, Christ-centered walk with God.",
      "Message: In a world where we're spoilt of choices, I choose to obey God \"will you\"",
    ],
  },
  {
    id: "isaac-oenga",
    name: "Isaac Oenga",
    title: "Eld.",
    role: "Morning Devotion",
    image: "/speakers/isaac-oenga.webp",
    imagePosition: "50% 60%",
    // Corrected: "Isaack" to "Isaac", matching the programme and this
    // record; "andmarried" to "and married"; a doubled space. Left
    // alone: "married to Agnes together God has blessed them", which is
    // a run-on rather than a misspelling, and "Bsc"/"Msc".
    bio: [
      "Isaac Oenga is an ordained Church Elder serving in Kirkau Church, Ongata Rongai East District, of South Nairobi Kajiado Field. Mr. Oenga is married to Agnes together God has blessed them with three daughters and three sons all grown up and married.",
      "Elder Oenga holds a Bsc in Civil Engineering, (UON, 1979) and Msc from California State University, Long Beach (1982). He worked both in the civil service and in the NGOs, travelling extensively locally in Kenya, East Africa, Africa and in several continents before retiring in 2010.",
    ],
  },
  {
    id: "barrack-bosire",
    name: "Barrack Bosire",
    title: "Eld.",
    role: "Teens",
    image: "/speakers/barrack-bosire.webp",
    imagePosition: "50% 0%",
    // The only biography supplied that needed nothing at all: five
    // paragraphs, no typos, trailing spaces trimmed and that is the
    // whole of it.
    bio: [
      "Elder Barrack Bosire is a seasoned Christian leader, mentor, and trainer with a deep passion for developing Christ-centered leaders who faithfully serve God and humanity.",
      "With many years in ministry, he has invested in leadership development across church, community, humanitarian, and institutional settings. He equips individuals to lead with integrity, humility, competence, and a commitment to biblical truth.",
      "Within the Seventh-day Adventist Church, Elder Bosire has served actively in Pathfinder, Master Guide, and Youth Ministries. He believes leadership is best developed through intentional discipleship and personal example. His ministry is guided by the conviction that the church's greatest legacy is not just successful programs, but transformed lives that continue Christ's mission from one generation to the next.",
      "Professionally, Elder Bosire has held senior roles in leadership, programme management, monitoring and evaluation, organisational development, and capacity strengthening. He has worked alongside churches, communities, governments, and development partners across diverse contexts.",
      "His expertise in leadership development, strategic planning, facilitation, and institutional strengthening has shaped his understanding of mentoring as both a biblical calling and a practical discipline.",
    ],
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
    //
    // Supplied under two headings, "Biographical Sketch" and "Camp
    // Meeting Theme & Focus". The headings are dropped and their two
    // paragraphs kept, which is the only change. His middle name,
    // Mang'era, appears nowhere in the programme and is his own.
    bio: [
      "Pastor Elkanah Mang'era Mose is an ordained Minister of the Gospel currently serving as the Ministerial and Family Life Secretary, Stewardship, and Adventist Possibility Ministries Director in the South Nairobi Kajiado Field. He holds a Master's Degree from the Adventist University of Africa. Pastor Mose is happily married to his wife, Esther, and they are blessed with children and grandchildren.",
      "This week, Pastor Mose joins the Newlife Family with a prayer for an unprecedented revival experience. His ministry focuses deeply on family stewardship, challenging every believer to fully embrace a \"God First\" lifestyle with no other option.",
    ],
  },
  {
    id: "kenneth-ayuo",
    name: "Kenneth Ayuo",
    title: "Pr.",
    // Four different slots across four mornings rather than one series
    // with one name, so the role names the thread rather than a tag.
    role: "Spirit of Prophecy, Prophecy, Possibility Ministry, Discipleship",
    // Corrected: one missing space, "trust God.Come". Kept exactly as
    // written: "OBEY AND LIVE, Disobey and Perish. The Choice is
    // Yours.", which is his own framing of the theme and not this
    // site's to normalise against eventInfo.theme.
    //
    // NOT INCLUDED, and the committee should say where it goes: the
    // supplied text carries a trailing fragment, "To help us make
    // Achoice.", outside the quotation marks that delimit the
    // biography. It reads as a note rather than as his last sentence,
    // and guessing it onto the end of a paragraph would be placing
    // words he did not put there. DATA-NOTES.
    bio: [
      "Pr. Kenneth Ayuo is a member of JKIA Central Seventh-day Adventist Church, an employee of SNKF, an associate pastor at Rongai West District, a husband, and a father.",
      "This Camp Meeting will present a cosmic view of the Gospel as the revelation of God's character and government within the framework of the 2026 Camp Meeting theme: OBEY AND LIVE, Disobey and Perish. The Choice is Yours.",
      "He will explore biblical obedience, not as mere outward performance, but as a humble willingness to listen to and trust God. Come expecting a warm communion with our infinitely powerful yet deeply personal, friendly, and gracious God. He never disappoints those who put their trust in Him.",
    ],
  },
];

export const speakerById = Object.fromEntries(
  speakers.map((s) => [s.id, s]),
) as Record<string, Speaker>;

/**
 * ── THE HOSTS ────────────────────────────────────────────────────────
 *
 * Who is running the week, as distinct from who is presenting at it.
 * Order is by office rather than alphabetical: the two pastors who open
 * and close the camp meeting, then the associates, then the chair and
 * the head elder.
 *
 * ── EVERY PHOTO AND EVERY BIOGRAPHY IS OWED ──────────────────────────
 *
 * All five render as an initials monogram with no biography under them.
 * That is the shipped state, not a stub: `image`, `imagePosition` and
 * `bio` are declared on `Host` and drawn by HostCard whenever they are
 * present, so adding a photograph and a paragraph is an edit to this
 * array and to nothing else. Do not reach for a stand-in portrait.
 *
 * Names come from the programme PDF wherever it prints them, which is
 * why the senior pastor is "Gerald Mochoge" here. The list supplied with
 * these five spells it "Mochige"; v3 prints "Mochoge" twice, on the
 * closing Sabbath's welcome and again on its farewell, and the printed
 * programme wins over a typed list. Worth one line of confirmation, and
 * it is in DATA-NOTES.
 *
 * Two of the five are in the programme as well as on this list, and are
 * carried there as free text: Pr. Elvis Onyango has Thursday's
 * Evangelism, and Pr. Polycarp Nyangau the closing Sabbath's pastoral
 * prayer. Neither has a speaker profile, so neither card links anywhere.
 * Eld. Ken Ochuka does have one, and `speakerId` joins them up so his
 * host card and his presenter card go to the same page rather than
 * reading as two different people.
 */
export const hosts: Host[] = [
  {
    id: "gerald-mochoge",
    name: "Gerald Mochoge",
    title: "Pr.",
    role: "Senior Pastor",
  },
  {
    id: "elvis-onyango",
    name: "Elvis Onyango",
    title: "Pr.",
    role: "Associate Pastor",
  },
  {
    id: "polycarp-nyangau",
    name: "Polycarp Nyangau",
    title: "Pr.",
    role: "Associate Pastor",
  },
  {
    id: "ken-ochuka",
    name: "Ken Ochuka",
    title: "Eld.",
    role: "Camp Meeting Chair",
    // The one host who is also a profiled speaker. His photograph and
    // biography are owed once, not twice: fill them in on the speaker
    // record above and this card should be pointed at them rather than
    // given its own copy.
    speakerId: "ken-ochuka",
  },
  {
    id: "george-oyoo",
    name: "George Oyoo",
    title: "Eld.",
    role: "Head Elder",
  },
];
