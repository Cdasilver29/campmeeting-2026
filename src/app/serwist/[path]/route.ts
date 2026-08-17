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
 * ── WHAT IN public/ IS NOT PRECACHED ─────────────────────────────────
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
/**
 * ── AND THE PDFs, FOR THE SAME REASON, ONLY MORE SO ──────────────────
 *
 * public/downloads/ holds the printed programme PDF — one file now, the
 * committee's complete eight-day programme, 3.1 MB. It was eight daily
 * sheets running well over 20 MB between them, and the rule is unchanged
 * by that: 3.1 MB is still more than the entire rest of public/, and
 * precaching it would mean every phone downloading the print edition
 * before it had opened a single page, on the connection this phase exists
 * to be kind to.
 *
 * The rule matches the DIRECTORY, not a filename, so the eight-to-one
 * change needed no edit here and the next PDF dropped in that folder is
 * excluded the day it lands.
 *
 * And it buys nothing. The schedule is already readable offline as HTML;
 * that is what `siteRoutes` above is for. The PDF is the same content in a
 * form somebody chose to save deliberately, and a deliberate download is
 * the one kind of fetch a service worker should not make on the reader's
 * behalf. A PDF that has been downloaded is in the phone's own files
 * anyway, which is better offline storage than a cache the next deploy
 * clears.
 *
 * The /downloads PAGE is still precached — it is in `siteRoutes` — so it
 * opens offline and shows the download. Only the file behind it needs
 * signal.
 *
 * ── THIS RULE IS NOT REDUNDANT, AND IT WAS CHECKED ───────────────────
 *
 * Serwist also refuses any single file over 2 MB on its own, and the
 * programme is 3.1 MB — as day 1's sheet was 3.44 MB before it. So the
 * build log's "1 downloads excluded" does not by itself prove this rule
 * fired: the size limit would have dropped the file first either way.
 * That is the same silent pass the gallery note above was written about.
 *
 * So it was tested rather than assumed. A 65-byte PDF dropped into
 * public/downloads/ and rebuilt reported an extra excluded download with
 * the kept-entry count unchanged, then was deleted. That is the case that
 * matters: the size limit only catches the big ones, and a programme that
 * happens to export under 2 MB is caught by this rule and by nothing
 * else.
 */
function isExcludedFromPrecache(url: string): boolean {
  // The prefix is stripped first because @serwist/turbopack appends its
  // own transform AFTER this one, and that is the transform that rewrites
  // `public/x` to `/x`. Testing the final URL here matches nothing while
  // cheerfully reporting "0 excluded" — see the note above.
  const path = url.startsWith("public/") ? url.slice("public".length) : url;
  return path.startsWith("/gallery/") || path.startsWith("/downloads/");
}

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    swSrc: "src/sw.ts",
    additionalPrecacheEntries: pages,
    manifestTransforms: [
      (entries) => {
        const kept = entries.filter((entry) => !isExcludedFromPrecache(entry.url));
        // Counted per prefix, not as one total. The gallery figure is the
        // check that the prefix-stripping above still works — it must say
        // 31 — and a combined number would hide either count going to zero.
        const dropped = entries.filter((entry) =>
          isExcludedFromPrecache(entry.url),
        );
        const galleries = dropped.filter((e) =>
          e.url.replace(/^public/, "").startsWith("/gallery/"),
        ).length;
        console.log(
          `[precache] ${kept.length} entries, ${galleries} gallery images and ` +
            `${dropped.length - galleries} downloads excluded`,
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
