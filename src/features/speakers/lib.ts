import {
  allSessions,
  hosts,
  program,
  speakers,
  type FlatSession,
  type MinistryTag,
  type ProgramDay,
  type Speaker,
} from "@/data";
import { speakerLabel } from "@/features/schedule/lib/presenters";
import { ministryLabels } from "@/features/schedule/lib/today";

/**
 * The presenters grid on /speakers.
 *
 * Everyone in `speakers` EXCEPT the people whose place on this page is the
 * hosts and elders section. Eld. Ken Ochuka is the one such person today:
 * he chairs the camp meeting and also gives the opening Sabbath's welcome,
 * so he has a speaker record for the credit to link to, and his card
 * appeared in both grids on the same page.
 *
 * The test is `hosts[].speakerId` rather than a hardcoded id, so the rule
 * stays true if a second host is ever given a profile: a host with a
 * profile is shown once, as a host.
 *
 * This only removes the CARD. The record, the /speakers/ken-ochuka page and
 * the programme credit that links to it are all untouched.
 */
const hostedSpeakerIds = new Set(
  hosts.map((host) => host.speakerId).filter(Boolean) as string[],
);

export const presenterSpeakers: Speaker[] = speakers.filter(
  (speaker) => !hostedSpeakerIds.has(speaker.id),
);

export interface SpeakerDayGroup {
  day: ProgramDay;
  sessions: FlatSession[];
}

/**
 * A speaker's sessions, grouped by day in programme order. Days the
 * speaker does not appear in are dropped rather than shown empty, which
 * is what keeps Pr. Mfune's page (present most days) to one section per
 * day he actually presents in, rather than eight with some blank.
 */
export function speakerDayGroups(speakerId: string): SpeakerDayGroup[] {
  const sessions = allSessions.filter((session) =>
    session.presenterIds?.includes(speakerId),
  );

  return program
    .map((day) => ({
      day,
      sessions: sessions.filter((session) => session.dayId === day.id),
    }))
    .filter((group) => group.sessions.length > 0);
}

/**
 * ── THE TRACK A SPEAKER LEADS, WHEN THEY LEAD NO DATED SESSION ───────
 *
 * Six profiles have no session in program.ts, and until now every one of
 * them rendered the same sentence: the sessions "have not been published
 * yet". That is one message covering two different facts, and it is
 * wrong about both.
 *
 *   - The three Family Life records — the Barakes, the Owinos, Resper
 *     Gogo — have a track that IS in the programme. Five sessions of it,
 *     Sunday through Thursday, at a known hour. What nobody has said is
 *     which afternoon belongs to whom. "Nothing published yet" throws
 *     away everything the reader could have been told.
 *   - Ambassadors and Teens are NOT in the programme at all. There, the
 *     old sentence promised sessions that no published document mentions.
 *
 * So this reads the track off the record and asks the programme whether
 * it has one, and the page says something different in each case.
 *
 * ── DERIVED, WITH NO LIST OF PEOPLE IN IT ────────────────────────────
 *
 * `role` is the only input, and it already carries the fact: "Family
 * Life, Young Professionals", "Ambassadors", "Teens". Its first
 * comma-separated part is the ministry and the rest is the audience,
 * which is the shape every role in event.ts is written in.
 *
 * The track is matched to a `MinistryTag` through `ministryLabels` —
 * the site's own tag-to-label table, read backwards — rather than
 * through a mapping written here. "Family Life" is a label in it and
 * resolves; "Ambassadors" and "Teens" are not labels in it, which is the
 * same thing as their not being in the programme, because that table IS
 * the programme's vocabulary. No speaker id appears anywhere in this
 * file, and a role the committee adds tomorrow is classified by the same
 * two questions as the ones here.
 *
 * A record with no `role` at all gets `undefined` and keeps the original
 * wording: nothing is known about it, which is what that wording says.
 */
export interface SpeakerTrack {
  /** The ministry as the role prints it: "Family Life", "Teens". */
  label: string;
  /** Who it is for, where the role names an audience. */
  audience?: string;
  /** The programme's tag for it. Absent when the programme has no such ministry. */
  ministry?: MinistryTag;
  /** Every session the programme gives that ministry. Empty is the answer, not a gap. */
  sessions: FlatSession[];
  /** "Sunday to Thursday", or a list when the days are not a run. */
  dayRange?: string;
  /** "15:00 to 16:20", only when every session shares one span. */
  timeRange?: string;
  /**
   * Whether this record is more than one person, so a sentence about it
   * can pick "lead" over "leads". From `people`, which the two couples
   * already carry for schema.org — not from a guess at the name.
   */
  plural: boolean;
}

const ministryByLabel = new Map(
  Object.entries(ministryLabels).map(([tag, label]) => [
    label.toLowerCase(),
    tag as MinistryTag,
  ]),
);

/**
 * A day's name for prose.
 *
 * `dayLabel` normally — "Sunday" — but the week has TWO Sabbaths, and
 * "Sabbath to Sabbath" would name a range whose ends cannot be told
 * apart. Any label that is not unique across the programme falls back to
 * the dated `displayLabel`.
 */
