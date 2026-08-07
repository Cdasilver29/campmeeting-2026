import type { ProgramDay } from "./types";

/**
 * Source: Draft Program v3, Camp Meeting 2026 (15th–22nd August).
 * Transcribed 1:1 from the PDF, times normalized to 24h.
 * Known source-document issues are listed in DATA-NOTES.md — do not
 * silently "fix" the schedule here without the program committee's sign-off.
 *
 * ── TWO CONVENTIONS THIS FILE FOLLOWS ────────────────────────────────
 *
 * 1. "Participant" is never transcribed. It is the draft's yellow
 *    to-be-confirmed marker, not a person, and rendering it would put a
 *    placeholder on a public programme. Where the committee has since
 *    supplied the name, it is here; where it has not, the session simply
 *    carries no presenter. Some cells hold the marker AND a real credit
 *    (Monday's evening offering, for one) — there the marker is dropped
 *    and the real credit kept.
 *
 * 2. A presenter cell is split into separate credits only when both
 *    halves name someone: "Alice Bonareri and Choristers" becomes two
 *    chips, "Choristers and Choirs" and "Online Panel and Various
 *    Classes" stay one, because "Choirs" and "Various Classes" are not
 *    names and a chip saying so would claim more than the source does.
 *
 * Session ids are unchanged from v2 wherever v3 kept the item, even
 * where v3 renamed it — ids are in localStorage bookmarks and in URLs.
 * A slug that no longer matches its title is deliberate. See DATA-NOTES.
 */

