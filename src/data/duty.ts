import type { DayDuty } from "./types";

/**
 * ── WHO IS ON DUTY, DAY BY DAY ───────────────────────────────────────
 *
 * Four sources, and they agree more than they disagree:
 *
 *   1. The near-final programme PDF. Each weekday page carries a table at
 *      its foot — Choristers, Deaconry, Coordinating Elders — split
 *      Morning and Afternoon. This is the spine.
 *   2. `Diaconete.txt`, the diaconate's own rota. Every name in the
 *      programme's Deaconry column appears in it labelled Deacon or
 *      Deaconess, which is what makes the split below possible: **every
 *      name resolves, on every day, so nothing falls back to a combined
 *      "Deaconry" heading.**
 *   3. `choristers-program`, which additionally gives each chorister's
 *      voice part (Soprano, Alto, Tenor, Bass) and confirms both Sabbaths
 *      as "ALL NEWLIFE CHORISTERS". The voice parts are not carried here:
 *      the panel's question is who is on, and a part next to each name
 *      would double the width of the longest column at 320px for
 *      information nobody is reading the panel to find.
 *   4. `elders-program.docx`, the elders' rota, which is the ONLY source
 *      that covers all eight days — the programme prints no table on
 *      either Sabbath.
 *
 * ── THE RULE WHERE THEY DISAGREE ─────────────────────────────────────
 *
 * The programme PDF's own day table wins on which shift someone is on.
 * Where the programme prints NO row for a shift — Sunday morning, Friday
 * afternoon, and both Sabbaths, which have no table at all — the other
 * three fill it. Every disagreement is listed in DATA-NOTES.md rather
 * than quietly resolved; the two that matter are that the elders' rota
 * splits Sunday's and Friday's pairs across Morning and Afternoon where
 * the programme prints both on one row.
 *
 * ── THE TWO SABBATHS ─────────────────────────────────────────────────
 *
 * Neither has a duty table. `Diaconete.txt` says "SABBATH 15th / All-
 * Deacons and Deaconesses" and "SABBATH 22nd CAMPMEETING HIGH SABBATH-
 * ALL Deacons and deaconesses", and the choristers' rota says "ALL
 * NEWLIFE CHORISTERS" for both. That is an answer, not an absence, so
 * `allOnDuty` carries it and the panel prints it rather than an empty
 * table. The elders are named, from their own rota, and the programme
 * corroborates both: Eld. Robert Nyarango gives the opening Sabbath's
 * announcements and Eld. Paul Momanyi the closing Sabbath's, which is
 * each morning's coordinator in each case.
 *
 * Spellings are the programme's where it and another source differ. The
 * six places they do are in DATA-NOTES.md.
 */
