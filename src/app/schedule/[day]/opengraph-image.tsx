import { notFound } from "next/navigation";
import { eventInfo, getDay, program } from "@/data";
import { dayNumber, fullDayLabel } from "@/features/schedule/lib/entries";
import { CARD_ID, OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";
import { dayPageDefinition } from "@/lib/page-identity";

/**
 * A share card per programme day, so a day link dropped into a WhatsApp
 * thread previews as that day. Same strings as the page's
 * generateMetadata: the day as printed, its position in the week, and
 * how many entries it holds.
 */

/**
 * One card per day, and nothing else, matching the page's own params.
 *
 * generateImageMetadata below turns this route into
 * /schedule/[day]/opengraph-image/[__metadata_id__], so the metadata id
 * has to be named here too or the day cards are left to render on the
 * first request instead of at build time.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return program.map((day) => ({ day: day.id, __metadata_id__: CARD_ID }));
}

type Params = { params: Promise<{ day: string }> };

/**
 * generateImageMetadata rather than a static `alt` export: the alt text
 * has to name the day, and a plain export cannot see the route params.
 */
export async function generateImageMetadata({ params }: Params) {
  const day = getDay((await params).day);
  if (!day) return [];

  return [
    {
      id: CARD_ID,
      alt: `${fullDayLabel(day)}, day ${dayNumber(day.id)} of ${program.length} of the ${eventInfo.edition} programme`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function Image({ params }: Params) {
  const id = (await params).day;
  const day = getDay(id);
  // The page this card belongs to is already a 404 for an unknown day, so
  // the card is one too, rather than a card with a blank title.
  if (!day) notFound();

  // Same three strings the page's own header renders.
  return ogCard(dayPageDefinition(day));
}
