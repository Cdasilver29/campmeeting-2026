import { allSessions, program, type FlatSession, type ProgramDay } from "@/data";

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
