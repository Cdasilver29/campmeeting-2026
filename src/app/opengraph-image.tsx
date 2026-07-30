import { eventInfo } from "@/data";
import { eventDateRange } from "@/lib/event-dates";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";
import { siteIdentity } from "@/lib/page-identity";

/**
 * The site's default share card, inherited by every page that does not
 * override it — /schedule, /speakers, /about, /contact and the rest.
 * Next resolves file-based metadata ahead of the objects returned by
 * pageMetadata, so those pages keep their own title and description and
 * gain this image.
 */

export const alt = `${eventInfo.edition}, ${eventDateRange()}, at ${eventInfo.church.name}, ${eventInfo.church.address}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard(siteIdentity);
}
