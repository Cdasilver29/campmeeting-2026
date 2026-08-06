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
const FLAT_ROUTES = ["/speakers", "/ministries/children", "/announcements"];

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
        // The three strings, in DOM order, ignoring the media slot.
        const eyebrow = head.querySelector("p");
        const h1 = head.querySelector("h1");
        const metaEl = head.querySelector("hr + p");
        const img = band.querySelector("img");
        return {
          bandH: Math.round(band.getBoundingClientRect().height),
          art: band.getAttribute("data-header-art"),
          parts: [
            eyebrow && { name: "eyebrow", box: box(eyebrow), color: getComputedStyle(eyebrow).color },
            h1 && { name: "title", box: box(h1), color: getComputedStyle(h1).color },
            metaEl && { name: "meta", box: box(metaEl), color: getComputedStyle(metaEl).color },
          ].filter(Boolean),
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
      // span inside the paragraph and its border is a light hairline.
      await page.evaluate(() => {
        const head = document.querySelector("[data-page-header] header");
        head.querySelectorAll("p,h1,span,a,svg").forEach((e) => {
          e.style.setProperty("visibility", "hidden", "important");
          e.querySelectorAll("*").forEach((c) =>
            c.style.setProperty("visibility", "hidden", "important"),
          );
        });
      });
      await page.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      );

      const shot = await page.screenshot({ type: "png", encoding: "base64" });
      const px = await page.evaluate(
        async (b64, regs) => {
          const bmp = await createImageBitmap(
            await (await fetch(`data:image/png;base64,${b64}`)).blob(),
          );
          const c = new OffscreenCanvas(bmp.width, bmp.height);
          const ctx = c.getContext("2d");
          ctx.drawImage(bmp, 0, 0);
          return regs.map((r) => {
            const x = Math.max(0, Math.floor(r.x));
            const y = Math.max(0, Math.floor(r.y));
            const wd = Math.min(c.width - x, Math.ceil(r.width));
            const ht = Math.min(c.height - y, Math.ceil(r.height));
            if (wd <= 0 || ht <= 0) return null;
            return Array.from(ctx.getImageData(x, y, wd, ht).data);
          });
        },
        shot,
        geo.parts.map((p) => p.box),
      );

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

      rows.push({
        scheme, route, w,
        bandH: geo.bandH, art: geo.art, img: geo.img,
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
