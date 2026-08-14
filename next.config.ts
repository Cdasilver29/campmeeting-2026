import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * The Open Graph cards read their two typefaces off disk (src/lib/og.tsx).
   * Every card route is prerendered, so the read happens during `next build`
   * and never on a request — but if one of these ever stopped being static,
   * a trace without the font files would fail at runtime rather than at
   * build time. Listing them keeps that failure mode out of reach.
   */
  outputFileTracingIncludes: {
    "/opengraph-image": ["./src/assets/fonts/*.ttf"],
    "/schedule/[day]/opengraph-image": ["./src/assets/fonts/*.ttf"],
    "/schedule/[day]/[session]/opengraph-image": ["./src/assets/fonts/*.ttf"],
    "/speakers/[id]/opengraph-image": ["./src/assets/fonts/*.ttf"],
    "/ministries/[tag]/opengraph-image": ["./src/assets/fonts/*.ttf"],
  },

  /*
   * The children's ministry moved out from under /ministries and up to
   * its own top-level route. That address was published, precached by
   * every service worker installed before the move, and is in the
   * sitemap Google has already crawled — so it redirects rather than
   * 404s.
   *
   * Here rather than in src/middleware.ts, which exists for the one
   * redirect that has to drop a query param on the way through. This one
   * carries nothing, so it belongs in config where it costs no
   * middleware invocation.
   */
  async redirects() {
    return [
      {
        source: "/ministries/children",
        destination: "/children",
        permanent: true,
      },
    ];
  },
};

// Serwist needs to know the build output layout to rewrite the precache
// manifest onto real URLs. Wrapping the config is all that takes.
export default withSerwist(nextConfig);