export const program: ProgramDay[] = [
  // ─────────────────────────────────────────────── Sabbath 15 August
  {
    id: "sabbath-15",
    date: "2026-08-15",
    dayLabel: "Sabbath",
    displayLabel: "Sabbath 15th August",
    blocks: [
      {
        id: "morning-service",
        label: "Morning Service",
        sessions: [
          { id: "sabbath-15-song-service", title: "Song Service", start: "08:00", end: "08:15", presentedBy: ["Choristers"], ministry: "music" },
          { id: "sabbath-15-opening-song", title: "Opening Song", start: "08:15", end: "08:18", presentedBy: ["Eunice Onyango", "Choristers"], ministry: "music" },
          { id: "sabbath-15-opening-prayer", title: "Opening Prayer", start: "08:18", end: "08:21", presentedBy: ["Eunice Onyango"], ministry: "prayer" },
          { id: "sabbath-15-welcome", title: "Welcome & Intro", start: "08:21", end: "08:23", presentedBy: ["Timothy Anyona"] },
          { id: "sabbath-15-special-thought", title: "Special Thought", start: "08:23", end: "08:27", presentedBy: ["Jerry Lumumba"] },
          { id: "sabbath-15-special-item", title: "Special Item", start: "08:27", end: "08:30", presentedBy: ["Choristers"], ministry: "music" },
          { id: "sabbath-15-mission-reading", title: "Mission Reading", start: "08:30", end: "08:35", presentedBy: ["Israel Jathniel"] },
          { id: "sabbath-15-closing-song", title: "Closing Song", start: "08:35", end: "08:38", presentedBy: ["Alice Bonareri", "Choristers"], ministry: "music" },
          { id: "sabbath-15-closing-prayer", title: "Closing Prayer", start: "08:38", end: "08:40", presentedBy: ["Alice Bonareri"], ministry: "prayer" },
          { id: "sabbath-15-lesson-discussion", title: "Lesson Discussion", start: "08:40", end: "09:40", presentedBy: ["Online Panel and Various Classes"], ministry: "bible-study" },
          { id: "sabbath-15-announcements", title: "Announcements and Highlights", start: "09:40", end: "09:50", presentedBy: ["Eld. Robert Nyarango"] },
          { id: "sabbath-15-heart-of-worship", title: "Heart of Worship: Music and Praise", start: "09:50", end: "10:30", presentedBy: ["Choristers and Choirs"], ministry: "music" },
        ],
      },
      {
        id: "divine-service",
        label: "Divine Service",
        sessions: [
          // Retimed and reordered wholesale in v3: the Pastoral Prayer now
          // precedes the offering, and the Scripture Reading has moved from
          // fifth in the block to eleventh, four minutes before the sermon.
          // Ids are v2's so bookmarks survive the change.
          { id: "sabbath-15-doxology", title: "Doxology", start: "10:30", end: "10:32", presentedBy: ["Choristers"], ministry: "worship" },
          { id: "sabbath-15-invocation", title: "Invocation", start: "10:32", end: "10:35", presenterIds: ["kennedy-mfune"], ministry: "worship" },
          { id: "sabbath-15-welcome-intro", title: "Welcome & Introduction", start: "10:35", end: "10:39", presenterIds: ["ken-ochuka"] },
          { id: "sabbath-15-welcome-song", title: "Welcome Song — What a Fellowship", start: "10:39", end: "10:45", presentedBy: ["Choristers"], ministry: "music" },
          { id: "sabbath-15-pastoral-prayer", title: "Pastoral Prayer", start: "10:45", end: "10:50", presentedBy: ["Eld. George Oyoo"], ministry: "prayer" },
          { id: "sabbath-15-offertory", title: "Stewardship (Tithe and Offerings)", start: "10:50", end: "10:53", ministry: "stewardship" },
          { id: "sabbath-15-offertory-songs", title: "Special Song / Offertory Songs", start: "10:53", end: "11:03", ministry: "music" },
          { id: "sabbath-15-offertory-response", title: "Offertory Response", start: "11:03", end: "11:05", presentedBy: ["Choristers"], ministry: "music" },
          { id: "sabbath-15-childrens-corner", title: "Children Sermon", start: "11:05", end: "11:12", ministry: "children" },
          { id: "sabbath-15-special-song", title: "Special Song", start: "11:12", end: "11:27", presentedBy: ["Newlife Church Choir"], ministry: "music" },
          // 11:29 to 11:30 is unscheduled in v3. As printed. DATA-NOTES.
          { id: "sabbath-15-scripture", title: "Scripture Reading", start: "11:27", end: "11:29" },
          { id: "sabbath-15-hymn-of-praise", title: "Hymn of Praise", start: "11:30", end: "11:35", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "sabbath-15-sermon", title: "Sermon", start: "11:35", end: "12:20", presenterIds: ["kennedy-mfune"], featured: true },
          { id: "sabbath-15-closing-hymn", title: "Closing Hymn", start: "12:20", end: "12:25", presentedBy: ["Choristers"], ministry: "music" },
          { id: "sabbath-15-benediction", title: "Benediction", start: "12:25", end: "12:30", presenterIds: ["kennedy-mfune"], ministry: "prayer" },
          { id: "sabbath-15-recessional", title: "Recessional Hymn", start: "12:30", end: "12:35", presentedBy: ["Choristers"], ministry: "music" },
        ],
      },
      {
        id: "afternoon-program",
        label: "Afternoon Program",
        sessions: [
          { id: "sabbath-15-pm-music-1", title: "Music", start: "14:00", end: "15:00", presentedBy: ["Choristers and Choirs"], ministry: "music" },
          { id: "sabbath-15-christian-education", title: "Christian Education", start: "15:00", end: "15:30", ministry: "christian-education", featured: true },
          { id: "sabbath-15-pm-music-2", title: "Music", start: "15:30", end: "16:00", presentedBy: ["Choristers and Choirs"], ministry: "music" },
        ],
      },
      {
        id: "evening-service",
        label: "Evening Service",
        sessions: [
          { id: "sabbath-15-ev-doxology", title: "Doxology; Invocation", start: "16:00", end: "16:05", presentedBy: ["Choristers"], presenterIds: ["kennedy-mfune"], ministry: "worship" },
          { id: "sabbath-15-ev-welcome", title: "Welcome and Introduction", start: "16:05", end: "16:10", presentedBy: ["Eld. Dennis Munda"] },
          // No reader named for either of the opening Sabbath's two
          // Scripture Readings, and no placeholder either — the cell is
          // simply empty in v3. DATA-NOTES.
          { id: "sabbath-15-ev-scripture", title: "Scripture Reading", start: "16:10", end: "16:15" },
          { id: "sabbath-15-ev-theme-song", title: "Theme Song", start: "16:15", end: "16:20", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "sabbath-15-ev-prayer", title: "Prayer", start: "16:20", end: "16:25", presentedBy: ["Eld. Chris Mbegera"], ministry: "prayer" },
          { id: "sabbath-15-ev-giving", title: "Worship in Giving", start: "16:25", end: "16:30", ministry: "stewardship" },
          { id: "sabbath-15-ev-children", title: "Children's Corner", start: "16:30", end: "16:37", ministry: "children" },
          { id: "sabbath-15-ev-special-item", title: "Special Item", start: "16:37", end: "16:45", ministry: "music" },
          { id: "sabbath-15-ev-sermon", title: "Sermon", start: "16:45", end: "17:30", presenterIds: ["kennedy-mfune"], featured: true },
          { id: "sabbath-15-ev-theme-song-2", title: "Theme Song", start: "17:30", end: "17:35", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "sabbath-15-ev-benediction", title: "Benediction", start: "17:35", end: "17:40", presenterIds: ["kennedy-mfune"], ministry: "prayer" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────── Sunday 16 August
  {
    id: "sunday-16",
    date: "2026-08-16",
    dayLabel: "Sunday",
    displayLabel: "Sunday 16th August",
    blocks: [
      {
        id: "morning-service",
        label: "Morning Service",
        sessions: [],
        allBlockActivity: {
          title: "Medical Camp",
          ministry: "medical",
          note: "No timed sessions published for the morning — the Medical Camp runs through the morning block.",
        },
      },
      {
        id: "afternoon-program",
        label: "Afternoon Program",
        sessions: [
          { id: "sunday-16-pm-music", title: "Music", start: "13:30", end: "15:00", presentedBy: ["Choristers and Choirs"], ministry: "music" },
          { id: "sunday-16-family-life", title: "Family Life Sessions", start: "15:00", end: "16:20", presentedBy: ["Various Divisions and Speakers"], ministry: "family-life", featured: true },
        ],
      },
      {
        id: "evening-service",
        label: "Evening Service",
        sessions: [
          { id: "sunday-16-ev-doxology", title: "Doxology; Invocation", start: "16:30", end: "16:35", presentedBy: ["Choristers"], presenterIds: ["kennedy-mfune"], ministry: "worship" },
          { id: "sunday-16-ev-welcome", title: "Welcome and Introduction", start: "16:35", end: "16:40", presentedBy: ["Eld. Emmanuel Mayaka"] },
          { id: "sunday-16-ev-scripture", title: "Scripture Reading", start: "16:40", end: "16:45", presentedBy: ["Anne Okemwa"] },
          { id: "sunday-16-ev-theme-song", title: "Theme Song", start: "16:45", end: "16:50", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "sunday-16-ev-prayer", title: "Prayer", start: "16:50", end: "16:55", presentedBy: ["Eld. Fred Mege"], ministry: "prayer" },
          { id: "sunday-16-ev-giving", title: "Worship in Giving", start: "16:55", end: "17:00", ministry: "stewardship" },
          { id: "sunday-16-ev-children", title: "Children's Corner", start: "17:00", end: "17:15", presenterIds: ["allan-okoth"], ministry: "children" },
          { id: "sunday-16-ev-special-item", title: "Special Item", start: "17:15", end: "17:20", presentedBy: ["Newlife Migori Church Choir", "Newlife Church Choir"], ministry: "music" },
          { id: "sunday-16-ev-sermon", title: "Sermon", start: "17:20", end: "18:05", presenterIds: ["kennedy-mfune"], featured: true },
          { id: "sunday-16-ev-theme-song-2", title: "Theme Song", start: "18:05", end: "18:10", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "sunday-16-ev-benediction", title: "Benediction", start: "18:10", end: "18:15", presenterIds: ["kennedy-mfune"], ministry: "prayer" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────── Monday 17 August
  {
    id: "monday-17",
    date: "2026-08-17",
    dayLabel: "Monday",
    displayLabel: "Monday 17th August",
    blocks: [
      {
        id: "morning-service",
        label: "Morning Service",
        sessions: [
          { id: "monday-17-devotion", title: "Prayers and Morning Devotion", start: "07:00", end: "08:00", presenterIds: ["isaac-oenga"], ministry: "prayer", featured: true },
          { id: "monday-17-song-service-1", title: "Song Service", start: "08:00", end: "08:10", presentedBy: ["Choristers"], ministry: "music" },
          { id: "monday-17-bible-study", title: "Bible Study", start: "08:10", end: "08:50", presentedBy: ["Pr. Musonera Jason"], ministry: "bible-study", featured: true },
          { id: "monday-17-song-service-2", title: "Song Service", start: "08:50", end: "09:00", presentedBy: ["Choristers"], ministry: "music" },
          { id: "monday-17-spirit-of-prophecy", title: "Spirit of Prophecy", start: "09:00", end: "09:40", presenterIds: ["kenneth-ayuo"], ministry: "spirit-of-prophecy", featured: true },
          { id: "monday-17-book-promotion", title: "Book Promotion", start: "09:40", end: "09:50", presentedBy: ["Literature Evangelist"], ministry: "publishing" },
          { id: "monday-17-stewardship", title: "Stewardship", start: "09:50", end: "10:30", presenterIds: ["elkanah-mose"], ministry: "stewardship", featured: true },
          { id: "monday-17-heart-of-worship", title: "Heart of Worship — Praise and Music", start: "10:30", end: "11:00", presentedBy: ["Esiiro Choir", "Newlife Migori Church Choir", "Newlife Church Choir", "Taji Kenya (Gifted Ministry)"], ministry: "music" },
        ],
      },
      {
        id: "mid-morning-service",
        label: "Mid Morning Service",
        sessions: [
          { id: "monday-17-mm-doxology", title: "Doxology; Invocation", start: "11:00", end: "11:05", presentedBy: ["Choristers"], presenterIds: ["kennedy-mfune"], ministry: "worship" },
          { id: "monday-17-mm-welcome", title: "Welcome and Introduction", start: "11:05", end: "11:10", presentedBy: ["Eld. Tom Onyambu"] },
          { id: "monday-17-mm-scripture", title: "Scripture Reading", start: "11:10", end: "11:15", presentedBy: ["Jerry Lumumba"] },
          { id: "monday-17-mm-theme-song", title: "Theme Song", start: "11:15", end: "11:20", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "monday-17-mm-prayer", title: "Prayer", start: "11:20", end: "11:25", presentedBy: ["Eld. Jim Omollo"], ministry: "prayer" },
          { id: "monday-17-mm-giving", title: "Worship in Giving", start: "11:25", end: "11:30", ministry: "stewardship" },
          { id: "monday-17-mm-children", title: "Children's Corner", start: "11:30", end: "11:45", presenterIds: ["allan-okoth"], ministry: "children" },
          { id: "monday-17-mm-special-item", title: "Special Item", start: "11:45", end: "11:50", presentedBy: ["Newlife Migori Church Choir", "Newlife Church Choir"], ministry: "music" },
          { id: "monday-17-mm-sermon", title: "Sermon", start: "11:50", end: "12:35", presenterIds: ["kennedy-mfune"], featured: true },
          { id: "monday-17-mm-theme-song-2", title: "Theme Song", start: "12:35", end: "12:40", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "monday-17-mm-benediction", title: "Benediction", start: "12:40", end: "12:45", presenterIds: ["kennedy-mfune"], ministry: "prayer" },
        ],
      },
      {
        id: "afternoon-program",
        label: "Afternoon Program",
        sessions: [
          { id: "monday-17-pm-music", title: "Music", start: "14:00", end: "14:10", presentedBy: ["Choristers"], ministry: "music" },
          // First of the four-part Health series. The arc printed after
          // each title goes in `note`, so the subtitle is the session's
          // name and the note is where it sits in the sequence.
          { id: "monday-17-health", title: "Health", subtitle: "What Broke? Broken Identity", start: "14:10", end: "15:00", presenterIds: ["preskilla-munda"], ministry: "health", featured: true, note: "Creation → Fall" },
          { id: "monday-17-family-life", title: "Family Life Sessions", start: "15:00", end: "16:20", presentedBy: ["Various Divisions and Speakers"], ministry: "family-life", featured: true },
        ],
      },
      {
        id: "evening-service",
        label: "Evening Service",
        sessions: [
          { id: "monday-17-ev-doxology", title: "Doxology; Invocation", start: "16:30", end: "16:35", presentedBy: ["Choristers"], presenterIds: ["kennedy-mfune"], ministry: "worship" },
          { id: "monday-17-ev-welcome", title: "Welcome and Introduction", start: "16:35", end: "16:40", presentedBy: ["Eld. Chrispus Onkoba"] },
          { id: "monday-17-ev-scripture", title: "Scripture Reading", start: "16:40", end: "16:45", presentedBy: ["Obed Gabby"] },
          { id: "monday-17-ev-theme-song", title: "Theme Song", start: "16:45", end: "16:50", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "monday-17-ev-prayer", title: "Prayer", start: "16:50", end: "16:55", presentedBy: ["Eld. Paul Wangai"], ministry: "prayer" },
          // The cell holds the placeholder and a real credit. The
          // placeholder is dropped, the choir singing the offering kept.
          { id: "monday-17-ev-giving", title: "Worship in Giving", start: "16:55", end: "17:00", presentedBy: ["Esiiro Choir"], ministry: "stewardship" },
          { id: "monday-17-ev-children", title: "Children's Corner", start: "17:00", end: "17:15", presenterIds: ["allan-okoth"], ministry: "children" },
          { id: "monday-17-ev-special-item", title: "Special Item", start: "17:15", end: "17:20", presentedBy: ["Newlife Migori Church Choir", "Newlife Church Choir"], ministry: "music" },
          { id: "monday-17-ev-sermon", title: "Sermon", start: "17:20", end: "18:05", presenterIds: ["kennedy-mfune"], featured: true },
          { id: "monday-17-ev-theme-song-2", title: "Theme Song", start: "18:05", end: "18:10", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "monday-17-ev-benediction", title: "Benediction", start: "18:10", end: "18:15", presenterIds: ["kennedy-mfune"], ministry: "prayer" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────── Tuesday 18 August
  {
    id: "tuesday-18",
    date: "2026-08-18",
    dayLabel: "Tuesday",
    displayLabel: "Tuesday 18th August",
    blocks: [
      {
        id: "morning-service",
        label: "Morning Service",
        sessions: [
          { id: "tuesday-18-devotion", title: "Prayers and Morning Devotion", start: "07:00", end: "08:00", presenterIds: ["isaac-oenga"], ministry: "prayer", featured: true },
          { id: "tuesday-18-song-service-1", title: "Song Service", start: "08:00", end: "08:10", presentedBy: ["Choristers"], ministry: "music" },
          { id: "tuesday-18-bible-study", title: "Bible Study", start: "08:10", end: "08:50", presentedBy: ["Pr. Musonera Jason"], ministry: "bible-study", featured: true },
          { id: "tuesday-18-song-service-2", title: "Song Service", start: "08:50", end: "09:00", presentedBy: ["Choristers"], ministry: "music" },
          { id: "tuesday-18-prophecy", title: "Prophecy", start: "09:00", end: "09:40", presenterIds: ["kenneth-ayuo"], ministry: "prophecy", featured: true },
          { id: "tuesday-18-book-promotion", title: "Book Promotion", start: "09:40", end: "09:50", presentedBy: ["Literature Evangelists"], ministry: "publishing" },
          { id: "tuesday-18-stewardship", title: "Stewardship", start: "09:50", end: "10:30", presenterIds: ["elkanah-mose"], ministry: "stewardship", featured: true },
          { id: "tuesday-18-heart-of-worship", title: "Heart of Worship — Praise and Music", start: "10:30", end: "11:00", presentedBy: ["Adventist Women Ministries Choir", "Newlife Migori Church Choir", "Newlife Church Choir", "Taji Kenya (Gifted Ministry)"], ministry: "music" },
        ],
      },
      {
        id: "mid-morning-service",
        label: "Mid Morning Service",
        sessions: [
          { id: "tuesday-18-mm-doxology", title: "Doxology; Invocation", start: "11:00", end: "11:05", presentedBy: ["Choristers"], presenterIds: ["kennedy-mfune"], ministry: "worship" },
          { id: "tuesday-18-mm-welcome", title: "Welcome and Introduction", start: "11:05", end: "11:10", presentedBy: ["Eld. John Oduka"] },
          { id: "tuesday-18-mm-scripture", title: "Scripture Reading", start: "11:10", end: "11:15", presentedBy: ["Faith Pherose"] },
          { id: "tuesday-18-mm-theme-song", title: "Theme Song", start: "11:15", end: "11:20", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "tuesday-18-mm-prayer", title: "Prayer", start: "11:20", end: "11:25", presentedBy: ["Eld. Lewis Sitoki"], ministry: "prayer" },
          { id: "tuesday-18-mm-giving", title: "Worship in Giving", start: "11:25", end: "11:30", ministry: "stewardship" },
          { id: "tuesday-18-mm-children", title: "Children's Corner", start: "11:30", end: "11:45", presenterIds: ["allan-okoth"], ministry: "children" },
          // Placeholder alongside the two choirs here, where the other
          // weekdays credit the choirs alone. Placeholder dropped.
          { id: "tuesday-18-mm-special-item", title: "Special Item", start: "11:45", end: "11:50", presentedBy: ["Newlife Migori Church Choir", "Newlife Church Choir"], ministry: "music" },
          { id: "tuesday-18-mm-sermon", title: "Sermon", start: "11:50", end: "12:35", presenterIds: ["kennedy-mfune"], featured: true },
          { id: "tuesday-18-mm-theme-song-2", title: "Theme Song", start: "12:35", end: "12:40", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "tuesday-18-mm-benediction", title: "Benediction", start: "12:40", end: "12:45", presenterIds: ["kennedy-mfune"], ministry: "prayer" },
        ],
      },
      {
        id: "afternoon-program",
        label: "Afternoon Program",
        sessions: [
          { id: "tuesday-18-pm-music", title: "Music", start: "14:00", end: "14:10", presentedBy: ["Choristers"], ministry: "music" },
          // "Brokennes" in the source. Single typo, corrected.
          { id: "tuesday-18-health", title: "Health", subtitle: "How did Brokenness Spread? Generational Brokenness", start: "14:10", end: "15:00", presenterIds: ["preskilla-munda"], ministry: "health", featured: true, note: "Individuals → Families" },
          { id: "tuesday-18-family-life", title: "Family Life Sessions", start: "15:00", end: "16:20", presentedBy: ["Various Divisions and Speakers"], ministry: "family-life", featured: true },
        ],
      },
      {
        id: "evening-service",
        label: "Evening Service",
        sessions: [
          { id: "tuesday-18-ev-doxology", title: "Doxology; Invocation", start: "16:30", end: "16:35", presentedBy: ["Choristers"], presenterIds: ["kennedy-mfune"], ministry: "worship" },
          { id: "tuesday-18-ev-welcome", title: "Welcome and Introduction", start: "16:35", end: "16:40", presentedBy: ["Eld. David Sing'ombe"] },
          { id: "tuesday-18-ev-scripture", title: "Scripture Reading", start: "16:40", end: "16:45", presentedBy: ["Shaquille Obilloh"] },
          { id: "tuesday-18-ev-theme-song", title: "Theme Song", start: "16:45", end: "16:50", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "tuesday-18-ev-prayer", title: "Prayer", start: "16:50", end: "16:55", presentedBy: ["Eld. Daniel Kittur"], ministry: "prayer" },
          { id: "tuesday-18-ev-giving", title: "Worship in Giving", start: "16:55", end: "17:00", ministry: "stewardship" },
          { id: "tuesday-18-ev-children", title: "Children's Corner", start: "17:00", end: "17:15", presenterIds: ["allan-okoth"], ministry: "children" },
          { id: "tuesday-18-ev-special-item", title: "Special Item", start: "17:15", end: "17:20", presentedBy: ["Newlife Migori Church Choir", "Newlife Church Choir"], ministry: "music" },
          { id: "tuesday-18-ev-sermon", title: "Sermon", start: "17:20", end: "18:05", presenterIds: ["kennedy-mfune"], featured: true },
          { id: "tuesday-18-ev-theme-song-2", title: "Theme Song", start: "18:05", end: "18:10", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "tuesday-18-ev-benediction", title: "Benediction", start: "18:10", end: "18:15", presenterIds: ["kennedy-mfune"], ministry: "prayer" },
        ],
      },
    ],
  },
  // ─────────────────────────────────────────────── Wednesday 19 August
  {
    id: "wednesday-19",
    date: "2026-08-19",
    dayLabel: "Wednesday",
    displayLabel: "Wednesday 19th August",
    blocks: [
      {
        id: "morning-service",
        label: "Morning Service",
        sessions: [
          { id: "wednesday-19-devotion", title: "Prayers and Morning Devotion", start: "07:00", end: "08:00", presenterIds: ["isaac-oenga"], ministry: "prayer", featured: true },
          { id: "wednesday-19-song-service-1", title: "Song Service", start: "08:00", end: "08:10", presentedBy: ["Choristers"], ministry: "music" },
          { id: "wednesday-19-bible-study", title: "Bible Study", start: "08:10", end: "08:50", presentedBy: ["Pr. Musonera Jason"], ministry: "bible-study", featured: true },
          { id: "wednesday-19-song-service-2", title: "Song Service", start: "08:50", end: "09:00", presentedBy: ["Choristers"], ministry: "music" },
          { id: "wednesday-19-possibility", title: "Possibility Ministry", start: "09:00", end: "09:40", presenterIds: ["kenneth-ayuo"], ministry: "possibility-ministry", featured: true },
          { id: "wednesday-19-book-promotion", title: "Book Promotion", start: "09:40", end: "09:50", presentedBy: ["Literature Evangelists"], ministry: "publishing" },
          { id: "wednesday-19-stewardship", title: "Stewardship", start: "09:50", end: "10:30", presenterIds: ["elkanah-mose"], ministry: "stewardship", featured: true },
          { id: "wednesday-19-heart-of-worship", title: "Heart of Worship — Praise and Music", start: "10:30", end: "11:00", presentedBy: ["Young Adults Choir", "Redemption Singers", "Newlife Migori Church Choir", "Newlife Church Choir", "Taji Kenya (Gifted Ministry)"], ministry: "music" },
        ],
      },
      {
        id: "mid-morning-service",
        label: "Mid Morning Service",
        sessions: [
          { id: "wednesday-19-mm-doxology", title: "Doxology; Invocation", start: "11:00", end: "11:05", presentedBy: ["Choristers"], presenterIds: ["kennedy-mfune"], ministry: "worship" },
          { id: "wednesday-19-mm-welcome", title: "Welcome and Introduction", start: "11:05", end: "11:10", presentedBy: ["Eld. Ben Nyarega"] },
          { id: "wednesday-19-mm-scripture", title: "Scripture Reading", start: "11:10", end: "11:15", presentedBy: ["Jerry Odhiambo"] },
          { id: "wednesday-19-mm-theme-song", title: "Theme Song", start: "11:15", end: "11:20", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "wednesday-19-mm-prayer", title: "Prayer", start: "11:20", end: "11:25", presentedBy: ["Eld. Maxwell Ngala"], ministry: "prayer" },
          { id: "wednesday-19-mm-giving", title: "Worship in Giving", start: "11:25", end: "11:30", ministry: "stewardship" },
          { id: "wednesday-19-mm-children", title: "Children's Corner", start: "11:30", end: "11:45", presenterIds: ["allan-okoth"], ministry: "children" },
          { id: "wednesday-19-mm-special-item", title: "Special Item", start: "11:45", end: "11:50", presentedBy: ["Newlife Migori Church Choir", "Newlife Church Choir"], ministry: "music" },
          { id: "wednesday-19-mm-sermon", title: "Sermon", start: "11:50", end: "12:35", presenterIds: ["kennedy-mfune"], featured: true },
          { id: "wednesday-19-mm-theme-song-2", title: "Theme Song", start: "12:35", end: "12:40", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "wednesday-19-mm-benediction", title: "Benediction", start: "12:40", end: "12:45", presenterIds: ["kennedy-mfune"], ministry: "prayer" },
        ],
      },
      {
        id: "afternoon-program",
        label: "Afternoon Program",
        sessions: [
          { id: "wednesday-19-pm-music", title: "Music", start: "14:00", end: "14:10", presentedBy: ["Choristers"], ministry: "music" },
          { id: "wednesday-19-health", title: "Health", subtitle: "How does Christ Restore? Restored Relationships", start: "14:10", end: "15:00", presenterIds: ["preskilla-munda"], ministry: "health", featured: true, note: "Healing Individuals → Healing Homes" },
          { id: "wednesday-19-family-life", title: "Family Life Sessions", start: "15:00", end: "16:20", presentedBy: ["Various Divisions and Speakers"], ministry: "family-life", featured: true },
        ],
      },
      {
        id: "evening-service",
        label: "Evening Service",
        sessions: [
          { id: "wednesday-19-ev-doxology", title: "Doxology; Invocation", start: "16:30", end: "16:35", presentedBy: ["Choristers"], presenterIds: ["kennedy-mfune"], ministry: "worship" },
          { id: "wednesday-19-ev-welcome", title: "Welcome and Introduction", start: "16:35", end: "16:40", presentedBy: ["Eld. Robert Ondara"] },
          { id: "wednesday-19-ev-scripture", title: "Scripture Reading", start: "16:40", end: "16:45", presentedBy: ["Govan Lumumba"] },
          { id: "wednesday-19-ev-theme-song", title: "Theme Song", start: "16:45", end: "16:50", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "wednesday-19-ev-prayer", title: "Prayer", start: "16:50", end: "16:55", presentedBy: ["Eld. Zachary Ochako"], ministry: "prayer" },
          { id: "wednesday-19-ev-giving", title: "Worship in Giving", start: "16:55", end: "17:00", ministry: "stewardship" },
          { id: "wednesday-19-ev-children", title: "Children's Corner", start: "17:00", end: "17:15", presenterIds: ["allan-okoth"], ministry: "children" },
          { id: "wednesday-19-ev-special-item", title: "Special Item", start: "17:15", end: "17:20", presentedBy: ["Newlife Migori Church Choir", "Newlife Church Choir"], ministry: "music" },
          { id: "wednesday-19-ev-sermon", title: "Sermon", start: "17:20", end: "18:05", presenterIds: ["kennedy-mfune"], featured: true },
          { id: "wednesday-19-ev-theme-song-2", title: "Theme Song", start: "18:05", end: "18:10", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "wednesday-19-ev-benediction", title: "Benediction", start: "18:10", end: "18:15", presenterIds: ["kennedy-mfune"], ministry: "prayer" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────── Thursday 20 August
  {
    id: "thursday-20",
    date: "2026-08-20",
    dayLabel: "Thursday",
    displayLabel: "Thursday 20th August",
    blocks: [
      {
        id: "morning-service",
        label: "Morning Service",
        sessions: [
          { id: "thursday-20-devotion", title: "Prayers and Morning Devotion", start: "07:00", end: "08:00", presenterIds: ["isaac-oenga"], ministry: "prayer", featured: true },
          { id: "thursday-20-song-service-1", title: "Song Service", start: "08:00", end: "08:10", presentedBy: ["Choristers"], ministry: "music" },
          { id: "thursday-20-bible-study", title: "Bible Study", start: "08:10", end: "08:50", presentedBy: ["Pr. Musonera Jason"], ministry: "bible-study", featured: true },
          { id: "thursday-20-song-service-2", title: "Song Service", start: "08:50", end: "09:00", presentedBy: ["Choristers"], ministry: "music" },
          // The only session in the week that names a campaign rather
          // than a subject. Title as printed.
          { id: "thursday-20-evangelism", title: "Evangelism - One Voice 2027", start: "09:00", end: "09:40", presentedBy: ["Pr. Elvis Onyango"], ministry: "evangelism", featured: true },
          { id: "thursday-20-book-promotion", title: "Book Promotion", start: "09:40", end: "09:50", presentedBy: ["Literature Evangelists"], ministry: "publishing" },
          { id: "thursday-20-stewardship", title: "Stewardship", start: "09:50", end: "10:30", presenterIds: ["elkanah-mose"], ministry: "stewardship", featured: true },
          { id: "thursday-20-heart-of-worship", title: "Heart of Worship — Praise and Music", start: "10:30", end: "11:00", presentedBy: ["Choristers Choir", "Ambassadors Choir", "Newlife Migori Church Choir", "Newlife Church Choir", "Taji Kenya (Gifted Ministry)"], ministry: "music" },
        ],
      },
      {
        id: "mid-morning-service",
        label: "Mid Morning Service",
        sessions: [
          { id: "thursday-20-mm-doxology", title: "Doxology; Invocation", start: "11:00", end: "11:05", presentedBy: ["Choristers"], presenterIds: ["kennedy-mfune"], ministry: "worship" },
          { id: "thursday-20-mm-welcome", title: "Welcome and Introduction", start: "11:05", end: "11:10", presentedBy: ["Eld. Evans Kibet"] },
          { id: "thursday-20-mm-scripture", title: "Scripture Reading", start: "11:10", end: "11:15", presentedBy: ["Flavia Adoyo"] },
          { id: "thursday-20-mm-theme-song", title: "Theme Song", start: "11:15", end: "11:20", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "thursday-20-mm-prayer", title: "Prayer", start: "11:20", end: "11:25", presentedBy: ["Eld. Meshack Dwallow"], ministry: "prayer" },
          { id: "thursday-20-mm-giving", title: "Worship in Giving", start: "11:25", end: "11:30", ministry: "stewardship" },
          { id: "thursday-20-mm-children", title: "Children's Corner", start: "11:30", end: "11:45", presenterIds: ["allan-okoth"], ministry: "children" },
          { id: "thursday-20-mm-special-item", title: "Special Item", start: "11:45", end: "11:50", presentedBy: ["Newlife Migori Church Choir", "Newlife Church Choir"], ministry: "music" },
          { id: "thursday-20-mm-sermon", title: "Sermon", start: "11:50", end: "12:35", presenterIds: ["kennedy-mfune"], featured: true },
          { id: "thursday-20-mm-theme-song-2", title: "Theme Song", start: "12:35", end: "12:40", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "thursday-20-mm-benediction", title: "Benediction", start: "12:40", end: "12:45", presenterIds: ["kennedy-mfune"], ministry: "prayer" },
        ],
      },
      {
        id: "afternoon-program",
        label: "Afternoon Program",
        sessions: [
          { id: "thursday-20-pm-music", title: "Music", start: "14:00", end: "14:10", presentedBy: ["Choristers"], ministry: "music" },
          // Last of the four. The only one whose arc is printed without
          // brackets, and with an arrow typed as "-→"; separated and set
          // like the other three.
          { id: "thursday-20-health", title: "Health", subtitle: "Why Restoration? Restored Church & Mission", start: "14:10", end: "15:00", presenterIds: ["preskilla-munda"], ministry: "health", featured: true, note: "Healthy Families → Mission" },
          { id: "thursday-20-family-life", title: "Family Life Sessions", start: "15:00", end: "16:20", presentedBy: ["Various Divisions and Speakers"], ministry: "family-life", featured: true },
        ],
      },
      {
        id: "evening-service",
        label: "Evening Service",
        sessions: [
          { id: "thursday-20-ev-doxology", title: "Doxology; Invocation", start: "16:30", end: "16:35", presentedBy: ["Choristers"], presenterIds: ["kennedy-mfune"], ministry: "worship" },
          { id: "thursday-20-ev-welcome", title: "Welcome and Introduction", start: "16:35", end: "16:40", presentedBy: ["Eld. George Ambatta"] },
          { id: "thursday-20-ev-scripture", title: "Scripture Reading", start: "16:40", end: "16:45", presentedBy: ["Janet Yala"] },
          { id: "thursday-20-ev-theme-song", title: "Theme Song", start: "16:45", end: "16:50", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "thursday-20-ev-prayer", title: "Prayer", start: "16:50", end: "16:55", presentedBy: ["Eld. William Otieno"], ministry: "prayer" },
          { id: "thursday-20-ev-giving", title: "Worship in Giving", start: "16:55", end: "17:00", presentedBy: ["Choristers Choir", "Ambassadors Choir"], ministry: "stewardship" },
          { id: "thursday-20-ev-children", title: "Children's Corner", start: "17:00", end: "17:15", presenterIds: ["allan-okoth"], ministry: "children" },
          { id: "thursday-20-ev-special-item", title: "Special Item", start: "17:15", end: "17:20", presentedBy: ["Newlife Migori Church Choir", "Newlife Church Choir"], ministry: "music" },
          { id: "thursday-20-ev-sermon", title: "Sermon", start: "17:20", end: "18:05", presenterIds: ["kennedy-mfune"], featured: true },
          { id: "thursday-20-ev-theme-song-2", title: "Theme Song", start: "18:05", end: "18:10", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "thursday-20-ev-benediction", title: "Benediction", start: "18:10", end: "18:15", presenterIds: ["kennedy-mfune"], ministry: "prayer" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────── Friday 21 August
  {
    id: "friday-21",
    date: "2026-08-21",
    dayLabel: "Friday",
    displayLabel: "Friday 21st August",
    blocks: [
      {
        id: "morning-service",
        label: "Morning Service",
        sessions: [
          { id: "friday-21-devotion", title: "Prayers and Morning Devotion", start: "07:00", end: "08:00", presenterIds: ["isaac-oenga"], ministry: "prayer", featured: true },
          { id: "friday-21-song-service-1", title: "Song Service", start: "08:00", end: "08:10", presentedBy: ["Choristers"], ministry: "music" },
          { id: "friday-21-bible-study", title: "Bible Study", start: "08:10", end: "08:50", presentedBy: ["Pr. Musonera Jason"], ministry: "bible-study", featured: true },
          { id: "friday-21-song-service-2", title: "Song Service", start: "08:50", end: "09:00", presentedBy: ["Choristers"], ministry: "music" },
          { id: "friday-21-discipleship", title: "Discipleship", start: "09:00", end: "09:40", presenterIds: ["kenneth-ayuo"], ministry: "discipleship", featured: true },
          { id: "friday-21-song-service-3", title: "Song Service", start: "09:40", end: "09:50", presentedBy: ["Choristers"], ministry: "music" },
          // The 09:50 slot was Publishing in v2 and is Stewardship in v3,
          // which puts Friday in step with the other four weekdays. A
          // change of subject rather than a rename, but the same slot, so
          // the id stays — it is what any bookmark already made points at.
          // The slug is now wrong about its own contents. See DATA-NOTES.
          { id: "friday-21-publishing", title: "Stewardship", start: "09:50", end: "10:30", presenterIds: ["elkanah-mose"], ministry: "stewardship", featured: true },
          { id: "friday-21-heart-of-worship", title: "Heart of Worship — Praise and Music", start: "10:30", end: "10:50", presentedBy: ["Adventist Men's Ministries Choir", "Newlife Migori Church Choir", "Newlife Church Choir", "Taji Kenya (Gifted Ministry)"], ministry: "music" },
        ],
      },
      {
        id: "mid-morning-service",
        label: "Mid Morning Service",
        sessions: [
          { id: "friday-21-mm-doxology", title: "Doxology; Invocation", start: "10:50", end: "10:55", presenterIds: ["kennedy-mfune"], ministry: "worship" },
          { id: "friday-21-mm-welcome", title: "Welcome and Introduction", start: "10:55", end: "11:00", presentedBy: ["Eld. Micah Oyaro"] },
          { id: "friday-21-mm-scripture", title: "Scripture Reading", start: "11:00", end: "11:05", presentedBy: ["Loice Moraa"] },
          { id: "friday-21-mm-theme-song", title: "Theme Song", start: "11:05", end: "11:10", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "friday-21-mm-prayer", title: "Prayer", start: "11:10", end: "11:15", presentedBy: ["Eld. Duncan Amayo"], ministry: "prayer" },
          { id: "friday-21-mm-giving", title: "Worship in Giving", start: "11:15", end: "11:20", presentedBy: ["Adventist Men's Ministries Choir"], ministry: "stewardship" },
          { id: "friday-21-mm-children", title: "Children's Corner", start: "11:20", end: "11:35", presenterIds: ["allan-okoth"], ministry: "children" },
          { id: "friday-21-mm-special-item", title: "Special Item", start: "11:35", end: "11:40", presentedBy: ["Newlife Migori Church Choir", "Newlife Church Choir"], ministry: "music" },
          { id: "friday-21-mm-sermon", title: "Sermon", start: "11:40", end: "12:25", presenterIds: ["kennedy-mfune"], featured: true },
          { id: "friday-21-mm-theme-song-2", title: "Theme Song", start: "12:25", end: "12:30", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
        ],
      },
      {
        id: "afternoon-program",
        label: "Afternoon and Evening",
        sessions: [],
        allBlockActivity: {
          title: "Sabbath Preparation",
          ministry: "fellowship",
          note: "Confirmed by the program committee: there is no Friday evening service. The afternoon and evening are reserved for Sabbath preparation.",
        },
      },
    ],
  },

  // ─────────────────────────────────────────────── Sabbath 22 August
  {
    id: "sabbath-22",
    date: "2026-08-22",
    dayLabel: "Sabbath",
    displayLabel: "Sabbath 22nd August",
    blocks: [
      {
        id: "morning-service",
        label: "Morning Service",
        sessions: [
          // New in v3, and the only structural addition it makes: the
          // closing Sabbath now opens with the weekday devotion, 45
          // minutes rather than the weekdays' hour.
          { id: "sabbath-22-devotion", title: "Prayers and Morning Devotion", start: "07:15", end: "08:00", presenterIds: ["isaac-oenga"], ministry: "prayer", featured: true },
          { id: "sabbath-22-song-service", title: "Song Service", start: "08:00", end: "08:15", presentedBy: ["Choristers"], ministry: "music" },
          { id: "sabbath-22-opening-song", title: "Opening Song", start: "08:15", end: "08:18", presentedBy: ["Martina Odhiambo", "Choristers"], ministry: "music" },
          { id: "sabbath-22-opening-prayer", title: "Opening Prayer", start: "08:18", end: "08:21", presentedBy: ["Martina Odhiambo"], ministry: "prayer" },
          { id: "sabbath-22-welcome", title: "Welcome & Intro", start: "08:21", end: "08:23", presentedBy: ["Eld. Godwin Ouma"] },
          { id: "sabbath-22-special-thought", title: "Special Thought", start: "08:23", end: "08:27", presentedBy: ["Joshua Okari"] },
          { id: "sabbath-22-special-item", title: "Special Item", start: "08:27", end: "08:30", presentedBy: ["Newlife Choristers Choir"], ministry: "music" },
          { id: "sabbath-22-mission-reading", title: "Mission Reading", start: "08:30", end: "08:35", presentedBy: ["Betty Okombo"] },
          { id: "sabbath-22-closing-song", title: "Closing Song", start: "08:35", end: "08:38", presentedBy: ["Michael Ouru", "Choristers"], ministry: "music" },
          { id: "sabbath-22-closing-prayer", title: "Closing Prayer", start: "08:38", end: "08:40", presentedBy: ["Michael Ouru"], ministry: "prayer" },
          { id: "sabbath-22-lesson-discussion", title: "Lesson Discussion (Large Panel)", start: "08:40", end: "09:40", presentedBy: ["Susan Gichini", "Eld. Opere Nyaroya", "Brian Ayako", "Eld. Chrispus Onkoba"], ministry: "bible-study" },
          { id: "sabbath-22-announcements", title: "Announcements and Highlights", start: "09:40", end: "09:50", presentedBy: ["Eld. Paul Momanyi"] },
          { id: "sabbath-22-heart-of-worship", title: "Heart of Worship: Music and Praise", start: "09:50", end: "10:30", presentedBy: ["Choristers and Choirs"], ministry: "music" },
        ],
      },
      {
        id: "divine-service",
        label: "Divine Service",
        sessions: [
          // Retimed and reordered exactly as the opening Sabbath's was.
          { id: "sabbath-22-doxology", title: "Doxology", start: "10:30", end: "10:32", presentedBy: ["Choristers"], ministry: "worship" },
          { id: "sabbath-22-invocation", title: "Invocation", start: "10:32", end: "10:35", presenterIds: ["kennedy-mfune"], ministry: "worship" },
          { id: "sabbath-22-welcome-intro", title: "Welcome & Introduction", start: "10:35", end: "10:39", presentedBy: ["Pr. Gerald Mochoge"] },
          { id: "sabbath-22-welcome-song", title: "Welcome Song — What a Fellowship", start: "10:39", end: "10:45", presentedBy: ["Choristers"], ministry: "music" },
          { id: "sabbath-22-pastoral-prayer", title: "Pastoral Prayer", start: "10:45", end: "10:50", presentedBy: ["Pr. Polycarp Nyangau"], ministry: "prayer" },
          { id: "sabbath-22-offertory", title: "Stewardship (Tithe and Offerings)", start: "10:50", end: "10:53", presenterIds: ["elkanah-mose"], ministry: "stewardship" },
          { id: "sabbath-22-offertory-songs", title: "Special Songs", start: "10:53", end: "11:03", presentedBy: ["Taji Kenya (Gifted Ministry)"], ministry: "music" },
          { id: "sabbath-22-offertory-response", title: "Offertory Response", start: "11:03", end: "11:05", presentedBy: ["Choristers"], ministry: "music" },
          { id: "sabbath-22-childrens-corner", title: "Children Sermon", start: "11:05", end: "11:12", presenterIds: ["allan-okoth"], ministry: "children" },
          { id: "sabbath-22-special-song", title: "Special Songs", start: "11:12", end: "11:27", presentedBy: ["Newlife Migori Church Choir", "Newlife Church Choir"], ministry: "music" },
          // 11:29 to 11:30 is unscheduled, as on the opening Sabbath.
          { id: "sabbath-22-scripture", title: "Scripture Reading", start: "11:27", end: "11:29", presentedBy: ["Pr. Musonera Jason"] },
          { id: "sabbath-22-hymn-of-praise", title: "Hymn of Praise", start: "11:30", end: "11:35", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "sabbath-22-sermon", title: "Sermon", start: "11:35", end: "12:20", presenterIds: ["kennedy-mfune"], featured: true },
          { id: "sabbath-22-closing-hymn", title: "Closing Hymn", start: "12:20", end: "12:25", presentedBy: ["Choristers (SDAH 590)"], ministry: "music" },
          { id: "sabbath-22-benediction", title: "Benediction", start: "12:25", end: "12:30", presenterIds: ["kennedy-mfune"], ministry: "prayer" },
          { id: "sabbath-22-recessional", title: "Recessional Hymn", start: "12:30", end: "12:35", presentedBy: ["Choristers"], ministry: "music" },
        ],
      },
      {
        id: "afternoon-program",
        label: "Afternoon Program",
        sessions: [
          { id: "sabbath-22-pm-music-1", title: "Music", start: "14:00", end: "15:00", presentedBy: ["Choristers and Choirs"], ministry: "music" },
          // 15:00 to 16:00 is still unscheduled in v3. Second source to
          // print the hour empty, so it is the programme rather than a
          // transcription gap. DATA-NOTES.
          { id: "sabbath-22-hand-of-fellowship", title: "Hand of Fellowship", start: "16:00", end: "16:30", presentedBy: ["Pastoral Team"], ministry: "fellowship", featured: true },
          { id: "sabbath-22-pm-music-2", title: "Music", start: "16:30", end: "17:00", presentedBy: ["Choristers and Choirs"], ministry: "music" },
          { id: "sabbath-22-farewell", title: "Farewell / Closing Ceremony", start: "17:00", end: "18:00", presentedBy: ["Camp Chair", "Pr. Gerald Mochoge"], ministry: "fellowship", featured: true },
        ],
      },
    ],
  },
];
