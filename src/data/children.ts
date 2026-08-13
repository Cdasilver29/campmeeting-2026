import type { ChildrenProgram } from "./types";

/**
 * ── THE CHILDREN'S MINISTRY PROGRAMME ────────────────────────────────
 *
 * Transcribed from `children-program`, the committee's own sheet:
 * "NEWLIFE SDA CHURCH, 2026 CHILDREN MINISTRY CAMP MEETING SCHEDULE".
 * Three tables, and all three are here rather than in JSX.
 *
 *   1. `timetable`  the day, Monday to Friday. One shape for all five;
 *                   the sheet gives no per-day variation.
 *   2. `bands`      who teaches which class, and where. The sheet's
 *                   widest table.
 *   3. `coordinators`
 *
 * ── WHAT THE SHEET DOES NOT SAY ──────────────────────────────────────
 *
 * It covers **Monday to Friday only**. Neither Sabbath and not Sunday, and
 * nothing on it says what happens on those three days. The main programme
 * does: the Children's Corner runs inside the church on all seven days
 * that have one, and both Sabbaths have a Children Sermon. So the page
 * says Monday to Friday and links to the programme for the rest rather
 * than implying this is the whole week.
 *
 * ── TIMES ────────────────────────────────────────────────────────────
 *
 * 24h, like the rest of the data. The sheet writes them 12h with
 * inconsistent spacing ("11: 05 am – 12:45 pm", "03:05 pm – 03:55pm").
 *
 * ── NAMES ────────────────────────────────────────────────────────────
 *
 * As printed, honorific and all. "Tr." is a teacher, "Eld." an elder;
 * three names carry no honorific where their partner in the same cell
 * does, and that is the sheet's own inconsistency rather than a
 * transcription slip. Two things in it are open and both are in
 * DATA-NOTES: "Tr. Wnnie Zeph" and the trailing slash after
 * "Tr. Violet Mwango".
 */

const ASSIGNED = "Assigned Teachers";
const ALLAN = "allan-okoth";

