import { notFound } from "next/navigation";
import { allSessions, eventInfo, getDay } from "@/data";
import { sessionIdFromSlug, sessionSlug } from "@/features/schedule/lib/url";
import { CARD_ID, OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";
import { sessionPageDefinition } from "@/lib/page-identity";

/**
 * A share card per session, so "come to this" previews as the session
 * rather than as the day it is on. Same generated-card mechanism every
 * other route uses: ogCard draws a PageIdentity, and
 * sessionPageDefinition is where the session's day, block, time and
 * presenter become those three strings.
 *
 * 238 of them, which is by far the largest set of cards on the site. They
 * are still prerendered rather than left to render on first request, for
 * the reason the day cards give: a card that renders on demand is a card
 * that renders while a WhatsApp crawler is waiting for it.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return allSessions.map((session) => ({
    day: session.dayId,
    session: sessionSlug(session.dayId, session.id),
    __metadata_id__: CARD_ID,
  }));
}

type Params = { params: Promise<{ day: string; session: string }> };

function resolve(day: string, slug: string) {
  const programDay = getDay(day);
  if (!programDay) return undefined;
  const session = allSessions.find((s) => s.id === sessionIdFromSlug(day, slug));
  return session ? { day: programDay, session } : undefined;
}

export async function generateImageMetadata({ params }: Params) {
  const { day, session } = await params;
  const found = resolve(day, session);
  if (!found) return [];

  return [
    {
      id: CARD_ID,
      alt: `${found.session.title}, ${found.day.displayLabel} at ${eventInfo.edition}`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function Image({ params }: Params) {
  const { day, session } = await params;
  const found = resolve(day, session);
  if (!found) notFound();

  return ogCard(sessionPageDefinition(found.session, found.day));
}
