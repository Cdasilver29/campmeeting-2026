import type { Metadata } from "next";
import { eventInfo } from "@/data";

/**
 * Page metadata with the Open Graph pair filled from the same strings.
 *
 * Links to this site are going to be shared on WhatsApp, and WhatsApp
 * builds its preview from og:title and og:description, ignoring the
 * document title entirely. A page that sets only `title` previews as a
 * bare URL, so the two are always written together here rather than left
 * to each page to remember.
 *
 * No og:image: there is no artwork approved for social previews yet, and
 * a broken image URL renders worse than none at all.
 */
export function pageMetadata({
  title,
  description,
}: {
  title: string;
  description: string;
}): Metadata {
  const fullTitle = `${title} | ${eventInfo.edition}`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      siteName: eventInfo.edition,
      locale: "en_KE",
      type: "website",
    },
  };
}
