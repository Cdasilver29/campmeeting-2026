import type { ArchiveYear } from "./types";

/**
 * Camp Meeting 2026, session by session.
 *
 * ── WHERE THIS CAME FROM ─────────────────────────────────────────────
 *
 * Parsed out of the committee's "NEWLIFE CAMP MEETING PROGRAM.docx" —
 * sixteen tables, fifty-five rows — rather than typed in by hand. Fifty-
 * four of those rows carry a YouTube link and one does not.
 *
 * Every one of the fifty-four ids was checked through
 * `https://www.youtube.com/oembed?url=…&format=json` before this file was
 * committed. All fifty-four resolve, and all fifty-four are on the
 * church's own channel — which is the check that catches an id that is a
 * real video but the wrong meeting. A mistyped id took a live broadcast
 * off this site during the week itself, and that is why this is a
 * standing rule rather than a one-off precaution. See DEPLOY.md.
 *
 * ── THE GROUPING IS THEMATIC, AND CHRONOLOGICAL INSIDE EACH THEME ────
 *
 * A reader who comes here wants "the stewardship talks" or "the
 * children's sermons", not "Tuesday". Nine themes, none of them a
 * singleton, ordered as a camp meeting day runs rather than by size: the
 * preaching, then the two daily teaching tracks, then the topical tracks,
 * then the two audience tracks, then mission.
 *
 * "Special Morning Sessions" is the one grouping that is not a label
 * printed in the document. It holds four one-off morning slots — Spirit
 * of Prophecy, Prophecy, Possibility Ministry, Discipleship — three of
 * them by the same presenter and all four in the same position of the
 * morning. As four sections they would have been four headings with a
 * single card under each, which is a table of contents rather than a
 * grouping. Nothing is lost by joining them: each keeps its own `title`,
 * so splitting them out later is a data edit and not a schema change.
 *
 * ── ONE SESSION HAS NO RECORDING ─────────────────────────────────────
 *
 * 18 August, Family Life Session (0-10yrs), Pr. Kenneth Ayuo. The row is
 * in the document with an empty link cell. It is listed here with no
 * `videoId` and the page renders it as unavailable. See the note on
 * `videoId` in ./types.ts.
 *
 * ── AND ONE HAS NO PART ──────────────────────────────────────────────
 *
 * The Book Promotion on 20 August. Its date cell gives the date and no
 * Morning/Afternoon/Evening, where all fifty-four others give both. It
 * sits between two Morning rows in the document, which is suggestive and
 * is not a source, so the field is left absent and the card shows the
 * date alone.
 *
 * ── NAMES ARE THE DOCUMENT'S ─────────────────────────────────────────
 *
 * Two corrections, both narrow. The document omits the space after an
 * honorific ("Pr.Kenneth Ayuo"), which is typography. And it writes
 * "Elkana Mose", where src/data/event.ts and the church's own titles on
 * these same videos both write "Elkanah Mose" — one person spelled two
 * ways on one site is a defect, so the site's spelling wins.
 *
 * Nothing else is normalised. In particular "Ev. Andrew Okwany" is left
 * exactly as the document has it throughout, even though the channel's
 * own title on one of these videos says "Ev. Andrew Owino". Those may be
 * two people or one; the committee's document is the source here, and
 * merging two names on a guess would be worse than leaving the question
 * open. See DATA-NOTES.md.
 */