export const childrenProgram: ChildrenProgram = {
  /**
   * The day, in programme order.
   *
   * The three services are the same three the main programme carries —
   * the morning devotion and the Children's Corner inside the church at
   * the mid-morning and evening services — and Tr. Allan Okoth leads all
   * three there too. He is credited by `presenterId` rather than as free
   * text so those rows link to his profile, which is the same person the
   * main programme means.
   *
   * The four sessions that say "Assigned Teachers" are the four the class
   * table names, and each carries a note pointing at it. Without that the
   * page would print "Assigned Teachers" four times and answer nobody's
   * question.
   */
  timetable: [
    {
      id: "children-arrival",
      title: "Arrival and Settling",
      start: "07:30",
      end: "08:00",
    },
    {
      id: "children-prayer",
      title: "Prayer Session",
      start: "08:00",
      end: "08:15",
      presentedBy: ["Tr. Eunice Ojuok"],
      ministry: "prayer",
    },
    {
      id: "children-devotion",
      title: "Morning Devotion",
      start: "08:15",
      end: "08:30",
      presenterIds: [ALLAN],
      ministry: "prayer",
    },
    {
      id: "children-singing-am",
      title: "Singing Session",
      start: "08:30",
      end: "09:15",
      presentedBy: ["Tr. Becky Opere", "Tr. Natalie Wanga"],
      ministry: "music",
    },
    {
      id: "children-bible",
      title: "Bible Session",
      start: "09:20",
      end: "10:05",
      presentedBy: [ASSIGNED],
      ministry: "bible-study",
      note: "Taught per class. See the classes and teachers below.",
    },
    {
      id: "children-craft",
      title: "Bible Craft Session / Self Reflection Q&A Session",
      start: "10:05",
      end: "10:30",
      presentedBy: [ASSIGNED],
      note: "Taught per class. See the classes and teachers below.",
    },
    {
      id: "children-break-am",
      title: "Health Break",
      start: "10:35",
      end: "11:00",
    },
    {
      id: "children-divine",
      title: "Divine Service",
      subtitle: "Inside church, Children's Corner",
      start: "11:05",
      end: "12:45",
      presenterIds: [ALLAN],
      ministry: "worship",
    },
    {
      id: "children-break-pm",
      title: "Health Break",
      start: "12:50",
      end: "13:50",
    },
    {
      id: "children-singing-pm",
      title: "Singing Session",
      start: "14:00",
      end: "15:00",
      presentedBy: ["Tr. Becky Opere", "Tr. Natalie Wanga"],
      ministry: "music",
    },
    {
      id: "children-stewardship",
      title: "Stewardship Session",
      start: "15:05",
      end: "15:55",
      presentedBy: [ASSIGNED],
      ministry: "stewardship",
      note: "Taught per class. See the classes and teachers below.",
    },
    {
      id: "children-application",
      title: "Application, Q&A Session",
      start: "16:00",
      end: "16:20",
      presentedBy: [ASSIGNED],
      note: "Taught per class. See the classes and teachers below.",
    },
    {
      id: "children-evening",
      title: "Evening Service",
      subtitle: "Inside church, Children's Corner",
      start: "16:30",
      end: "18:15",
      presenterIds: [ALLAN],
      ministry: "worship",
    },
  ],

  /**
   * The classes, in the sheet's own five bands and its own order —
   * oldest first, down to the nursery.
   *
   * ── THE MERGED CELLS ARE REAL AND ARE KEPT ───────────────────────
   *
   * The sheet merges cells in two directions and both mean something:
   *
   *   every class   Stewardship and Application, Q&A are ONE cell. The
   *                 same teachers take both afternoon sessions, so the
   *                 slot below spans 15:05 to 16:20 rather than being
   *                 split into two identical rows.
   *   13-14 and 0-3 Bible and Craft are one cell too. The oldest class
   *                 and the nursery each keep one set of teachers all
   *                 morning where the nine classes between them hand
   *                 over at 10:05.
   *
   * `slots` is therefore three entries for most classes and two for
   * those two, rather than a fixed four with duplicates in it.
   */
  bands: [
    {
      label: "Realtime Class",
      classes: [
        {
          id: "realtime-13-14",
          ages: "13-14 Years Old",
          venue: "Tent A",
          slots: [
            {
              session: "Bible, Craft and Q&A",
              time: "09:20–10:30",
              teachers: ["Eld. Jared Manyara", "Tr. Beatrice Ombewa (et al)"],
            },
            {
              session: "Stewardship, Application and Q&A",
              time: "15:05–16:20",
              teachers: ["Tr. Victor Okoth", "Tr. Zilpha Lilian (et al)"],
            },
          ],
        },
      ],
    },
    {
      label: "Powerpoint Class",
      classes: [
        {
          id: "powerpoint-12",
          ages: "12 Years Old",
          venue: "Tent B",
          slots: [
            {
              session: "Bible",
              time: "09:20–10:05",
              teachers: ["Eld. Emmanuel Otieno"],
            },
            {
              session: "Craft / Q&A",
              time: "10:05–10:30",
              teachers: ["Tr. Jack Mogaka", "Tr. Shaquille"],
            },
            {
              session: "Stewardship, Application and Q&A",
              time: "15:05–16:20",
              teachers: ["Tr. Odipo Ogolla", "Tr. Nancy Marisa"],
            },
          ],
        },
        {
          id: "powerpoint-11",
          ages: "11 Years Old",
          venue: "Tent C",
          slots: [
            {
              session: "Bible",
              time: "09:20–10:05",
              teachers: ["Tr. Alice Okoth"],
            },
            {
              session: "Craft / Q&A",
              time: "10:05–10:30",
              teachers: ["Tr. Olga Nyakongo", "Tr. Adasah"],
            },
            {
              session: "Stewardship, Application and Q&A",
              time: "15:05–16:20",
              teachers: ["Tr. Ken Auma", "Tr. Jeremiah Salim"],
            },
          ],
        },
        {
          id: "powerpoint-10",
          ages: "10 Years Old",
          venue: "10 yrs Class",
          slots: [
            {
              session: "Bible",
              time: "09:20–10:05",
              teachers: ["Tr. Constance Onyikachi"],
            },
            {
              session: "Craft / Q&A",
              time: "10:05–10:30",
              teachers: ["Tr. Phanice Omae"],
            },
            {
              session: "Stewardship, Application and Q&A",
              time: "15:05–16:20",
              teachers: ["Tr. Elizabeth Ochieng", "Tr. Alice Bonareri"],
            },
          ],
        },
      ],
    },
    {
      label: "Primary Class",
      classes: [
        {
          id: "primary-9",
          ages: "9 Years Old",
          venue: "9 yrs Class",
          slots: [
            {
              session: "Bible",
              time: "09:20–10:05",
              teachers: ["Tr. Allan Okoth", "Tr. Zena Atieno"],
            },
            {
              session: "Craft / Q&A",
              time: "10:05–10:30",
              teachers: ["Tr. Charity Wakio"],
            },
            {
              session: "Stewardship, Application and Q&A",
              time: "15:05–16:20",
              // As printed, honorific on the first name only.
              teachers: ["Tr. Nyakoboke Oirere", "Esinah Omariba"],
            },
          ],
        },
        {
          id: "primary-8",
          ages: "8 Years Old",
          venue: "8 yrs Class",
          slots: [
            {
              session: "Bible",
              time: "09:20–10:05",
              teachers: ["Tr. Michael Ouru"],
            },
            {
              session: "Craft / Q&A",
              time: "10:05–10:30",
              // "Wnnie" as printed. Probably Winnie — DATA-NOTES.
              teachers: ["Tr. Wnnie Zeph"],
            },
            {
              session: "Stewardship, Application and Q&A",
              time: "15:05–16:20",
              teachers: ["Tr. Eunice Bolo", "Elizabeth Salim"],
            },
          ],
        },
        {
          id: "primary-7",
          ages: "7 Years Old",
          venue: "7 yrs Class",
          slots: [
            {
              session: "Bible",
              time: "09:20–10:05",
              teachers: ["Tr. Felix Okumu"],
            },
            {
              session: "Craft / Q&A",
              time: "10:05–10:30",
              teachers: ["Tr. Mary Moreno"],
            },
            {
              session: "Stewardship, Application and Q&A",
              time: "15:05–16:20",
              teachers: ["Tr. Juddy Munga", "Niger Omwanza"],
            },
          ],
        },
      ],
    },
    {
      label: "Kindergarten Class",
      classes: [
        {
          id: "kindergarten-6",
          ages: "6 Years Old",
          venue: "6 yrs Class",
          slots: [
            {
              session: "Bible",
              time: "09:20–10:05",
              teachers: ["Tr. Stanley Kyalo"],
            },
            {
              session: "Craft / Q&A",
              time: "10:05–10:30",
              teachers: ["Tr. Peter Thaitinga"],
            },
            {
              session: "Stewardship, Application and Q&A",
              time: "15:05–16:20",
              teachers: ["Tr. Floryn Kwamboka"],
            },
          ],
        },
        {
          id: "kindergarten-5",
          ages: "5 Years Old",
          venue: "5 yrs Class",
          slots: [
            {
              session: "Bible",
              time: "09:20–10:05",
              teachers: ["Tr. Mercy Okello"],
            },
            {
              session: "Craft / Q&A",
              time: "10:05–10:30",
              // "Elknah" as printed. Probably Elkanah — DATA-NOTES.
              teachers: ["Tr. Elknah Nyakundi"],
            },
            {
              session: "Stewardship, Application and Q&A",
              time: "15:05–16:20",
              teachers: ["Eld. Godwin Ouma"],
            },
          ],
        },
        {
          id: "kindergarten-4",
          ages: "4 Years Old",
          venue: "4 yrs Class",
          slots: [
            {
              session: "Bible",
              time: "09:20–10:05",
              teachers: ["Tr. Roy Oriema (Aggrey)"],
            },
            {
              session: "Craft / Q&A",
              time: "10:05–10:30",
              teachers: ["Tr. Ann Gathu"],
            },
            {
              session: "Stewardship, Application and Q&A",
              time: "15:05–16:20",
              teachers: ["Tr. Irene Omondi"],
            },
          ],
        },
      ],
    },
    {
      label: "Baby Steps and Beginners Class",
      classes: [
        {
          id: "baby-steps-0-3",
          ages: "0-3 Years Old",
          venue: "Devotion Tent",
          slots: [
            {
              session: "Bible, Craft and Q&A",
              time: "09:20–10:30",
              teachers: ["Tr. Mildred Juma", "Tr. Elvina Kodiwo"],
            },
            {
              session: "Stewardship, Application and Q&A",
              time: "15:05–16:20",
              // The sheet prints "Tr. Violet Mwango /" with a trailing
              // slash and no second name. A partner is missing rather
              // than absent, and no name was invented. DATA-NOTES.
              teachers: ["Tr. Violet Mwango"],
            },
          ],
        },
      ],
    },
  ],

  coordinators: [
    { role: "Overall", people: "CM Executive and all the Class Lead Teachers" },
    {
      role: "Medical personnel",
      people: "Tr. Phyllis Ngala, Tr. Sandra Kirimi and Tr. Carol Mboya",
    },
    {
      role: "Hospitality",
      people:
        "Tr/s. Sandra Kirimi, Zipporah Mayaka, Jack Mogaka, and Tr. Olga Nyakongo",
    },
    { role: "Timekeepers", people: "Tr. Ben Carson / Tr. Jack Mogaka" },
  ],
};
