import type { Metadata } from "next";
import { eventInfo } from "@/data";

/**
 * Page metadata with the Open Graph pair and the canonical filled from
 * the same strings.
 *
 * Links to this site are going to be shared on WhatsApp, and WhatsApp
 * builds its preview from og:title and og:description, ignoring the
 * document title entirely. A page that sets only `title` previews as a
 * bare URL, so the two are always written together here rather than left
 * to each page to remember.
 *
 * `path` is required for the same reason: a canonical is only useful if
 * every page has one, and making it an argument means a new page cannot
 * quietly ship without it. It is site-relative — metadataBase, set in
 * src/app/layout.tsx, makes it absolute.
 *
 * No og:image: there is no artwork approved for social previews yet, and
 * a broken image URL renders worse than none at all.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  /** Site-relative path of this page, e.g. "/schedule/friday-21". */
  path: string;
}): Metadata {
  const fullTitle = `${title} | ${eventInfo.edition}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: eventInfo.edition,
      locale: "en_KE",
      type: "website",
    },
  };
}
