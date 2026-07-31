import { eventInfo, program } from "@/data";
import { ministryCopy, ministryPages } from "@/features/ministries/copy";
import { eventDateRange } from "@/lib/event-dates";

export interface AboutSection {
  heading: string;
  paragraphs: string[];
  /** One outbound link under the paragraphs, where the page should point
   *  somewhere rather than restate what is written there. */
  link?: { label: string; href: string; external?: boolean };
}

/**
 * Copy for /about, kept out of the JSX so the committee can revise the
 * wording without touching the component.
 *
 * ── The rule this file follows ────────────────────────────────────────
 *
 * Everything here is either (a) derived from src/data, or (b) written in
 * plain language about things we can observe ourselves. Nothing is
 * reproduced from adventist.org or from newlifesdanairobi.org.
 *
 * That is a copyright line and a doctrinal one at once. The Fundamental
 * Beliefs, the church's statements of belief and its official history are
 * the denomination's text, not ours to paste, and doctrine on a church's
 * own site has to come from the church rather than from whoever built the
 * site. Where the page would be better for a doctrinal or historical
 * statement, there is a TODO below naming what the committee needs to
 * supply, and the section stays OUT of the rendered page until they do.
 * A placeholder in its place would be worse than the gap.
 *
 * Facts that live in src/data are read from it rather than typed out, so
 * a programme change cannot leave this page describing last year's shape.
 */

/* ── Derived from the programme ──────────────────────────────────────── */

const dayCount = program.length;

/** Every distinct block label in the programme, in the order they appear. */
const blockLabels = [
  ...new Set(program.flatMap((day) => day.blocks.map((block) => block.label))),
];

/** The earliest start and the latest end anywhere in the programme. */
const allTimes = program.flatMap((day) =>
  day.blocks.flatMap((block) =>
    block.sessions.flatMap((session) =>
      [session.start, session.end].filter((t): t is string => Boolean(t)),
    ),
  ),
);
const earliestStart = allTimes.reduce((a, b) => (a < b ? a : b));
const latestEnd = allTimes.reduce((a, b) => (a > b ? a : b));

/** The ministries with a page of their own, as a readable list. */
const trackList = ministryPages
  .map((tag) => ministryCopy[tag].label)
  .reduce(
    (text, label, index, all) =>
      index === 0
        ? label
        : index === all.length - 1
          ? `${text} and ${label}`
          : `${text}, ${label}`,
    "",
  );

const hasUntimedBlock = program.some((day) =>
  day.blocks.some((block) => block.allBlockActivity),
);

/* ── The page ────────────────────────────────────────────────────────── */

export const aboutSections: AboutSection[] = [
  {
    heading: "What is Camp Meeting?",
    paragraphs: [
      "Camp meeting is a long-standing practice in Seventh-day Adventist life: a congregation sets aside a run of consecutive days and gives them over to worship, Bible teaching, prayer and being together, at a pace ordinary weeks do not allow. It is not a conference and not a retreat. The nearest description is a week of church, held in daylight and in company.",
      "What makes it different from a normal week of services is duration and repetition. The same people come back morning after morning, the teaching builds across days rather than resetting each Sabbath, and there is time in the programme for the parts of church life that a single service has to leave out.",
      "The wider denomination keeps its own account of the practice and of what Adventists believe. That is theirs to state, not ours to summarise, so this page points at it rather than paraphrasing it.",
    ],
    link: {
      label: "The Seventh-day Adventist Church",
      href: "https://www.adventist.org",
      external: true,
    },
  },
  {
    heading: "The shape of a day",
    paragraphs: [
      `Most days follow the same arc. They open at ${earliestStart} with prayer and morning devotion, then Bible study while the day is still quiet. The morning builds through teaching towards the main service late in the morning, which is the service most people plan their day around.`,
      "The afternoon is where the ministries take their turn: health, family life, and the sessions that speak to a particular part of church life rather than to everyone at once. The day closes with the evening service, which has the same shape as the mid-morning one and its own sermon.",
      `The last session ends at ${latestEnd}. Not every day is the full arc: the opening and closing Sabbaths keep the Divine Service in place of the mid-morning one, and Friday stops at midday because the afternoon and evening are Sabbath preparation.`,
    ],
    link: { label: "See the full programme", href: "/schedule" },
  },
  {
    heading: "Who it is for",
    paragraphs: [
      "Everyone in the congregation, and visitors from other churches. There is no registration and nothing to book. The programme is built so that someone who can only come for an evening still arrives at a whole service rather than the middle of one.",
      `Alongside the services, four ministries run tracks of their own across the week: ${trackList}. Children have their own Children's Corner in the mid-morning and evening services as well. Every other ministry in the programme is searchable on the schedule page, filtered by ministry.`,
    ],
    link: { label: "Ministries at Camp Meeting", href: "/ministries" },
  },
  {
    heading: "Practical notes",
    paragraphs: [
      `Camp Meeting ${eventInfo.year} runs ${eventDateRange()}, ${dayCount} days, hosted by ${eventInfo.church.name} at ${eventInfo.church.address}.`,
      `Every time on this site is East Africa Time, the wall clock in Nairobi, whatever time zone you are reading in. Each day is grouped into named blocks (${blockLabels.slice(0, 3).join(", ")} and the rest), and the schedule marks whichever session is running as you read it.`,
      hasUntimedBlock
        ? "A few activities in the printed programme have no published start time and run for a whole block instead. They are shown in place, marked as having no set time, rather than being given times we do not have."
        : "",
      "For anyone who cannot be in the building, the livestream page carries the player and what is on now.",
    ].filter(Boolean),
    link: { label: "Watch the livestream", href: "/livestream" },
  },
  {
    heading: "The host church",
    paragraphs: [
      `${eventInfo.church.name} is on ${eventInfo.church.address}. This site is a companion to Camp Meeting ${eventInfo.year} and is kept separate from the church's main site, which carries its own news, ministry pages and weekly bulletin.`,
    ],
    link: {
      label: eventInfo.church.website.replace(/^https?:\/\/(www\.)?/, ""),
      href: eventInfo.church.website,
      external: true,
    },
  },
];

/*
 * ── TODO(committee): sections deliberately NOT rendered ───────────────
 *
 * Each of these needs text supplied by the church. They are not in
 * aboutSections above, so the page ships without them rather than with a
 * placeholder standing where a doctrinal statement should be.
 *
 * 1. THE THEME FOR 2026. The hero has no theme line for the same reason.
 *    The main site shows "The Good News in the Great Controversy" in a
 *    pastor's letter, but that letter references February dates and a
 *    different pastor, so it may be stale. Needed: the confirmed theme
 *    text for August 2026, and whether it should appear on this page as
 *    well as the hero.
 *
 * 2. WHAT THIS CHURCH BELIEVES, and the place camp meeting holds in it.
 *    The paragraph above describes the practice in ordinary language on
 *    purpose and stops short of doctrine. Needed: a short statement in
 *    the church's own words, or a decision to link out to the
 *    denomination's statement of beliefs and write nothing here. Do not
 *    paste the Fundamental Beliefs into this file; that is the
 *    denomination's copyrighted text.
 *
 * 3. THE HISTORY OF CAMP MEETING AT NEWLIFE. How long the church has held
 *    it, what has changed, anything worth a visitor knowing. Nothing on
 *    this is sourceable from the material we have, and inventing a
 *    founding year for a church is not a small error.
 *
 * 4. WHO TO ASK ON THE DAY. Whether there is a desk, a coordinator, or a
 *    number to call during the week that is not the church office line.
 *    The practical notes section stops at the streaming line because that
 *    is where verified information stops.
 */
