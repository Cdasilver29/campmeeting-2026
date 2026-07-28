import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";
import { OFFLINE_ROUTE } from "@/lib/pwa";
import { siteRoutes } from "@/lib/routes";

/**
 * Builds and serves the service worker (src/sw.ts) at /serwist/sw.js.
 *
 * createSerwistRoute is force-static with generateStaticParams, so the
 * worker is compiled once during `next build` and served as a static
 * asset, in keeping with the rest of the site.
 */

/**
 * The precache revision. Serwist keys cached pages on it, so it has to
 * change with every deploy or a phone would keep serving the HTML it
 * first saw. The commit is the natural version: Vercel exposes it as an
 * environment variable, and locally git can be asked directly. The
 * timestamp is a last resort for a build with neither, and errs toward
 * re-fetching rather than toward stale HTML.
 */
function buildRevision(): string {
  const fromVercel = process.env.VERCEL_GIT_COMMIT_SHA;
  if (fromVercel) return fromVercel;

  const fromGit = spawnSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf-8",
  }).stdout?.trim();
  if (fromGit) return fromGit;

  return String(Date.now());
}

const revision = buildRevision();

/**
 * Every page the site publishes, plus the offline fallback.
 *
 * siteRoutes is derived from src/data (see src/lib/routes.ts) and shared
 * with the sitemap, so a programme update that adds or renames a day
 * cannot leave that day out of the precache. Serwist's own manifest
 * already covers the build assets and everything in public/; this adds
 * the HTML documents, which is what makes a page readable offline
 * without having been visited first.
 */
const pages = [...siteRoutes, OFFLINE_ROUTE].map((url) => ({ url, revision }));

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    swSrc: "src/sw.ts",
    additionalPrecacheEntries: pages,
    // The native binary rather than the wasm build: this is a Node build
    // step, and esbuild is already a dependency.
    useNativeEsbuild: true,
    esbuildOptions: {
      // Without this esbuild takes its target from browserslist defaults,
      // which reach back to Chrome 64 and then fail on the destructuring
      // Serwist itself is written with. Nothing that old can run a module
      // service worker in the first place, so the floor is set here to a
      // language level instead of a browser list. It applies only to the
      // worker bundle; the pages are compiled by Next as before.
      target: "es2022",
    },
  });
