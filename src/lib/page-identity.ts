import { eventInfo, program, type Speaker } from "@/data";
import {
  dayNumber,
  fullDayLabel,
  scheduleScope,
} from "@/features/schedule/lib/entries";
import { speakerLabel } from "@/features/schedule/lib/presenters";
import {
  ministryCopy,
  ministryPages,
  type MinistryPageTag,
} from "@/features/ministries/copy";
import { ministryDayGroups } from "@/features/ministries/lib";
import { speakerDayGroups } from "@/features/speakers/lib";
import { faqItems } from "@/features/faq/questions";
import { eventDateRange } from "@/lib/event-dates";
import { headerImages, type PageHeaderImage } from "@/lib/page-header-art";
import type { ProgramDay } from "@/data";

/**
 * What a page calls itself, in the three parts the share card already
 * draws: an eyebrow saying what kind of page it is, the page's own name,
 * and one line of fact under a rule.
 *
 * WHY THIS EXISTS
 * The Open Graph cards (src/lib/og.tsx) were the only place on this site
 * with a real page-header design — eyebrow, display-face title, rule, meta
 * line — while every page itself opened with a bare h1 and a paragraph.
 * Chunk 3 of the visual pass turns that card into a component both use.
 *
 * Both have to read the same strings or a link preview and the page it
 * opens start disagreeing, which is worse than either being plain. So the
 * strings live here once: the page imports them for its header, the
 * opengraph-image route imports them for its card, and pageMetadata reads
 * the title and description off the same object.
 *
 * PageDefinition carries `description` and `path` as well, so one value per
 * page drives the header, the card and the metadata. pageMetadata takes
 * `{ title, description, path }` and TypeScript allows the extra fields
 * through when a variable rather than a literal is passed, so no signature
 * had to change to make that work.
 */
export interface PageIdentity {
  /** Small uppercase line above the title: what kind of page this is. */
  eyebrow: string;
  /** The page's own name, set in the display face. */
  title: string;
  /**
   * One line under the rule: dates, venue, counts.
   *
   * OPTIONAL, and four pages leave it out. It is for a fact the title
   * does not already carry, and on those four it had drifted into
   * repeating something the reader already had:
   *
   *   /speakers    "8 presenters across the programme", above a grid of
   *                exactly those presenters
   *   /about       the church name and address, which the header lockup
   *                sets on every page and the page itself sets again
   *   /contact     the same line, on the page whose whole job is that
   *                address, with a map of it two bands below
   *   /livestream  the church name and "East Africa Time", neither of
   *                which is what a viewer opening a livestream needs
   *
   * A meta line that restates the page is worse than no meta line: it
   * teaches a reader that the line under the rule is not worth reading,
   * on the pages where it still is. /schedule, /faq, /ministries,
   * /downloads, /prayer-requests, /announcements and every day, speaker
   * and ministry page keep theirs, and each of those says something the
   * title does not.
   *
   * Both surfaces that draw a PageIdentity handle the absence the same
   * way: the rule goes with it, because a rule between a title and
   * nothing is not separating anything. See PageHeader and ogCard.
   */
  meta?: string;
}

export interface PageDefinition extends PageIdentity {
  description: string;
  /** Site-relative, for the canonical. */
  path: string;
  /**
   * The photograph behind this page's header band, where there is one.
   *
   * It lives on the definition rather than on the page, for the same
   * reason the three strings do: this module is where a page says what it
   * is, and a page that carries a picture and a page that does not is a
   * difference of that kind. The share card ignores it — `ogCard` takes
   * PageIdentity and draws the poster's plum ground, which is a decision
   * about link previews and not about this band.
   *
   * The records themselves, the crops and the scrims are in
   * src/lib/page-header-art.ts.
   */
  image?: PageHeaderImage;
}

/* The event name is the eyebrow on every page that is simply part of the
   event rather than a particular day, speaker or ministry. */
const EDITION = eventInfo.edition;
const EAT = "East Africa Time";

/** The site's default share card, and the home page's own identity. */
export const siteIdentity: PageIdentity = {
  eyebrow: eventInfo.church.name,
  title: EDITION,
  meta: `${eventDateRange()} · ${eventInfo.church.address}`,
};

export const schedulePage: PageDefinition = {
  eyebrow: EDITION,
  title: "Full programme",
  meta: `${program.length} days · ${eventDateRange()} · ${EAT}`,
  description: `Every session of ${EDITION} across all ${program.length} days, ${eventInfo.startDate} to ${eventInfo.endDate} at ${eventInfo.church.address}. Times are East Africa Time.`,
  path: "/schedule",
  image: headerImages.schedule,
};

export const speakersPage: PageDefinition = {
  eyebrow: EDITION,
  title: "Speakers",
  description: `The speakers and presenters at ${EDITION}, ${eventInfo.church.name}, with every session they are part of.`,
  path: "/speakers",
};

export const ministriesPage: PageDefinition = {
  eyebrow: EDITION,
  title: "Ministries",
  meta: `${ministryPages.length} ministries with pages of their own`,
  description: `The ministries with their own pages at ${EDITION}, and every other ministry tag searchable on the programme.`,
  path: "/ministries",
  image: headerImages.ministries,
};

