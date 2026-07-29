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
    "/speakers/[id]/opengraph-image": ["./src/assets/fonts/*.ttf"],
    "/ministries/[tag]/opengraph-image": ["./src/assets/fonts/*.ttf"],
  },
};

// Serwist needs to know the build output layout to rewrite the precache
// manifest onto real URLs. Wrapping the config is all that takes.
export default withSerwist(nextConfig);
