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
    // The wordmark's three printed lines, the same three at every width.
    // Joined with spaces they read "Seventh-day Adventist Church Newlife
    // Nairobi" — `name` in order, then the city — which is the contract
    // the type describes and the reason the lockup can announce exactly
    // what it paints.
    //
    // The break points are typographic: the denomination on two lines
    // because "Seventh-day Adventist Church" does not fit a phone at a
    // readable size, and the congregation with its city on the third
    // because those two are what identify this church rather than the
    // denomination. "Seventh-day" keeps its lowercase d, which is the
    // denomination's own style and is how `name` is set everywhere else
    // on the site, including the page titles.
    wordmarkLines: ["Seventh-day", "Adventist Church", "Newlife Nairobi"],
    address: "5th Ngong Avenue, Nairobi",
    website: "https://www.newlifesdanairobi.org",
  },
  // Phone and email are confirmed against the church's own 2025 bulletin.
  //
  // ── `prayerEmail` IS GONE, AND SO IS THE FIELD ──────────────────────
  //
  // It held requests@newlifesdanairobi.org until that address could not
  // be verified against any church source, at which point it was set to
  // this same info@ value — so for its whole life after that it was a
  // second name for the address on the line above. /prayer-requests was
  // then removed and nothing rendered it at all.
  //
  // The ROUTE it existed for is not gone. "Prayer request" is a topic on
  // the contact form, which sets the subject line so the church can sort
  // on it, and shows the confidentiality note when it is chosen. See
  // src/features/forms/contact-form.tsx.
  //
  // If the church ever confirms a dedicated, monitored prayer address,
  // it comes back as a field on this object and the form's prepare()
  // is where it would be used.
  contact: {
    phone: "0795638070",
    email: "info@newlifesdanairobi.org",
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
 * ── SUNDOWN, ONE FIXED TIME PER DAY OF THE CAMP ──────────────────────
 *
 * Eight numbers, written down. Not computed at runtime, not fetched, and
 * no library: a solar calculator in the bundle would be a few kilobytes
 * of trigonometry shipped to every phone on the campground to re-derive
 * eight constants that were known months in advance, and it would have to
 * be right about the horizon, refraction and the timezone to beat a
 * lookup. It would also stop working offline the moment it became an API.
 *
 * ── WHERE THESE CAME FROM ────────────────────────────────────────────
 *
 * Open-Meteo's daily `sunset`, queried for -1.2921, 36.8219 (Nairobi, and
 * about 1.5km from 5th Ngong Avenue — a distance worth under four seconds
 * of sunset, which does not survive rounding to the minute), with
 * timezone=Africa/Nairobi so the values below are already EAT and no
 * conversion was done by hand.
 *
 * Cross-checked TWICE, because a wrong sundown is worse than none:
 *
 *   - Against an independent implementation of the NOAA solar equations
 *     at the same coordinates. Solar noon agreed to the second on every
 *     day; sunset agreed to within one minute on all eight, which is the
 *     rounding difference between two refraction constants and not a
 *     disagreement about the sun.
 *   - Against api.sunrise-sunset.org, which came back about a minute
 *     LATER on every day (18:40 for the 15th where both NOAA-derived
 *     sources say 18:39). That service runs the 1990 Almanac for
 *     Computers approximation, which is known to sit about a minute off,
 *     and it is the outlier of the three. It is recorded here rather than
 *     quietly dropped so nobody re-derives it later and thinks the data
 *     is wrong.
 *
 * timeanddate.com, the source anybody would reach for first, returns 403
 * to a fetch and could not be read.
 *
 * ── ROUNDING ─────────────────────────────────────────────────────────
 *
 * These are printed as the sources give them, to the minute, with no
 * padding either way. Sabbath beginning "at sundown" is a moment the
 * congregation marks together at the venue, and a site that shaved two
 * minutes off it to be safe would be printing something the sky
 * contradicts.
 *
 * ── COMMITTEE ────────────────────────────────────────────────────────
 *
 * If the church publishes its own sundown table — many congregations do,
 * from the conference calendar — theirs wins over these and this is one
 * edit. Ask before the programme is printed.
 */