export const aboutPage: PageDefinition = {
  eyebrow: EDITION,
  // The fuller form the h1 already used. The metadata title now matches it
  // rather than saying "About", because the whole point of this module is
  // that a page and its preview say the same thing.
  title: "About Camp Meeting",
  description: `What Camp Meeting is, and the details for ${EDITION} at ${eventInfo.church.name}, ${eventInfo.church.address}.`,
  path: "/about",
  image: headerImages.about,
};

export const contactPage: PageDefinition = {
  eyebrow: EDITION,
  title: "Contact",
  description: `Reach ${eventInfo.church.name}, find directions to ${eventInfo.church.address}, and giving details for ${EDITION}.`,
  path: "/contact",
  image: headerImages.contact,
};

export const faqPage: PageDefinition = {
  eyebrow: EDITION,
  // As with /about: the h1's wording wins, and the metadata title follows.
  title: "Frequently Asked Questions",
  meta: `${faqItems.length} questions answered`,
  description: `Answers to common questions about ${EDITION}: dates, venue, session times, livestream and the children's programme.`,
  path: "/faq",
  image: headerImages.faq,
};

export const downloadsPage: PageDefinition = {
  eyebrow: EDITION,
  title: "Downloads",
  meta: "The printed programme, as signed off by the committee",
  description: `The printed programme PDF for ${EDITION}.`,
  path: "/downloads",
  image: headerImages.downloads,
};

export const announcementsPage: PageDefinition = {
  eyebrow: EDITION,
  title: "Announcements",
  meta: "Programme updates and notices, newest first",
  description: `Programme updates and notices for ${EDITION}.`,
  path: "/announcements",
};

export const livestreamPage: PageDefinition = {
  eyebrow: EDITION,
  title: "Livestream",
  description: `Watch ${EDITION} live from ${eventInfo.church.name}.`,
  path: "/livestream",
  image: headerImages.livestream,
};

export const prayerRequestsPage: PageDefinition = {
  eyebrow: EDITION,
  title: "Prayer Requests",
  meta: "Read by the pastoral team, in confidence",
  description:
    "Share a prayer request with the pastoral team, by name or anonymously.",
  path: "/prayer-requests",
  image: headerImages["prayer-requests"],
};

/*
 * The three routes with a share card of their own. Each builder is the one
 * definition of that page's strings: its page reads it for the header, its
 * opengraph-image route reads it for the card, and its generateMetadata
 * reads the title and description off the same object.
 */

export function dayPageDefinition(day: ProgramDay): PageDefinition {
  const label = fullDayLabel(day);
  const { total } = scheduleScope(day.id);
  const position = dayNumber(day.id);

  return {
    eyebrow: `Day ${position} of ${program.length}`,
    title: label,
    meta: `${total} programme entries · ${EAT}`,
    description: `${total} programme entries for ${label}, day ${position} of ${program.length} at ${EDITION}, ${eventInfo.church.name}, ${eventInfo.church.address}. Times are East Africa Time.`,
    path: `/schedule/${day.id}`,
  };
}

export function speakerPageDefinition(speaker: Speaker): PageDefinition {
  const total = speakerDayGroups(speaker.id).reduce(
    (count, group) => count + group.sessions.length,
    0,
  );
  const roleText = speaker.role ? `${speaker.role} at ` : "Speaking at ";
  /* Four speakers have no session in the programme yet — see the note in
     event.ts. "0 sessions across the programme" is a true sentence that
     says the wrong thing in a link preview and in a search result, so a
     zero is described rather than counted. */
  const sessionText =
    total === 0
      ? "Sessions to be confirmed."
      : `${total} ${total === 1 ? "session" : "sessions"} across the programme.`;

  return {
    // The role is the eyebrow when there is one. "Speaker" is the honest
    // fallback for the profiles whose role the committee has not sent.
    eyebrow: speaker.role ?? "Speaker",
    title: speakerLabel(speaker),
    meta: `${EDITION} · ${eventInfo.church.name}`,
    description: `${roleText}${EDITION}, ${eventInfo.church.name}. ${sessionText}`,
    path: `/speakers/${speaker.id}`,
  };
}

export function ministryPageDefinition(tag: MinistryPageTag): PageDefinition {
  const copy = ministryCopy[tag];
  const groups = ministryDayGroups(tag);
  const count = groups.reduce((total, group) => total + group.count, 0);

  return {
    eyebrow: EDITION,
    title: copy.label,
    meta: `${eventDateRange()} · ${eventInfo.church.address}`,
    description: `${copy.description} ${count} programme ${count === 1 ? "entry" : "entries"} across ${groups.length} ${groups.length === 1 ? "day" : "days"}.`,
    path: `/ministries/${tag}`,
    /* Three of the four ministry pages have a photograph. `children` does
       not, because no artwork was supplied for it, and the lookup is
       written to return undefined rather than to be told about that: the
       band falls back to its flat muted surface and reads as it always
       has. Do not pick a stand-in picture for it — a children's ministry
       page illustrated with somebody else's stock photograph is worse
       than one with no picture at all. */
    image: (headerImages as Partial<Record<MinistryPageTag, PageHeaderImage>>)[tag],
  };
}