function dayName(day: ProgramDay): string {
  const unique =
    program.filter((other) => other.dayLabel === day.dayLabel).length === 1;
  return unique ? day.dayLabel : day.displayLabel;
}

/** "Sunday to Thursday" for a run of days, a list for anything else. */
function describeDays(sessions: FlatSession[]): string | undefined {
  const dayIds = new Set(sessions.map((session) => session.dayId));
  const days = program.filter((day) => dayIds.has(day.id));
  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) return undefined;
  if (days.length === 1) return dayName(first);

  // A contiguous run reads as a range; anything else has to be listed, or
  // "Sunday to Thursday" would claim two days the track does not run on.
  const span = program.indexOf(last) - program.indexOf(first);
  if (span === days.length - 1) return `${dayName(first)} to ${dayName(last)}`;

  const names = days.map(dayName);
  return `${names.slice(0, -1).join(", ")} and ${dayName(last)}`;
}

/**
 * "15:00 to 16:20", and only when it is true of every session in the
 * track. A track that runs at two different hours has no single time and
 * is described by its days alone rather than by the first one found.
 */
function describeTimes(sessions: FlatSession[]): string | undefined {
  const spans = new Set(
    sessions.map((session) =>
      session.start && session.end ? `${session.start} to ${session.end}` : "",
    ),
  );
  if (spans.size !== 1) return undefined;
  const [span] = [...spans];
  return span || undefined;
}

export function speakerTrack(speaker: Speaker): SpeakerTrack | undefined {
  if (!speaker.role) return undefined;

  // First comma-separated part is the ministry, the rest is the audience:
  // "Family Life, Singles (Widows & Widowers)". A role with no comma is
  // all ministry, which is how "Ambassadors" and "Teens" are written.
  const parts = speaker.role.split(",");
  const label = (parts[0] ?? "").trim();
  if (!label) return undefined;

  const audience = parts.slice(1).join(",").trim() || undefined;
  const ministry = ministryByLabel.get(label.toLowerCase());
  const sessions = ministry
    ? allSessions.filter((session) => session.ministry === ministry)
    : [];

  return {
    label,
    audience,
    ministry,
    sessions,
    dayRange: describeDays(sessions),
    timeRange: describeTimes(sessions),
    plural: (speaker.people?.length ?? 1) > 1,
  };
}

/**
 * ── THE SENTENCES, WRITTEN ONCE ──────────────────────────────────────
 *
 * The profile page, the card on /speakers and the link preview all have
 * to say the same thing about the same person, and they are three files.
 * Built here so they cannot drift into three accounts of one fact.
 *
 * None of them names a day as anyone's. "Lead Family Life" is what the
 * role says; "the Family Life sessions run Sunday to Thursday" is what
 * the programme says; neither claims the second is the first's. Which
 * afternoon belongs to whom is the open item, and no sentence here
 * quietly closes it.
 */

/** "Matthew and Marion Barake lead Family Life for Young Adults." */
export function trackLeadSentence(
  speaker: Speaker,
  track: SpeakerTrack,
): string {
  const verb = track.plural ? "lead" : "leads";
  const audience = track.audience ? ` for ${track.audience}` : "";
  return `${speakerLabel(speaker)} ${verb} ${track.label}${audience}.`;
}

/**
 * "The Family Life sessions run Sunday to Thursday, 15:00 to 16:20."
 *
 * Undefined when the programme has no session for the track, which is
 * the signal the page branches on — there is nothing to say about when
 * something runs if it does not run.
 */
export function trackWhenSentence(track: SpeakerTrack): string | undefined {
  if (track.sessions.length === 0) return undefined;

  const when = [track.dayRange, track.timeRange].filter(Boolean).join(", ");
  if (when) return `The ${track.label} sessions run ${when}.`;

  // Reachable only if a ministry's sessions carry no day, which the data
  // model does not allow today. Says less rather than saying it wrong.
  const count = track.sessions.length;
  return `${track.label} is on the programme, ${count} ${count === 1 ? "session" : "sessions"} in all.`;
}

/**
 * "The published programme does not list a Teens session of its own."
 *
 * The article is picked from the label rather than written into the
 * string: the two tracks in this state today are "Teens" and
 * "Ambassadors", and one of them takes "an".
 */
export function trackAbsentSentence(track: SpeakerTrack): string {
  const article = /^[aeiou]/i.test(track.label) ? "an" : "a";
  return `The published programme does not list ${article} ${track.label} session of its own.`;
}

/**
 * The short form, for a link preview and a search result, where the name
 * is already the title and the role is already the eyebrow.
 */
export function trackMetaSentence(track: SpeakerTrack): string {
  const when = trackWhenSentence(track);
  if (!when) return `${track.label} is not in the published programme.`;

  const range = [track.dayRange, track.timeRange].filter(Boolean).join(", ");
  return range ? `${track.label} runs ${range}.` : when;
}
