import { notFound } from "next/navigation";
import { eventInfo, hostById, hostLetter, hosts } from "@/data";
import { CARD_ID, OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";
import { hostPageDefinition } from "@/lib/page-identity";

/**
 * A share card per host, so a letter posted into a WhatsApp thread
 * previews as the person who wrote it rather than as the site.
 *
 * Same mechanism as the speaker cards: `ogCard` draws the PageIdentity —
 * eyebrow, title, rule, meta — off the same definition the page's own
 * header renders, so the preview and the page cannot drift apart. No
 * portrait, for the same reason the speaker cards have none.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return hosts
    .filter((host) => Boolean(hostLetter(host.id)))
    .map((host) => ({ id: host.id, __metadata_id__: CARD_ID }));
}

type Params = { params: Promise<{ id: string }> };

/** Dynamic alt text, which a plain `alt` export cannot produce. */
export async function generateImageMetadata({ params }: Params) {
  const host = hostById[(await params).id];
  if (!host) return [];
  const label = host.title ? `${host.title} ${host.name}` : host.name;

  return [
    {
      id: CARD_ID,
      alt: `${label}, ${host.role}, welcomes you to ${eventInfo.edition}`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function Image({ params }: Params) {
  const host = hostById[(await params).id];
  // The page this card belongs to is already a 404 for an unknown id, so
  // the card is one too, rather than a card with a blank title.
  if (!host) notFound();

  return ogCard(hostPageDefinition(host));
}
