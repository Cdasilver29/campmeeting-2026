import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

// Serwist needs to know the build output layout to rewrite the precache
// manifest onto real URLs. Wrapping the config is all that takes.
export default withSerwist(nextConfig);
