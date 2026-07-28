import type { MetadataRoute } from "next";
import { OFFLINE_ROUTE } from "@/lib/pwa";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

/**
 * Everything in siteRoutes is meant to be found. The three exclusions are
 * pages the site generates but does not publish: the offline fallback,
 * the compiled service worker, and the design-system reference. None of
 * them is in the sitemap either, for the same reason.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [OFFLINE_ROUTE, "/serwist/", "/styleguide"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
