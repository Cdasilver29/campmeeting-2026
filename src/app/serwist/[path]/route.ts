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

/**
 * ── THE GALLERY IS THE ONE THING IN public/ THAT IS NOT PRECACHED ────
 *
 * Serwist's own manifest globs everything in public/, and until now that
 * was right: the speaker portraits, the header photographs and the icons
 * are all things a page NEEDS, and the whole point of this phase is that
 * the schedule works on campground signal with no bars.
 *
 * The gallery is not that. It is 31 photographs of PREVIOUS camp
 * meetings, about 3.2 MB, and it is the only part of the site nobody
 * needs while they are standing in the churchyard. Precaching it would
 * more than double what every phone downloads before it has opened
 * anything — against a public/ that is otherwise 2.9 MB — to have last
 * year's pictures ready offline.
 *
 * So the manifest is filtered rather than the files being hidden. They
 * stay in public/ and are served like any other static asset; they are
 * simply not in the list the service worker fetches on install, so they
 * load when somebody opens /gallery and not before.
 *
 * ── THE URL IS NOT `/gallery/…` YET WHEN THIS RUNS ───────────────────
 *
 * @serwist/turbopack appends a transform of its own AFTER whatever is
 * passed here, and that one is what rewrites `public/x` to `/x`. So a
 * user transform sees `public/gallery/camp-01.webp`, and a plain
 * `startsWith("/gallery/")` test — which is what this was first written
 * as — matched nothing at all while reporting a cheerful "0 excluded".
 * The prefix is stripped before the test, and the count below is the
 * check: it must say 31.
 *
 * The /gallery PAGE is still precached — it is in `siteRoutes` — so it
 * opens offline and shows its own text. Only its pictures are absent, and
 * an <img> that cannot load offline is the ordinary offline experience of
 * a photograph.
 */
function isGalleryImage(url: string): boolean {
  const path = url.startsWith("public/") ? url.slice("public".length) : url;
  return path.startsWith("/gallery/");
}

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    swSrc: "src/sw.ts",
    additionalPrecacheEntries: pages,
    manifestTransforms: [
      (entries) => {
        const kept = entries.filter((entry) => !isGalleryImage(entry.url));
        const dropped = entries.length - kept.length;
        console.log(
          `[precache] ${kept.length} entries, ${dropped} gallery images excluded`,
        );
        return { manifest: kept, warnings: [] };
      },
    ],
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