export const sundownByDate: Record<string, string> = {
  "2026-08-15": "18:39", // Sabbath 15th, the opening Sabbath ends
  "2026-08-16": "18:39", // Sunday 16th
  "2026-08-17": "18:38", // Monday 17th
  "2026-08-18": "18:38", // Tuesday 18th
  "2026-08-19": "18:38", // Wednesday 19th
  "2026-08-20": "18:38", // Thursday 20th
  "2026-08-21": "18:38", // Friday 21st — SABBATH BEGINS
  "2026-08-22": "18:37", // Sabbath 22nd — Sabbath ends, and the camp with it
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
 * janet-oyende-kariuki, john-clement, barrack-bosire and
 * matthew-marion-barake appear in no session in program.ts. For the
 * first three, Draft Program v3 credits a presenter on nearly every slot
 * and still names none of them, so this is a programme that has been
 * revised twice without placing them rather than one that simply
 * predates their appointment. isaac-oenga was the fourth of that set and
 * v3 gives him the morning devotion on all six days that have one.
 *
 * The Barakes are a different case and a narrower one. The programme has
 * five Family Life slots they could hold, Sunday through Thursday, and
 * credits all five to "Various Divisions and Speakers"; what nobody has
 * said is WHICH. That is a question for the committee, not a gap to be
 * closed by picking one.
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
    // Supplied with the hosts drop, and it lives HERE rather than on his
    // host record because he is the one person who is on both lists. The
    // host card reads through `speakerId` to find it; see host-card.tsx.
    //
    // A biography is still owed. He is the Camp Meeting Chair and one of
    // the two people who open the opening Sabbath, so this is now a page
    // with a portrait and nothing written about its subject.
    image: "/speakers/ken-ochuka.webp",
    imagePosition: "50% 0%",
  },
  {
    id: "allan-okoth",
    name: "Allan Okoth",
    role: "Children's Corner",
    image: "/speakers/allan-okoth.webp",
    imagePosition: "50% 19%",
    // Supplied under the heading "Biodata - Allan Okoth", which is
    // dropped: the page is already headed with his name, the same way
    // Pr. Clement's signature is dropped below.
    //
    // Corrected: a non-breaking hyphen (U+2011) in "church-based" and a
    // curly apostrophe in "year's", both normalised to the plain
    // characters every other biography here uses. Nothing else.
    //
    // Left alone: "his spiritual journey and his passion for mentorship
    // has grown", where a compound subject takes a singular verb, and
    // "programs" in a file that spells it "programme" elsewhere. Neither
    // is a misspelling and correcting either would be editing his voice.
    // DATA-NOTES.
    bio: [
      "Allan Okoth is a committed member of Ngong Hills Central SDA Church, where his spiritual journey and his passion for mentorship has grown. For over a decade, he has actively been engaged in teaching and guiding children and teens through church-based outreach programs in primary and secondary schools. He has a keen interest in making profound biblical truths simple, relatable, and accessible to young minds, inspiring them to embrace faith and live with purpose.",
      "At this year's camp meeting, Allan brings the same energy, vision, and dedication to nurturing the next generation in Christ, with a heart to see young people strengthened, united, and empowered in their walk with God.",
    ],
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
   * BOTH NOW HAVE A PHOTOGRAPH. They were the last two profiles rendering
   * as initials monograms. The artwork is a clean cut-out on the poster's
   * plum ground with no caption burnt in, so it is cropped by
   * tools/assets/portrait-photos.mjs rather than by speaker-photos.mjs,
   * whose first job is removing a caption these do not have.
   */
  {
    id: "elkanah-mose",
    name: "Elkanah Mose",
    title: "Pr.",
    role: "Stewardship",
    // 79.6 KB where the other two in this batch are about 27, and it is
    // the SUBJECT rather than a setting: he is photographed in a fine
    // windowpane check, and a regular high-frequency pattern is the most
    // expensive thing a DCT codec can be handed. The same thing the old
    // Oyoo crop's gingham did — see host-photos.mjs.
    image: "/speakers/elkanah-mose.webp",
    imagePosition: "50% 0%",
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
    // ONE SUBJECT NOW, ON FIVE MORNINGS. He held the 09:00 slot on four
    // mornings with a different subject each time — Spirit of Prophecy,
    // Prophecy, Possibility Ministry, Discipleship — plus the closing
    // Sabbath's Scripture Reading, and `role` said "Morning Sessions"
    // because naming all four ran to 60 characters in a field whose other
    // values are "Main Speaker" and "Teens". The committee has since
    // moved him: the five weekday Bible Studies are his, and they are his
    // only credit in the week. So the field can name the subject again.
    role: "Bible Study",
    // The one crop in this batch that is a zoom rather than a shape. He
    // is shot at three-quarter length where the other two are chest-up,
    // so an equal head position still read smaller. See the note in
    // portrait-photos.mjs.
    image: "/speakers/kenneth-ayuo.webp",
    imagePosition: "50% 0%",
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
  /*
   * ── THE ONE RECORD THAT IS TWO PEOPLE ────────────────────────────────
   *
   * Supplied as ONE biography, under one heading, with ONE photograph of
   * the pair, and they present together. So this is one record with a
   * joint `name` and a `people` list, not two records that would each
   * have to borrow the other's half of the picture. The reasoning is on
   * the field in types.ts; the only consumer that needs the split is the
   * schema.org `Person` in lib/structured-data.ts.
   *
   * ── MATHEW OR MATTHEW: THE COMMITTEE HAS TO SETTLE THIS ──────────────
   *
   * The supplied file heads them "Mr & Mrs / Mathew Barake" with one t,
   * and the photograph is filed under the same spelling. The biography
   * UNDERNEATH that heading then spells him "Matthew" three times, in
   * every sentence he is named in.
   *
   * "Matthew" is used here on the rule this file already followed for
   * Janet Oyende-Kariuki: where a caption and a person's own biography
   * disagree about that person's name, the biography wins. It is also
   * three mentions to one. It is NOT settled the way hers is, because
   * hers was answered by a line reading "FULL NAME:" and this is an
   * inference from prose. If the committee says Mathew, the id and the
   * portrait file migrate with the name, the way preskilla-munda did.
   * DATA-NOTES.
   *
   * ── NO SESSION, DELIBERATELY ─────────────────────────────────────────
   *
   * The programme carries five "Family Life Sessions" blocks, Sunday
   * through Thursday, 15:00-16:20, and every one of them is credited to
   * "Various Divisions and Speakers" with no named presenter. Their
   * biography and photograph name no day, so which of the five is theirs
   * is a question this repository cannot answer, and attaching them to a
   * guess would put a named couple at a specific hour on a specific
   * afternoon on the strength of nothing. They are the fourth profile in
   * the "sessions to be confirmed" state; see the note above `speakers`.
   */
  {
    id: "matthew-marion-barake",
    name: "Matthew and Marion Barake",
    // No `title`. It holds an honorific — Pr., Eld., Dr. — and is printed
    // in front of `name` by speakerLabel. "Mr. & Mrs." in it would set
    // "Mr. & Mrs. Matthew and Marion Barake", and the sheet's own
    // "Mr & Mrs Mathew Barake" names only one of the two people in the
    // photograph. The joint name names both, which is the point of the
    // record.
    people: ["Matthew Barake", "Marion Barake"],
    // The ministry, then who they serve, which is what the sheet's third
    // line ("young Adults") says and the one fact about them that is not
    // in the biography. No new field for it: `role` already carries an
    // audience rather than a ministry on two records here — "Teens" and
    // "Ambassadors" — so this is the field's existing job, and adding an
    // `audience` for a single entry would be inventing a column.
    role: "Family Life, Young Adults",
    // 1023x1537, the only two-person source any of the crop scripts have
    // had. Full width is kept because narrowing the window cuts one of
    // them out of it; see tools/assets/portrait-photos.mjs for the crop
    // and for why the avatar's square starts at the top.
    image: "/speakers/matthew-marion-barake.webp",
    imagePosition: "50% 0%",
    // Corrected: one character. "Their favourite verse is;" is joined to
    // the verse it introduces and its semicolon made a colon — a
    // semicolon cannot introduce a quotation, and the source's own next
    // line uses a colon after the reference. Joining it is what was done
    // with Pr. Clement's "Message:" label, and for the same reason: a
    // paragraph reading "Their favourite verse is" and nothing else is
    // not a paragraph.
    //
    // Left alone, and both are flagged in DATA-NOTES rather than
    // smoothed out: "a whole life careers, finance, and marriage
    // blending practical wisdom", which is missing the punctuation on
    // both sides of the list and would have to be rewritten rather than
    // corrected; and the missing comma before "but their hearts beat
    // loudest for the youth".
    bio: [
      "Matthew and Marion Barake are a husband-and-wife team, born-again Christians, and servants of God with a shared passion for raising up the next generation. By profession, Matthew is a strategy professional and Marion is a tax and finance expert but their hearts beat loudest for the youth.",
      "Together, they founded Career254, a career consulting practice dedicated to equipping young people for the job market and helping them walk confidently into their God-given purpose. They love engaging youth on the topics that shape a whole life careers, finance, and marriage blending practical wisdom with biblical truth.",
      "Matthew and Marion are proud parents of two girls, and they bring the same intentionality they invest in their own home into every young life they mentor. It's their joy to walk alongside this generation, helping them build lives of faith, purpose, and excellence.",
      "Their favourite verse is: Jeremiah 29:11: \"For I know the plans I have for you,\" declares the LORD, \"plans to prosper you and not to harm you, plans to give you hope and a future.\"",
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
 * ── THE PHOTOGRAPHS ARRIVED. THE BIOGRAPHIES DID NOT ─────────────────
 *
 * All five now carry a portrait, cut to 3:4 from the supplied studio
 * cut-outs by tools/assets/host-photos.mjs, which is also where each
 * `imagePosition` below is derived and rendered rather than guessed.
 *
 * Not one of them has a biography, and HostCard draws NOTHING where one
 * would go — no placeholder, no line saying a biography is to follow. So
 * a host card is a portrait, a name and an office, and it is complete at
 * that rather than visibly missing its third part. Adding a paragraph
 * later is an edit to this array and to nothing else.
 *
 * Eld. Ken Ochuka's photograph is NOT on his record here. He is the one
 * person on both lists, his speaker record above owns the file, and the
 * card reads through `speakerId` to reach it — one photograph, referenced
 * once, rather than the same portrait pasted into two arrays that then
 * drift.
 *
 * ── TWO NAMES THE COMMITTEE HAS SINCE CORRECTED ─────────────────────
 *
 * The senior pastor is **Dr. Gerald Mochoge**. "Mochoge" over the hosts
 * list's "Mochige" was already the printed programme's spelling; the
 * committee has confirmed it and settled the honorific as Dr., against
 * the programme's own "Pr." on the closing Sabbath.
 *
 * The head elder is **Eld. Omondi Oyoo**. Every document that prints his
 * given name prints it wrong — the programme PDF and the elders' rota
 * both say George — and his own welcome letter is signed Omondi. Both
 * corrections are applied here, in program.ts and in the portrait
 * filenames. They are settled, not open.
 *
 * Two of the five are in the programme as well as on this list, and are
 * carried there as free text: Pr. Elvis Onyango has Thursday's
 * Evangelism, and Pr. Polycarp Nyangau the closing Sabbath's pastoral
 * prayer. Neither has a speaker profile, so neither card links anywhere.
 * Eld. Ken Ochuka does have one, and `speakerId` joins them up so his
 * host card and his presenter card go to the same page rather than
 * reading as two different people.
 */
/**
 * ── ALL FIVE HAVE WRITTEN, AND NONE OF THEM WROTE A BIOGRAPHY ────────
 *
 * `bio` is still empty on every record here and that is now a decision
 * rather than a gap. What the committee supplied was five LETTERS to the
 * congregation, in the first person, from 120 words to nearly a thousand.
 * They are in src/data/host-letters.ts under their own type, they have a
 * page each at /hosts/{id}, and the card on /speakers carries a sentence
 * from each in the writer's own words. Putting any of them in `bio` would
 * have printed "Dear brothers and sisters in Christ" under a portrait as
 * though it described the person in it.
 */
export const hosts: Host[] = [
  {
    id: "gerald-mochoge",
    name: "Gerald Mochoge",
    // "Dr.", not "Pr.". The committee has settled the form of his name,
    // and the programme's own "Pr. Gerald Mochoge" on the closing
    // Sabbath was corrected with it. His welcome letter signs off
    // "Dr. Mochoge Nyarega / Snr pastor", which is where the doctorate
    // and the office both come from.
    title: "Dr.",
    role: "Senior Pastor",
    image: "/speakers/gerald-mochoge.webp",
    imagePosition: "50% 0%",
    // No `bio`. A sentence naming the office was written here and taken
    // out again: `role` above already prints "Senior Pastor" on the card,
    // directly under his name, so the paragraph said the same thing
    // twice. Like the other four, this record waits for something in his
    // own words. See DATA-NOTES.
  },
  {
    id: "elvis-onyango",
    name: "Elvis Onyango",
    title: "Pr.",
    role: "Associate Pastor",
    // The same file the programme means on Thursday. He presents
    // Evangelism - One Voice 2027, but he is credited there in
    // `presentedBy` as free text rather than by id, and a presenter chip
    // is a Badge with a name in it and no portrait — so there is exactly
    // one place on the site this photograph can appear, and this is it.
    // If he is ever given a speaker profile, move the file reference onto
    // it and point this record at it by `speakerId`, the way Eld. Ochuka's
    // does. Do not add a second copy.
    image: "/speakers/elvis-onyango.webp",
    imagePosition: "50% 0%",
  },
  {
    id: "polycarp-nyangau",
    name: "Polycarp Nyangau",
    title: "Pr.",
    role: "Associate Pastor",
    image: "/speakers/polycarp-nyangau.webp",
    imagePosition: "50% 0%",
  },
  {
    id: "ken-ochuka",
    name: "Ken Ochuka",
    title: "Eld.",
    role: "Camp Meeting Chair",
    // The one host who is also a profiled speaker, and deliberately
    // WITHOUT `image` for that reason. His photograph is owed once, not
    // twice: it is on the speaker record above and HostCard follows this
    // id to it. A biography, when it comes, goes to the same place.
    speakerId: "ken-ochuka",
  },
  {
    // ── HIS NAME IS OMONDI, NOT GEORGE ──────────────────────────────
    //
    // Both documents that print it are wrong. The programme PDF says
    // "George Oyoo" on the opening Sabbath's pastoral prayer and the
    // elders' duty rota says "George Oyoo" twice more. The committee has
    // corrected it, and his own welcome letter is signed "Head Elder
    // Omondi Oyoo", so the correction agrees with the one document he
    // wrote himself. The id and the portrait file moved with the name.
    id: "omondi-oyoo",
    name: "Omondi Oyoo",
    title: "Eld.",
    role: "Head Elder",
    // The FILE behind this path was replaced, and the path was not. The
    // first was cut by host-photos.mjs from the only landscape source in
    // that batch, arms crossed, and it was the largest of the five hosts
    // at 82.3 KB because of the fine gingham check he was wearing. The
    // committee has since sent a plain studio portrait; it is cropped by
    // tools/assets/portrait-photos.mjs and comes out at 25.6 KB, so the
    // byte problem left with the shirt.
    image: "/speakers/omondi-oyoo.webp",
    imagePosition: "50% 0%",
  },
];

export const hostById = Object.fromEntries(
  hosts.map((host) => [host.id, host]),
) as Record<string, Host>;
