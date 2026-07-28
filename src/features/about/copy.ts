export interface AboutSection {
  heading: string;
  paragraphs: string[];
}

/**
 * Copy for /about, kept out of the JSX so the committee can revise the
 * wording without touching the component. Sticks to what is already
 * confirmed (dates, venue, host church from event.ts) and a general,
 * denomination-wide description of what a camp meeting is. Nothing here
 * asserts church history, attendance figures or a theme — those are
 * still open items (see CLAUDE.md, DATA-NOTES.md) and stay out until
 * the committee confirms them.
 */
export const aboutSections: AboutSection[] = [
  {
    heading: "What is Camp Meeting?",
    paragraphs: [
      "Camp Meeting is a tradition within the Seventh-day Adventist Church: a week set aside for the whole congregation, and visitors from other churches, to gather for extended worship, Bible teaching, prayer and fellowship away from the pace of ordinary life.",
      "The programme runs from early morning to evening each day, with dedicated tracks for children and space for personal reflection alongside the shared services.",
    ],
  },
  {
    heading: "This year",
    paragraphs: [
      "Camp Meeting 2026 runs for eight days, hosted by Newlife Seventh-day Adventist Church. The full day-by-day programme is on the Schedule page.",
    ],
  },
  {
    heading: "The host church",
    paragraphs: [
      "Newlife Seventh-day Adventist Church is located on 5th Ngong Avenue, Nairobi. This site is a companion to Camp Meeting 2026 and is kept separate from the church's main site, which has its own news and ministry pages.",
    ],
  },
];
