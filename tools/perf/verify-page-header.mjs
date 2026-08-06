/**
 * Page-header band contrast against the REAL built page.
 *
 * verify-hero.mjs does this for the one band on the home page. This does
 * it for the eleven interior bands that took a photograph of their own,
 * and it is deliberately a sibling of that script rather than a flag on
 * it: the hero is one element with a phase attribute and two header
 * states, and these are eleven routes with three separately-coloured
 * strings and no states at all. One script trying to be both would be
 * mostly branches.
 *
 * ── WHAT IT MEASURES ─────────────────────────────────────────────────
 *
 * Per route, per width, per colour scheme: the eyebrow, the h1 and the
 * meta line are located, their layout boxes kept, their ink hidden, and
 * the BRIGHTEST composited pixel inside each box is scored against the
 * colour that string is actually set in.
 *
 * Brightest, and each box separately rather than one union box. A union
 * would let the eyebrow's worst pixel score the title, which is how a
 * band with one blown highlight under one line reports as passing.
 *
 * ── FOUR THINGS THAT PRODUCE WRONG NUMBERS, ALL INHERITED ────────────
 *
 * These are the same traps verify-hero.mjs documents, and they are
 * repeated here because this script hit three of them during its first
 * run rather than because they are theoretical.
 *
 * 1. `transition-all` defeats `visibility: hidden`. Transitions and
 *    animations are killed BEFORE anything is hidden, and two frames are
 *    waited for after.
 * 2. A tag list is not a subtree. /faq's header holds a Badge, which is a
 *    span inside a p; hiding `p` alone leaves the badge's border painted
 *    and it is a light hairline on the scrim, so it becomes the
 *    "brightest backdrop pixel". Every descendant is hidden.
 * 3. Measure against the colour the type actually is. On a band with no
 *    photograph the eyebrow is Grapevine, the title is ink and the meta
 *    is muted ink — three different colours, none of them white, and in
 *    dark mode all three invert. Each string's computed `color` is read
 *    out of the page and the hazard direction follows from it: brightest
 *    pixel for light type, darkest for dark type.
 * 4. Force the colour scheme before navigating, not after. next-themes
 *    resolves "system" on first paint, and a scheme emulated afterwards
 *    measures a band that is halfway through changing.
 *
 * ── WHAT IT ALSO REPORTS ─────────────────────────────────────────────
 *
 * The band's height at each width, so a change that was supposed to be
 * invisible to layout can be checked rather than asserted; and the
 * upscale factor, file on disk against the box the picture is being
 * asked to fill, because seven of these sources are under 740px wide and
 * that is the honest limit on this band.
 *
 * ── AND THE SITE HEADER, IN BOTH ITS STATES ──────────────────────────
 *
 * Added when the transparent-at-scroll-0 header was extended from the home
 * page to every route with a photographic band. verify-hero.mjs measures
 * that header on `/` and cannot be pointed anywhere else without gutting
 * its hero geometry, so the check lives here, where all eleven routes are
 * already being loaded at every width in every scheme.
 *
 * Two readings per page, and each against the colour the header's type
 * actually is at that moment — which is the trap verify-hero.mjs's own
 * header block exists to document:
 *
 *   transparent, at scroll 0     white type, so the BRIGHTEST pixel
 *   glass, scrolled past 96px    --color-ink, so the DARKEST pixel
 *
 * Measuring white against both would score a colour that is never there.
 * The box scanned is the header's own rect and the sample is taken with
 * every descendant of it hidden, so the lockup, the nav links and the
 * theme toggle are all scored against what is composited behind them
 * rather than against each other.
 *
 * Usage: node verify-page-header.mjs [scheme] [--routes a,b] [--widths 390,768]
 *   scheme is "light" | "dark" | "both" (default "both").
 *   --routes and --widths narrow the sweep to the bands a session changed.
 *     A full run is 140 page loads; re-measuring an unchanged band is not
 *     evidence, it is time.
 */
import { launch } from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3100";
let WIDTHS = [390, 768, 1024, 1440, 1920];

/** Every route whose band carries a photograph. */
const ROUTES = [
  "/schedule",
  "/speakers",
  "/livestream",
  "/ministries",
  "/about",
  "/contact",
  "/faq",
  "/downloads",
  "/prayer-requests",
  "/ministries/health",
  "/ministries/family-life",
  "/ministries/christian-education",
];

/** Bands with no photograph, measured so the flat treatment is covered too. */
const FLAT_ROUTES = ["/ministries/children", "/announcements"];

