import {
  allSessions,
  hosts,
  program,
  speakers,
  type FlatSession,
  type ProgramDay,
  type Speaker,
} from "@/data";

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