export const duty: DayDuty[] = [
  {
    dayId: "sabbath-15",
    note: "No duty table is printed for the Sabbaths.",
    shifts: [
      {
        shift: "Morning",
        elders: ["Eld. Robert Nyarango"],
        deacons: [],
        deaconesses: [],
        choristers: [],
        allOnDuty: ["deacons", "deaconesses", "choristers"],
      },
      {
        shift: "Afternoon",
        elders: ["Eld. Sylvester Odhiambo"],
        deacons: [],
        deaconesses: [],
        choristers: [],
        allOnDuty: ["deacons", "deaconesses", "choristers"],
      },
    ],
  },
  {
    dayId: "sunday-16",
    // One shift, not two. The programme's table, the diaconate's rota
    // ("SUNDAY 16th-2PM") and the choristers' rota all give Sunday an
    // afternoon and nothing else; the morning is the Medical Camp. The
    // elders' rota does split its pair across the two — DATA-NOTES.
    note: "The morning is the Medical Camp. The duty rota starts at 2pm.",
    shifts: [
      {
        shift: "Afternoon",
        elders: ["Eld. Erick Ayieko", "Eld. Salmon Osare"],
        deacons: ["Antony Kodiwo", "Edward Odongo", "Collins Okwado"],
        deaconesses: ["Lois Mose", "Scoller Opiyo", "Rael Ongeri", "Irene Tai"],
        choristers: [
          "Becky Nyakundi",
          "Tina Odhiambo",
          "Maxwell Omondi",
          "Joshua Okwoyo",
        ],
      },
    ],
  },
  {
    dayId: "monday-17",
    shifts: [
      {
        shift: "Morning",
        elders: ["Eld. John Kitoto"],
        deacons: ["Johnson Ogendi", "Stanley Kyalo", "Wallace Amayo"],
        deaconesses: [
          "Nancy Odhiambo",
          "Melonet Ongeche",
          "Florence Otondo",
          "Susan Mulei",
        ],
        choristers: [
          "Natalie Wanga",
          "Betty Okombo",
          "Levin Omuga",
          "Rodgers Marena",
        ],
      },
      {
        shift: "Afternoon",
        elders: ["Eld. Tom Akungu"],
        deacons: ["Caleb Nyaribo", "Antony Kodiwo"],
        deaconesses: [
          "Maureen Onyango",
          "Melonet Ongeche",
          "Catherine Angwenyi",
          "Lilian Ratego",
        ],
        choristers: [
          "Anne Okemwa",
          "Kris Onguru",
          "Brolyne Ochieng",
          "Neackol Amayo",
        ],
      },
    ],
  },
  {
    dayId: "tuesday-18",
    shifts: [
      {
        shift: "Morning",
        elders: ["Eld. Mark Rotich"],
        deacons: [
          "Antony Kodiwo",
          "Wallace Amayo",
          "Collins Okwado",
          "Momanyi Mogaka",
        ],
        deaconesses: [
          "Nancy Odhiambo",
          "Phanice Omae",
          "Melonet Ongeche",
          "Jaqui Mwango",
          "Rael Ongeri",
        ],
        choristers: [
          "Roselyne Omollo",
          "Sarah Oswago",
          "Chadwick Osare",
          "Gilbert Were",
        ],
      },
      {
        shift: "Afternoon",
        elders: ["Eld. Evans Isaboke"],
        deacons: ["Fred Opande", "Johnson Ogendi"],
        deaconesses: [
          "Rose Okoth",
          "Mercy Odiwuor",
          "Dawner Treazy",
          "Becky Munyi",
        ],
        choristers: [
          "Everlyne Lelei",
          "Jessica Isiaho",
          "Lenin Were",
          "Usher Ray",
        ],
      },
    ],
  },
  {
    dayId: "wednesday-19",
    shifts: [
      {
        shift: "Morning",
        elders: ["Eld. Wesley Nyariki"],
        deacons: ["John Dianga", "Fred Opande"],
        deaconesses: ["Syprose Omondi", "Merolyne Omae", "Phanice Mwango"],
        choristers: [
          "Amalda Ruto",
          "Laura Otieno",
          "Maxwell Omondi",
          "Joshua Okari",
        ],
      },
      {
        shift: "Afternoon",
        elders: ["Eld. Teddy Onyango"],
        deacons: ["John Dianga", "Justus Gekone"],
        deaconesses: [
          "Olga Nyakongo",
          "Nancy Ogutu",
          "Dawner Treazy",
          "Sharon Odhiambo",
        ],
        choristers: [
          "Agnes Maureene",
          "Natalie Adhiambo",
          "Michael Ouru",
          "Joshua Okari",
        ],
      },
    ],
  },
  {
    dayId: "thursday-20",
    shifts: [
      {
        shift: "Morning",
        elders: ["Eld. Opere Nyaroya"],
        deacons: [
          "Moses Dooso",
          "Wallace Amayo",
          "Robert Mosomi",
          "Momanyi Mogaka",
        ],
        deaconesses: [
          "Beatrice Ombewa",
          "Melonet Ongeche",
          "Nancy Odhiambo",
          "Irene Tai",
        ],
        choristers: [
          "Celene Natalie",
          "Loice Moraa",
          "Godwin Otieno",
          "Owen Okwani",
        ],
      },
      {
        shift: "Afternoon",
        elders: ["Eld. Jason Nyantino"],
        deacons: [
          "Fredrick Omondi",
          "Robert Okari",
          "Momanyi Mogaka",
          "Robert Mosomi",
        ],
        deaconesses: [
          "Nancy Odhiambo",
          "Scholastica Ongok",
          "Sharon Odhiambo",
          "Petrigona Ratemo",
        ],
        choristers: [
          "Donnah Achieng",
          "Joy Alai",
          "Phanuel Marire",
          "Rodgers Marena",
        ],
      },
    ],
  },
  {
    dayId: "friday-21",
    shifts: [
      {
        shift: "Morning",
        // Both elders are on the programme's Morning row. The elders'
        // own rota splits them, Jared Manyara morning and Cosmas Makori
        // afternoon. DATA-NOTES.
        elders: ["Eld. Jared Manyara", "Eld. Cosmas Makori"],
        deacons: ["Moses Dooso", "Wallace Amayo"],
        deaconesses: ["Nancy Odhiambo", "Josephine Kitoto"],
        choristers: [
          "Maureen Ongala",
          "Sheenaz Yogo",
          "Wicklif Oduo",
          "Maurice Ongala",
        ],
      },
      {
        // The programme prints no afternoon row for Friday, because the
        // afternoon is Sabbath Preparation. The diaconate's rota does:
        // "2PM-6PM / SABBATH PREPARATION-ALL / Deacons and deaconesses".
        shift: "Afternoon",
        elders: [],
        deacons: [],
        deaconesses: [],
        choristers: [],
        allOnDuty: ["deacons", "deaconesses"],
        note: "Sabbath preparation.",
      },
    ],
  },
  {
    dayId: "sabbath-22",
    note: "No duty table is printed for the Sabbaths. This is the camp meeting high Sabbath.",
    shifts: [
      {
        shift: "Morning",
        elders: ["Eld. Paul Momanyi"],
        deacons: [],
        deaconesses: [],
        choristers: [],
        allOnDuty: ["deacons", "deaconesses", "choristers"],
      },
      {
        shift: "Afternoon",
        elders: ["Eld. Stephen Karori"],
        deacons: [],
        deaconesses: [],
        choristers: [],
        allOnDuty: ["deacons", "deaconesses", "choristers"],
      },
    ],
  },
];

export const dutyByDayId: Record<string, DayDuty> = Object.fromEntries(
  duty.map((day) => [day.dayId, day]),
);