/**
 * The files on disk, mirroring src/lib/page-header-art.ts.
 *
 * Written out rather than read from the browser, because `naturalWidth`
 * is NOT the file's width. On an image selected from a `w`-descriptor
 * srcset it is the density-corrected intrinsic width — the served
 * variant divided by the ratio between the descriptor and the CSS slot
 * `sizes` declares — so it moves when `sizes` moves and it is smaller
 * than the file. The first version of this table read it and reported
 * /schedule as a 525px source when the file is 612px, which understated
 * every upscale in the column by about 15%. verify-hero.mjs carries the
 * same constant for the same reason.
 */
const SOURCES = {
  "/schedule": [612, 328],
  "/speakers": [1492, 865],
  "/livestream": [555, 260],
  "/ministries": [735, 245],
  // Re-cut to 1600x620. The band is never taller than 403px, so the 447
  // rows these three used to carry were thrown away by `cover` before
  // anything painted — 425 KB of a 576 KB precached directory. See the
  // `band` note in tools/assets/header-photos.mjs.
  "/about": [1600, 620],
  "/contact": [1634, 962],
  "/faq": [1600, 620],
  "/downloads": [736, 404],
  "/prayer-requests": [588, 306],
  "/ministries/health": [736, 412],
  "/ministries/family-life": [1600, 620],
  "/ministries/christian-education": [735, 414],
};

const lin = (v) => {
  const x = v / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
};
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const parse = (css) => css.match(/[\d.]+/g).slice(0, 3).map(Number);
const against = (typeCss, L) => {
  const tl = lum(...parse(typeCss));
  return (Math.max(tl, L) + 0.05) / (Math.min(tl, L) + 0.05);
};
const isLight = (css) => lum(...parse(css)) > 0.4;

const schemeArg = process.argv[2] ?? "both";
const SCHEMES = schemeArg === "both" ? ["light", "dark"] : [schemeArg];

/*
 * Optional narrowing. A full run is 14 routes x 5 widths x 2 schemes = 140
 * page loads, and a session that changes three photographs should not be
 * paying for the eleven it did not touch — re-measuring an unchanged band
 * is not evidence, it is time. `--routes` and `--widths` restrict the
 * sweep; with neither the behaviour is exactly as before.
 */
const flag = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? null : process.argv[i + 1];
};
const routeFilter = flag("routes")?.split(",");
const widthFilter = flag("widths")?.split(",").map(Number);
if (widthFilter) WIDTHS.splice(0, WIDTHS.length, ...widthFilter);
const PHOTO = routeFilter ? ROUTES.filter((r) => routeFilter.includes(r)) : ROUTES;
const FLAT = routeFilter ? FLAT_ROUTES.filter((r) => routeFilter.includes(r)) : FLAT_ROUTES;

const browser = await launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--force-device-scale-factor=1"],
});

const rows = [];

