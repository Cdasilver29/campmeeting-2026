import {
  allSessions,
  speakerById,
  speakers,
  type Session,
  type Speaker,
} from "@/data";

/** "Pr. Kennedy Mfune" — honorific as printed, or the bare name. */
export function speakerLabel(speaker: Speaker): string {
  return speaker.title ? `${speaker.title} ${speaker.name}` : speaker.name;
}

/**
 * Everyone credited on a session: profiled speakers resolved from their
 * ids, then the free-text credits (choirs, ministries) as printed.
 * An id with no matching speaker falls back to the id rather than
 * disappearing, so a data slip is visible instead of silent.
 */
export function presenterNames(
  session: Pick<Session, "presenterIds" | "presentedBy">,
): string[] {
  const named = (session.presenterIds ?? []).map((id) => {
    const speaker = speakerById[id];
    return speaker ? speakerLabel(speaker) : id;
  });
  return [...named, ...(session.presentedBy ?? [])];
}

/**
 * Speakers who actually present something, in speakers.ts order. The
 * presenter filter is built from this rather than from `speakers` so a
 * profile added ahead of a programme update never offers a facet that
 * returns nothing.
 */
export const programSpeakers: Speaker[] = speakers.filter((speaker) =>
  allSessions.some((session) => session.presenterIds?.includes(speaker.id)),
);
