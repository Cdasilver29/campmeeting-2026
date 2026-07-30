import { notFound } from "next/navigation";
import { eventInfo } from "@/data";
import {
  ministryCopy,
  ministryPages,
  type MinistryPageTag,
} from "@/features/ministries/copy";
import { eventDateRange } from "@/lib/event-dates";
import { CARD_ID, OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";
import { ministryPageDefinition } from "@/lib/page-identity";

/**
 * A share card per ministry page, titled with the ministry label from
 * features/ministries/copy.ts — the same string the page heading and its
 * metadata use.
 */

/**
 * One card per ministry page, and nothing else, matching the page's own
 * params. The metadata id is named for the reason given in src/lib/og.tsx.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return ministryPages.map((tag) => ({ tag, __metadata_id__: CARD_ID }));
}

type Params = { params: Promise<{ tag: string }> };

function findMinistry(tag: string): MinistryPageTag | undefined {
  return ministryPages.find((candidate) => candidate === tag);
}

/** Dynamic alt text, which a plain `alt` export cannot produce. */
export async function generateImageMetadata({ params }: Params) {
  const tag = findMinistry((await params).tag);
  if (!tag) return [];

  return [
    {
      id: CARD_ID,
      alt: `${ministryCopy[tag].label} at ${eventInfo.edition}, ${eventDateRange()}`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function Image({ params }: Params) {
  const raw = (await params).tag;
  const tag = findMinistry(raw);
  // The page this card belongs to is already a 404 for an unknown tag, so
  // the card is one too, rather than a card with a blank title.
  if (!tag) notFound();

  // Same three strings the page's own header renders.
  return ogCard(ministryPageDefinition(tag));
}