for (const scheme of SCHEMES) {
  for (const route of [...PHOTO, ...FLAT]) {
    for (const w of WIDTHS) {
      const page = await browser.newPage();
      await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
      await page.emulateMediaFeatures([
        { name: "prefers-color-scheme", value: scheme },
      ]);
      await page.setRequestInterception(true);
      page.on("request", (q) => {
        if (/\/serwist\/|sw\.js/.test(q.url())) q.abort().catch(() => {});
        else q.continue().catch(() => {});
      });
      await page.goto(BASE + route, { waitUntil: "load", timeout: 120000 });
      await page.evaluate(() => document.fonts.ready);
      await new Promise((r) => setTimeout(r, 500));

      const geo = await page.evaluate(() => {
        const band = document.querySelector("[data-page-header]");
        if (!band) return null;
        const head = band.querySelector("header");
        const box = (el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        };
        /* Two shapes of band, and the second is not an exception to skip.
           Twelve routes draw eyebrow / h1 / meta line. /speakers draws a
           lockup of four ranged-left paragraphs instead, and its h1 is
           BELOW the band — so the old queries would have found the eyebrow
           slot filled by the lockup's first line, `h1` null, and `hr + p`
           null, and reported one string for a band that carries four.

           Each lockup line carries data-header-line, so they are measured
           by name and separately, which is the same principle the three
           standard strings are measured by: a union box lets one blown
           highlight under one line score all of them. */
        const lines = [...head.querySelectorAll("[data-header-line]")];
        const parts = lines.length
          ? lines.map((el) => ({
              name: el.getAttribute("data-header-line"),
              box: box(el),
              color: getComputedStyle(el).color,
            }))
          : null;
        // The three strings, in DOM order, ignoring the media slot.
        const eyebrow = head.querySelector("p");
        const h1 = head.querySelector("h1");
        const metaEl = head.querySelector("hr + p");
        const img = band.querySelector("img");
        /* The site header, read BEFORE anything is hidden. Its own rect
           is the region the lockup, the nav and the theme toggle live in,
           and its link colour is the colour all three are set in — white
           in the transparent state, --color-ink in the glass one. */
        const siteHeader = document.querySelector("body > div header, header");
        return {
          bandH: Math.round(band.getBoundingClientRect().height),
          siteHeader: siteHeader
            ? {
                box: box(siteHeader),
                state: siteHeader.getAttribute("data-header-state"),
                color: getComputedStyle(siteHeader.querySelector("a")).color,
              }
            : null,
          art: band.getAttribute("data-header-art"),
          align: band.getAttribute("data-header-align"),
          parts: (
            parts ??
            [
              eyebrow && { name: "eyebrow", box: box(eyebrow), color: getComputedStyle(eyebrow).color },
              h1 && { name: "title", box: box(h1), color: getComputedStyle(h1).color },
              metaEl && { name: "meta", box: box(metaEl), color: getComputedStyle(metaEl).color },
            ].filter(Boolean)
            /* A string that is IN the band but not PAINTED on it is not a
               contrast reading. /contact's band is the photograph alone
               and its h1 is sr-only — a 1x1 clipped box, whose "brightest
               composited pixel" is one pixel of whatever the crop puts at
               the shell's left edge, scored against white type nobody can
               see. Reported as no readings, which is the true answer: that
               band carries no type to fail. Any element under 4px in
               either dimension is off the screen by construction. */
          ).filter((p) => p.box.width >= 4 && p.box.height >= 4),
          img: img
            ? {
                natW: img.naturalWidth,
                natH: img.naturalHeight,
                boxW: Math.round(img.getBoundingClientRect().width),
                boxH: Math.round(img.getBoundingClientRect().height),
                pos: getComputedStyle(img).objectPosition,
              }
            : null,
        };
      });

      if (!geo) {
        await page.close();
        continue;
      }

      // Kill transitions and animations FIRST, or anything carrying
      // `transition-all` stays painted for its full duration.
      await page.addStyleTag({
        content:
          "*,*::before,*::after{transition:none !important;animation:none !important}",
      });
      // Every descendant, not a tag list: /faq's Provisional badge is a
      // span inside the paragraph and its border is a light hairline. The
      // site header is hidden in the same pass, or its own white lockup
      // becomes the brightest "backdrop" pixel of the band behind it — the
      // exact trap verify-hero.mjs's header block documents.
      await page.evaluate(() => {
        const heads = [
          document.querySelector("[data-page-header] header"),
          document.querySelector("body header[data-header-state]"),
        ].filter(Boolean);
        for (const head of heads) {
          head.querySelectorAll("p,h1,span,a,svg,button,img").forEach((e) => {
            e.style.setProperty("visibility", "hidden", "important");
            e.querySelectorAll("*").forEach((c) =>
              c.style.setProperty("visibility", "hidden", "important"),
            );
          });
        }
      });
      await page.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      );

      const sample = async (regs) => {
        const shot = await page.screenshot({ type: "png", encoding: "base64" });
        return page.evaluate(
        async (b64, rs) => {
          const bmp = await createImageBitmap(
            await (await fetch(`data:image/png;base64,${b64}`)).blob(),
          );
          const c = new OffscreenCanvas(bmp.width, bmp.height);
          const ctx = c.getContext("2d");
          ctx.drawImage(bmp, 0, 0);
          return rs.map((r) => {
            const x = Math.max(0, Math.floor(r.x));
            const y = Math.max(0, Math.floor(r.y));
            const wd = Math.min(c.width - x, Math.ceil(r.width));
            const ht = Math.min(c.height - y, Math.ceil(r.height));
            if (wd <= 0 || ht <= 0) return null;
            return Array.from(ctx.getImageData(x, y, wd, ht).data);
          });
        },
        shot,
        regs,
        );
      };

      const px = await sample(geo.parts.map((p) => p.box));

      const extremes = (arr) => {
        if (!arr) return null;
        let hi = -1, lo = 2, hiRgb = null, loRgb = null;
        for (let i = 0; i < arr.length; i += 4) {
          const L = lum(arr[i], arr[i + 1], arr[i + 2]);
          if (L > hi) { hi = L; hiRgb = [arr[i], arr[i + 1], arr[i + 2]]; }
          if (L < lo) { lo = L; loRgb = [arr[i], arr[i + 1], arr[i + 2]]; }
        }
        return { hi, hiRgb, lo, loRgb };
      };

      /* ── The site header, both states ─────────────────────────────
         Transparent first, because the page is already at scroll 0 and
         the type is already hidden. Then scroll past the 96px sentinel,
         wait two frames, and re-read the link colour before scoring the
         second one: the glass state resets the header's type from white
         to --color-ink, and scoring white against a dark glass backdrop
         is how the first version of this measurement in verify-hero.mjs
         reported 1.00:1 for a header that passes. */
      let headerStates = null;
      if (geo.siteHeader) {
        const t = extremes((await sample([geo.siteHeader.box]))[0]);
        const tLight = isLight(geo.siteHeader.color);

        await page.evaluate(() => window.scrollTo(0, 400));
        await page.evaluate(
          () =>
            new Promise((r) =>
              requestAnimationFrame(() => requestAnimationFrame(r)),
            ),
        );
        await new Promise((r) => setTimeout(r, 250));
        const glass = await page.evaluate(() => {
          const h = document.querySelector("body header[data-header-state]");
          return {
            state: h.getAttribute("data-header-state"),
            color: getComputedStyle(h.querySelector("a")).color,
            box: (({ x, y, width, height }) => ({ x, y, width, height }))(
              h.getBoundingClientRect(),
            ),
          };
        });
        const g = extremes((await sample([glass.box]))[0]);
        const gLight = isLight(glass.color);

        headerStates = {
          transparent: {
            state: geo.siteHeader.state,
            rgb: tLight ? t?.hiRgb : t?.loRgb,
            ratio: t ? against(geo.siteHeader.color, tLight ? t.hi : t.lo) : null,
          },
          glass: {
            state: glass.state,
            rgb: gLight ? g?.hiRgb : g?.loRgb,
            ratio: g ? against(glass.color, gLight ? g.hi : g.lo) : null,
          },
        };
      }

      rows.push({
        scheme, route, w,
        bandH: geo.bandH, art: geo.art, img: geo.img,
        headerStates,
        parts: geo.parts.map((p, i) => {
          const ex = extremes(px[i]);
          const light = isLight(p.color);
          return {
            name: p.name,
            light,
            rgb: light ? ex?.hiRgb : ex?.loRgb,
            ratio: ex ? against(p.color, light ? ex.hi : ex.lo) : null,
          };
        }),
      });
      await page.close();
    }
  }
}
await browser.close();

