import {
  eventInfo,
  program,
  speakerById,
  type ProgramBlock,
  type ProgramDay,
  type Session,
} from "@/data";
import { toInstant } from "@/features/schedule/lib/time";
import { dayPath } from "@/features/schedule/lib/url";
import { absoluteUrl } from "./site-url";

/**
 * schema.org Event data, generated from eventInfo and program.
 *
 * Nothing here is written by hand: a programme update changes the JSON-LD
 * the same way it changes the pages. Times are the programme's own
 * Africa/Nairobi wall clock with the zone offset attached, so a search
 * result shows a reader in London the right local time for a service in
 * Nairobi.
 */

type JsonLd = Record<string, unknown>;

/**
 * "2026-08-15" + "09:00" -> "2026-08-15T09:00:00+03:00".
 *
 * The offset is measured rather than assumed: toInstant already knows how
 * to turn event-local wall clock into an absolute instant, so the gap
 * between the two is the offset in force on that date. Africa/Nairobi has
 * never had DST, but nothing here depends on that staying true.
 */
export function eventLocalIso(date: string, time: string): string {
  const instant = toInstant(date, time);
  const [year = 1970, month = 1, day = 1] = date.split("-").map(Number);
  const [hour = 0, minute = 0] = time.split(":").map(Number);
  const offsetMinutes =
    (Date.UTC(year, month - 1, day, hour, minute) - instant.getTime()) / 60_000;

  const sign = offsetMinutes < 0 ? "-" : "+";
  const absolute = Math.abs(offsetMinutes);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date}T${time}:00${sign}${pad(Math.floor(absolute / 60))}:${pad(absolute % 60)}`;
}

/**
 * The venue and the organiser are the same for every one of the ~250
 * entries in the programme, so each is written out once per document and
 * referred to by @id after that. Spelled out each time, a single day page
 * carried 20 KB of repeated address; this is the same graph in a third of
 * the bytes, on a site whose whole point is one bar of signal.
 */
const VENUE_ID = absoluteUrl("/#venue");
const ORGANIZER_ID = absoluteUrl("/#organizer");

const place: JsonLd = {
  "@type": "Place",
  "@id": VENUE_ID,
  name: eventInfo.church.name,
  address: {
    "@type": "PostalAddress",
    streetAddress: eventInfo.church.address,
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
};

const placeRef: JsonLd = { "@id": VENUE_ID };

/**
 * The week is livestreamed, which is what makes the camp meeting and each
 * of its days a mixed-attendance event rather than an in-person one. The
 * individual sessions carry only the building: the stream is a property
 * of the event as a whole, not something each session opts into.
 */
const VIRTUAL_ID = absoluteUrl("/#livestream");

const virtualLocation: JsonLd = {
  "@type": "VirtualLocation",
  "@id": VIRTUAL_ID,
  url: absoluteUrl("/livestream"),
};

const virtualRef: JsonLd = { "@id": VIRTUAL_ID };

/** Venue and stream, spelled out at the document root and referenced below it. */
function locations(root: boolean): JsonLd[] {
  return root ? [place, virtualLocation] : [placeRef, virtualRef];
}

const organizer: JsonLd = {
  "@type": "Organization",
  "@id": ORGANIZER_ID,
  name: eventInfo.church.name,
  url: eventInfo.church.website,
  telephone: eventInfo.contact.phone,
  email: eventInfo.contact.email,
};

const organizerRef: JsonLd = { "@id": ORGANIZER_ID };

/** The clock span of a day, from its own timed sessions. */
function dayBounds(day: ProgramDay): { start?: string; end?: string } {
  const sessions = day.blocks.flatMap((block) => block.sessions);
  const start = sessions
    .map((session) => session.start)
    .filter((value): value is string => Boolean(value))
    .sort()[0];
  const end = sessions
    .map((session) => session.end)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);
  return { start, end };
}

/**
 * Everyone credited with a session. Named speakers become People; choirs
 * and other groups credited only as free text become PerformingGroups,
 * which is what they are. A session with neither gets no performer rather
 * than an invented one.
 */
function performers(session: Session): JsonLd[] {
  const people = (session.presenterIds ?? [])
    .map((id) => speakerById[id])
    .filter((speaker) => speaker !== undefined)
    .map((speaker) => ({
      "@type": "Person",
      name: speaker.title ? `${speaker.title} ${speaker.name}` : speaker.name,
      url: absoluteUrl(`/speakers/${speaker.id}`),
    }));

  const groups = (session.presentedBy ?? []).map((name) => ({
    "@type": "PerformingGroup",
    name,
  }));

  return [...people, ...groups];
}

function sessionEvent(day: ProgramDay, session: Session): JsonLd {
  const performer = performers(session);

  return {
    "@type": "Event",
    name: session.title,
    // A session the programme gives no clock time to is dated but not
    // timed. schema.org accepts a bare date, which is honest; inventing a
    // start would put a time in a search result that the printed
    // programme does not have.
    startDate: session.start
      ? eventLocalIso(day.date, session.start)
      : day.date,
    ...(session.end ? { endDate: eventLocalIso(day.date, session.end) } : {}),
    // No eventStatus or eventAttendanceMode here. Both are optional, both
    // would be the same value on all ~250 entries in the programme, and
    // repeating them added around 9 KB to a single day page.
    location: placeRef,
    ...(performer.length > 0 ? { performer } : {}),
    ...(session.note ? { description: session.note } : {}),
  };
}

/**
 * An all-block activity — Sunday's Medical Camp, Friday's Sabbath
 * Preparation — is a real part of the programme with no times of its own,
 * so it is listed against the day rather than dropped.
 */
function allBlockEvent(day: ProgramDay, block: ProgramBlock): JsonLd | undefined {
  const activity = block.allBlockActivity;
  if (!activity) return undefined;

  return {
    "@type": "Event",
    name: activity.title,
    startDate: day.date,
    location: placeRef,
    description: activity.note ?? `${block.label}, ${day.displayLabel}.`,
  };
}

/** Every entry of one day, timed sessions and untimed activities alike. */
function dayEntries(day: ProgramDay): JsonLd[] {
  return day.blocks.flatMap((block) => [
    ...block.sessions.map((session) => sessionEvent(day, session)),
    ...[allBlockEvent(day, block)].filter(
      (entry): entry is JsonLd => entry !== undefined,
    ),
  ]);
}

function dayName(day: ProgramDay): string {
  return `${day.displayLabel} ${day.date.slice(0, 4)}`;
}

/**
 * One programme day.
 *
 * `root` means this day is the document's own subject, so it spells the
 * venue and organiser out; as a subEvent of the camp meeting it points at
 * the definitions the enclosing document already carries.
 */
export function dayEvent(
  day: ProgramDay,
  { root }: { root: boolean },
): JsonLd {
  const { start, end } = dayBounds(day);
  const subEvent = root ? dayEntries(day) : [];

  return {
    "@type": "Event",
    name: `${dayName(day)} — ${eventInfo.edition}`,
    startDate: start ? eventLocalIso(day.date, start) : day.date,
    ...(end ? { endDate: eventLocalIso(day.date, end) } : {}),
    url: absoluteUrl(dayPath(day.id)),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    location: locations(root),
    organizer: root ? organizer : organizerRef,
    superEvent: {
      "@type": "Event",
      name: eventInfo.edition,
      url: absoluteUrl("/"),
    },
    ...(subEvent.length > 0 ? { subEvent } : {}),
  };
}

/**
 * The camp meeting as a whole, with one subEvent per day.
 *
 * The days carry their own sessions on their own pages; nesting all eight
 * days' sessions here as well would put the entire programme into the
 * home page's head for no gain.
 */
export function campMeetingEvent(): JsonLd {
  const first = program[0];
  const last = program.at(-1);
  const firstStart = first ? dayBounds(first).start : undefined;
  const lastEnd = last ? dayBounds(last).end : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: eventInfo.edition,
    description: `${eventInfo.edition} at ${eventInfo.church.name}, ${eventInfo.church.address}. ${program.length} days of worship, teaching and fellowship.`,
    startDate:
      first && firstStart
        ? eventLocalIso(first.date, firstStart)
        : eventInfo.startDate,
    endDate:
      last && lastEnd ? eventLocalIso(last.date, lastEnd) : eventInfo.endDate,
    url: absoluteUrl("/"),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    location: locations(true),
    organizer,
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "KES",
      availability: "https://schema.org/InStock",
      url: absoluteUrl("/schedule"),
    },
    subEvent: program.map((day) => dayEvent(day, { root: false })),
  };
}

/** One day, as a standalone document for that day's page. */
export function dayEventDocument(day: ProgramDay): JsonLd {
  return { "@context": "https://schema.org", ...dayEvent(day, { root: true }) };
}