export const archive2026: ArchiveYear = {
  year: 2026,
  /* The sermons carry titles that read on their own — "The Bishop's
     Bedroom", "Unstable as Water" — which is exactly what a rotating
     showcase needs and what "Morning Devotion", six times, is not. */
  showcaseThemeId: "sermons",
  themes: [
  {
    id: "sermons",
    label: "Sermons",
    blurb: "The main preaching of the week, morning and evening.",
    videos: [
      {
        date: "2026-08-15",
        part: "Morning",
        speakers: ["Pr. Kennedy Mfune"],
        title: "You are on a Subscription Fee",
        videoId: "a83sJFk7bB0",
      },
      {
        date: "2026-08-15",
        part: "Evening",
        speakers: ["Pr. Kennedy Mfune"],
        title: "The Game is Not Over",
        videoId: "-5LBJ9QHyJw",
      },
      {
        date: "2026-08-16",
        part: "Evening",
        speakers: ["Ev. Andrew Okwany"],
        title: "Obey and Enjoy",
        videoId: "GyLV5dkqpDw",
      },
      {
        date: "2026-08-17",
        part: "Morning",
        speakers: ["Pr. Kennedy Mfune"],
        title: "The Bishop’s Bedroom",
        videoId: "bWHo14MGJ44",
      },
      {
        date: "2026-08-17",
        part: "Evening",
        speakers: ["Pr. Kennedy Mfune"],
        title: "New Levels, New Devils",
        videoId: "fpcfaILn4V0",
      },
      {
        date: "2026-08-18",
        part: "Morning",
        speakers: ["Pr. Kennedy Mfune"],
        title: "In The Right Place But…",
        videoId: "uwoFZyIBakU",
      },
      {
        date: "2026-08-18",
        part: "Evening",
        speakers: ["Pr. Kennedy Mfune"],
        title: "Spot The Difference",
        videoId: "BXH4YXR-Y94",
      },
      {
        date: "2026-08-19",
        part: "Morning",
        speakers: ["Pr. Kennedy Mfune"],
        title: "Life is Complicated, You Never Know",
        videoId: "SgfedHK75do",
      },
      {
        date: "2026-08-19",
        part: "Evening",
        speakers: ["Pr. Kennedy Mfune"],
        title: "Unstable as Water",
        videoId: "fAHYbQfipQo",
      },
      {
        date: "2026-08-20",
        part: "Morning",
        speakers: ["Pr. Kennedy Mfune"],
        title: "Why Enock?",
        videoId: "V1wAJ4D2_Fs",
      },
      {
        date: "2026-08-20",
        part: "Evening",
        speakers: ["Pr. Kennedy Mfune"],
        title: "Speak to that Mountain",
        videoId: "0scAKMl-gu8",
      },
      {
        date: "2026-08-21",
        part: "Morning",
        speakers: ["Pr. Kennedy Mfune"],
        title: "Black Magic in the Church",
        videoId: "caRxh0nAei8",
      },
      {
        date: "2026-08-22",
        part: "Morning",
        speakers: ["Pr. Kennedy Mfune"],
        title: "Warming the King",
        videoId: "ofZEbYQ6rhY",
      },
      {
        date: "2026-08-22",
        part: "Evening",
        speakers: ["Pr. Kennedy Mfune"],
        title: "Now I Know",
        videoId: "T29-1vHEcSw",
      },
    ],
  },
  {
    id: "bible-study",
    label: "Bible Study",
    blurb: "The daily Bible Study hour.",
    videos: [
      {
        date: "2026-08-17",
        part: "Morning",
        speakers: ["Pr. Kenneth Ayuo"],
        title: "Bible Study",
        videoId: "JZ_dzYtk1TA",
      },
      {
        date: "2026-08-18",
        part: "Morning",
        speakers: ["Ev. Andrew Okwany"],
        title: "Bible Study",
        videoId: "XJ5lVIp-B_o",
      },
      {
        date: "2026-08-19",
        part: "Morning",
        speakers: ["Ev. Andrew Okwany"],
        title: "Bible Study",
        videoId: "J2l7ussLtas",
      },
      {
        date: "2026-08-20",
        part: "Morning",
        speakers: ["Ev. Andrew Okwany"],
        title: "Bible Study",
        videoId: "qRRasUTCB1U",
      },
      {
        date: "2026-08-21",
        part: "Morning",
        speakers: ["Ev. Andrew Okwany"],
        title: "Bible Study",
        subtitle: "How to Prevent Burnout",
        videoId: "ZcTwIxfcHCw",
      },
    ],
  },
  {
    id: "morning-devotion",
    label: "Morning Devotion",
    blurb: "How each day opened.",
    videos: [
      {
        date: "2026-08-17",
        part: "Morning",
        speakers: ["Eld. Isaac Oenga"],
        title: "Morning Devotion",
        videoId: "yp0fT7_ljDQ",
      },
      {
        date: "2026-08-18",
        part: "Morning",
        speakers: ["Eld. Isaac Oenga"],
        title: "Morning Devotion",
        videoId: "Uq86JQvCqtc",
      },
      {
        date: "2026-08-19",
        part: "Morning",
        speakers: ["Eld. Isaac Oenga"],
        title: "Morning Devotion",
        videoId: "OR9bRY6mExI",
      },
      {
        date: "2026-08-20",
        part: "Morning",
        speakers: ["Eld. Isaac Oenga"],
        title: "Morning Devotion",
        videoId: "Omk1LujzfLk",
      },
      {
        date: "2026-08-21",
        part: "Morning",
        speakers: ["Eld. Isaac Oenga"],
        title: "Morning Devotion",
        videoId: "DiEvWyYBYSI",
      },
      {
        date: "2026-08-22",
        part: "Morning",
        speakers: ["Eld. Isaac Oenga"],
        title: "Morning Devotion",
        videoId: "UROgqmh2YfU",
      },
    ],
  },
  {
    id: "stewardship",
    label: "Stewardship",
    blurb: "The stewardship track, across five mornings.",
    videos: [
      {
        date: "2026-08-15",
        part: "Morning",
        speakers: ["Pr. Alex Ambuchi"],
        title: "Stewardship of the Mind",
        videoId: "K1LhA34MNmw",
      },
      {
        date: "2026-08-17",
        part: "Morning",
        speakers: ["Pr. Elkanah Mose"],
        title: "Stewardship",
        videoId: "I7s4crrm0vY",
      },
      {
        date: "2026-08-18",
        part: "Morning",
        speakers: ["Pr. Elkanah Mose"],
        title: "Stewardship",
        videoId: "W7X_OayogAg",
      },
      {
        date: "2026-08-19",
        part: "Morning",
        speakers: ["Pr. Elkanah Mose"],
        title: "Stewardship",
        videoId: "qQrjHmLQ4HE",
      },
      {
        date: "2026-08-21",
        part: "Morning",
        speakers: ["Pr. Elkanah Mose"],
        title: "Stewardship",
        videoId: "LH7ii064TMI",
      },
    ],
  },
  {
    id: "health",
    label: "Health",
    blurb: "The health track.",
    videos: [
      {
        date: "2026-08-19",
        part: "Morning",
        speakers: ["Dr. Preskilla Munda"],
        title: "Health",
        videoId: "GMyuwjWamNI",
      },
      {
        date: "2026-08-20",
        part: "Afternoon",
        speakers: ["Dr. Preskilla Munda"],
        title: "Health",
        videoId: "8_TxugZMsP4",
      },
    ],
  },
  {
    id: "special-mornings",
    label: "Special Morning Sessions",
    blurb: "One-off morning sessions: prophecy, discipleship and possibility ministry.",
    videos: [
      {
        date: "2026-08-17",
        part: "Morning",
        speakers: ["Pr. Kenneth Ayuo"],
        title: "Spirit of Prophecy",
        videoId: "bsDvzd_7EPs",
      },
      {
        date: "2026-08-18",
        part: "Morning",
        speakers: ["Pr. Kenneth Ayuo"],
        title: "Prophecy",
        videoId: "Doo-oz-yfXI",
      },
      {
        date: "2026-08-19",
        part: "Morning",
        speakers: ["Pr. Kenneth Ayuo"],
        title: "Possibility Ministry",
        videoId: "oANtCY30aRQ",
      },
      {
        date: "2026-08-21",
        part: "Morning",
        speakers: ["Pr. Kenneth Ayuo"],
        title: "Discipleship",
        videoId: "AZKv7uSjOhA",
      },
    ],
  },
  {
    id: "family-life",
    label: "Family Life",
    blurb: "The family life track, one session per audience.",
    videos: [
      {
        date: "2026-08-16",
        part: "Evening",
        speakers: ["Matthew and Marion Barake"],
        title: "Family Life Session (Youth Class)",
        subtitle: "Rooted in Christ",
        videoId: "LLncKyw4hXA",
      },
      {
        date: "2026-08-17",
        part: "Afternoon",
        speakers: ["Ev. Andrew Okwany"],
        title: "Family Life Session (Young Professionals)",
        subtitle: "Finding Meaning and Purpose",
        videoId: "I6THrouAldU",
      },
      {
        date: "2026-08-18",
        part: "Afternoon",
        speakers: ["Pr. Kenneth Ayuo"],
        title: "Family Life Session (0-10yrs)",
      },
      {
        date: "2026-08-19",
        part: "Afternoon",
        speakers: ["Pr. Elkanah Mose"],
        title: "Family Life Session (11-20yrs)",
        subtitle: "Communication and Conflict Resolution",
        videoId: "fGG5yNFWyrY",
      },
      {
        date: "2026-08-20",
        part: "Afternoon",
        speakers: ["Dr. Preskilla Munda", "Mercy Oduwour"],
        title: "Family Life Session (Parents and Teens)",
        subtitle: "Conversation",
        videoId: "Sy4C4PrdOmI",
      },
    ],
  },
  {
    id: "childrens-sermons",
    label: "Children's Sermons",
    blurb: "The children's programme, morning and evening.",
    videos: [
      {
        date: "2026-08-16",
        part: "Evening",
        speakers: ["Allan Okoth"],
        title: "Children’s Sermon",
        videoId: "j-ODy_9JXzI",
      },
      {
        date: "2026-08-17",
        part: "Morning",
        speakers: ["Allan Okoth"],
        title: "Children’s Sermon",
        videoId: "hxfv3o0GT44",
      },
      {
        date: "2026-08-17",
        part: "Evening",
        speakers: ["Allan Okoth"],
        title: "Children’s Sermon",
        videoId: "E4qoQLGGBFY",
      },
      {
        date: "2026-08-18",
        part: "Morning",
        speakers: ["Allan Okoth"],
        title: "Children’s Sermon",
        videoId: "2SAlByl39vY",
      },
      {
        date: "2026-08-18",
        part: "Evening",
        speakers: ["Allan Okoth"],
        title: "Children’s Sermon",
        subtitle: "When Fear Meets Obedience",
        videoId: "sjsuRI3iM4A",
      },
      {
        date: "2026-08-19",
        part: "Morning",
        speakers: ["Allan Okoth"],
        title: "Children’s Sermon",
        subtitle: "God Always Shows Up",
        videoId: "I0F1VUVJ_So",
      },
      {
        date: "2026-08-19",
        part: "Evening",
        speakers: ["Allan Okoth"],
        title: "Children’s Sermon",
        videoId: "p0U-O-ycnZQ",
      },
      {
        date: "2026-08-20",
        part: "Morning",
        speakers: ["Allan Okoth"],
        title: "Children’s Sermon",
        subtitle: "Not Without God",
        videoId: "Lv_TyMirjCI",
      },
      {
        date: "2026-08-20",
        part: "Evening",
        speakers: ["Allan Okoth"],
        title: "Children’s Sermon",
        subtitle: "Mirror",
        videoId: "drx7xmpddqU",
      },
      {
        date: "2026-08-21",
        part: "Morning",
        speakers: ["Allan Okoth"],
        title: "Children’s Sermon",
        videoId: "OJ3ENiv72gU",
      },
      {
        date: "2026-08-22",
        part: "Morning",
        speakers: ["Allan Okoth"],
        title: "Children’s Sermon",
        videoId: "iD5DVxgRDKU",
      },
    ],
  },
  {
    id: "mission",
    label: "Mission",
    blurb: "Book promotion and the One Voice 27 appeal.",
    videos: [
      {
        date: "2026-08-19",
        part: "Morning",
        speakers: [],
        title: "Book Promotion",
        videoId: "qQIyhJr7qIo",
      },
      {
        date: "2026-08-20",
        part: "Morning",
        speakers: ["Pr. Elvis Onyango"],
        title: "One Voice 27",
        videoId: "R9QKruKSNgc",
      },
      {
        date: "2026-08-20",
        speakers: ["Sis. Pendo Samson"],
        title: "Book Promotion",
        videoId: "IK-FyAjy42U",
      },
    ],
  },  ],
};
