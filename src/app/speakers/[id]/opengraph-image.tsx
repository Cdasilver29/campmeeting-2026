import { notFound } from "next/navigation";
import { eventInfo, speakerById, speakers } from "@/data";
import { speakerLabel } from "@/features/schedule/lib/presenters";
import { CARD_ID, OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";

/**
 * A share card per speaker: the name and the role, the same two strings
 * the page's generateMetadata uses. No portrait — CLAUDE.md still lists
 * speaker photos as an open item, and a card is the wrong place to
 * invent one.
 */

/**
 * One card per speaker, and nothing else, matching the page's own params.
 * The metadata id is named for the reason given in src/lib/og.tsx.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return speakers.map((speaker) => ({
    id: speaker.id,
    __metadata_id__: CARD_ID,
  }));
}

type Params = { params: Promise<{ id: string }> };

/** Dynamic alt text, which a plain `alt` export cannot produce. */
export async function generateImageMetadata({ params }: Params) {
  const speaker = speakerById[(await params).id];
  if (!speaker) return [];
  const role = speaker.role ? `, ${speaker.role}` : "";

  return [
    {
      id: CARD_ID,
      alt: `${speakerLabel(speaker)}${role} at ${eventInfo.edition}`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function Image({ params }: Params) {
  const id = (await params).id;
  const speaker = speakerById[id];
  // The page this card belongs to is already a 404 for an unknown id, so
  // the card is one too, rather than a card with a blank title.
  if (!speaker) notFound();

  return ogCard({
    // The role is the eyebrow when there is one. "Speaker" is the honest
    // fallback for the profiles whose role the committee has not sent.
    eyebrow: speaker.role ?? "Speaker",
    title: speakerLabel(speaker),
    meta: `${eventInfo.edition} · ${eventInfo.church.name}`,
  });
}