const pad = (v, n) => String(v).padEnd(n);
const cell = (p) =>
  p.ratio === null ? "  -  " : `${p.ratio.toFixed(2)}${p.ratio >= 4.5 ? " " : "!"}`;

for (const scheme of SCHEMES) {
  const group = rows.filter((r) => r.scheme === scheme);
  const routes = [...new Set(group.map((r) => r.route))];

  console.log(`\n=== ${scheme.toUpperCase()} — eyebrow / title / meta, worst composited pixel behind each ===`);
  console.log(pad("route", 34) + pad("art", 7) + WIDTHS.map((w) => pad(w, 22)).join(""));
  console.log("-".repeat(34 + 7 + WIDTHS.length * 22));
  for (const route of routes) {
    const cells = WIDTHS.map((w) => {
      const r = group.find((x) => x.route === route && x.w === w);
      return pad(r ? r.parts.map(cell).join(" ") + `  ${r.bandH}px` : "-", 22);
    });
    const any = group.find((x) => x.route === route);
    console.log(pad(route, 34) + pad(any?.art ?? "?", 7) + cells.join(""));
  }

  const bad = group.flatMap((r) =>
    r.parts.filter((p) => p.ratio !== null && p.ratio < 4.5)
      .map((p) => `${r.route} @${r.w} ${p.name} ${p.ratio.toFixed(2)}:1 on rgb(${p.rgb})`),
  );
  console.log(bad.length ? `\nFAIL (${bad.length}):\n  ` + bad.join("\n  ") : "\nAll strings clear 4.5:1.");

  /* The site header, each state against the colour its type actually is.
     One row per route: lockup, nav links and theme toggle all share the
     header's box and its computed link colour. */
  const withHeader = group.filter((r) => r.headerStates);
  if (withHeader.length) {
    console.log(
      `\n=== ${scheme.toUpperCase()} — site header, transparent (white) / glass (ink) ===`,
    );
    console.log(pad("route", 34) + WIDTHS.map((w) => pad(w, 22)).join(""));
    console.log("-".repeat(34 + WIDTHS.length * 22));
    for (const route of [...new Set(withHeader.map((r) => r.route))]) {
      const cells = WIDTHS.map((w) => {
        const r = withHeader.find((x) => x.route === route && x.w === w);
        if (!r) return pad("-", 22);
        const f = (s) =>
          s.ratio === null
            ? "  -  "
            : `${s.ratio.toFixed(2)}${s.ratio >= 4.5 ? "" : "!"}`;
        return pad(
          `${f(r.headerStates.transparent)} ${r.headerStates.transparent.state.slice(0, 5)} / ${f(r.headerStates.glass)} ${r.headerStates.glass.state.slice(0, 5)}`,
          22,
        );
      });
      console.log(pad(route, 34) + cells.join(""));
    }
    const hbad = withHeader.flatMap((r) =>
      ["transparent", "glass"]
        .filter((k) => r.headerStates[k].ratio !== null && r.headerStates[k].ratio < 4.5)
        .map(
          (k) =>
            `${r.route} @${r.w} header ${k} ${r.headerStates[k].ratio.toFixed(2)}:1 on rgb(${r.headerStates[k].rgb})`,
        ),
    );
    console.log(
      hbad.length
        ? `\nHEADER FAIL (${hbad.length}):\n  ` + hbad.join("\n  ")
        : "\nHeader clears 4.5:1 in both states at every width.",
    );
  }
}

