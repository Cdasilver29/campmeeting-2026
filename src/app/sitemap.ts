import type { MetadataRoute } from "next";
import { dayRoutes, siteRoutes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

/**
 * Built from the same siteRoutes the service worker precaches, so the two
 * cannot drift: a day that is listed here is a day that works offline,
 * and a day added to the programme appears in both or neither.
 *
 * lastModified is the build time. Every page is statically generated, so
 * a page's content changes exactly when the site is rebuilt.
 */
const builtAt = new Date();

/** Days change as the committee confirms the programme; the rest rarely. */
function changeFrequency(
  route: string,
): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (route === "/" || route === "/announcements") return "daily";
  if (route === "/schedule" || dayRoutes.includes(route)) return "weekly";
  return "monthly";
}

function priority(route: string): number {
  if (route === "/") return 1;
  if (route === "/schedule" || dayRoutes.includes(route)) return 0.9;
  return 0.6;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return siteRoutes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: builtAt,
    changeFrequency: changeFrequency(route),
    priority: priority(route),
  }));
}