console.log("\n=== worst composited pixel per route, across both schemes and all widths ===");
console.log(pad("route", 34) + pad("worst", 10) + pad("string", 10) + "at");
console.log("-".repeat(70));
for (const route of [...PHOTO, ...FLAT]) {
  let worst = null;
  for (const r of rows.filter((x) => x.route === route)) {
    for (const p of r.parts) {
      if (p.ratio !== null && (!worst || p.ratio < worst.ratio)) {
        worst = { ratio: p.ratio, name: p.name, at: `${r.scheme} ${r.w} rgb(${p.rgb})` };
      }
    }
  }
  if (worst) {
    console.log(pad(route, 34) + pad(`${worst.ratio.toFixed(2)}:1`, 10) + pad(worst.name, 10) + worst.at);
  }
}

console.log("\n=== band height, and how far the FILE ON DISK is stretched to fill it ===");
console.log("(cover: the scale is set by whichever axis has to stretch further)");
console.log(pad("route", 34) + pad("file", 13) + WIDTHS.map((w) => pad(w, 16)).join(""));
console.log("-".repeat(34 + 13 + WIDTHS.length * 16));
for (const route of PHOTO) {
  const src = SOURCES[route];
  if (!src) continue;
  const cells = WIDTHS.map((w) => {
    const r = rows.find((x) => x.route === route && x.w === w && x.img);
    if (!r) return pad("-", 16);
    const s = Math.max(r.img.boxW / src[0], r.img.boxH / src[1]);
    return pad(`${r.bandH}px ${s.toFixed(2)}x`, 16);
  });
  console.log(pad(route, 34) + pad(`${src[0]}x${src[1]}`, 13) + cells.join(""));
}

/* How much of the picture the band actually shows, which is the question
   `position` exists to answer. Reported as the fraction of the source's
   width and height that survives `cover` at each width. */
console.log("\n=== what the crop keeps: fraction of the source width x height ===");
console.log(pad("route", 34) + pad("position", 12) + WIDTHS.map((w) => pad(w, 14)).join(""));
console.log("-".repeat(34 + 12 + WIDTHS.length * 14));
for (const route of PHOTO) {
  const src = SOURCES[route];
  if (!src) continue;
  const any = rows.find((x) => x.route === route && x.img);
  const cells = WIDTHS.map((w) => {
    const r = rows.find((x) => x.route === route && x.w === w && x.img);
    if (!r) return pad("-", 14);
    const s = Math.max(r.img.boxW / src[0], r.img.boxH / src[1]);
    const keptW = Math.min(1, r.img.boxW / (src[0] * s));
    const keptH = Math.min(1, r.img.boxH / (src[1] * s));
    return pad(`${(keptW * 100).toFixed(0)}% x ${(keptH * 100).toFixed(0)}%`, 14);
  });
  console.log(pad(route, 34) + pad(any?.img.pos ?? "-", 12) + cells.join(""));
}
