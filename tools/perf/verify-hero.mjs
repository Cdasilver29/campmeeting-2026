/**
 * Hero and header contrast against the REAL built page, not a mock.
 *
 * WHY THE FIRST VERSION OF THIS LIED (1.00:1 on the header, both states)
 *
 * It hid the type with `visibility: hidden` and screenshotted immediately.
 * Every shadcn Button carries `transition-all`, and `visibility` is a
 * transitionable property: Chrome holds it at `visible` for the whole
 * 150ms and flips it at the end. So the theme toggle's white icon was
 * still painted when the shot was taken, and the "brightest backdrop
 * pixel" it found was that icon — pure white, 1.00:1, in both states.
 *
 * Two fixes below: transitions and animations are killed before anything
 * is hidden, and every descendant is hidden rather than a chosen list of
 * tags.
 *
 * WHY NOTHING HERE IS MEASURED AGAINST WHITE UNCONDITIONALLY
 *
 * Over the photograph the header's type is white, so the hazard is the
 * BRIGHTEST backdrop pixel. Once the header takes its own glass surface
 * the type is --color-ink, so the hazard inverts: the risk is a DARK
 * pixel showing through the translucent surface. Measuring white against
 * the glass state would be measuring a colour that is never used there.
 *
 * The hero text now needs the same treatment, for the same reason. Below
 * md the frame is 4:3 and the text block sits under it on the page
 * surface in --color-ink; from md it is white over the photograph. So the
 * type's own computed colour is read at each width and the ratio is
 * computed against the extreme that can actually hurt it — brightest for
 * light type, darkest for dark type. Hardcoding white would have reported
 * 1.00:1 for a 390px hero whose text is ink on white and is fine, which
 * is precisely the failure mode the header block above documents.
 *
 * WHY THE COLOUR SCHEME IS FORCED, AND WHAT IT WAS REPORTING BEFORE
 *
 * This harness never set `prefers-color-scheme`, so it measured whatever
 * the machine's headless Chrome happened to report. On the box this pass
 * was run on that is DARK, and the consequence was not a small one: the
 * glass header's backdrop is `bg-surface/80`, which in dark mode is a
 * dark plum at 80% and not a white at 80%. The harness then scored it
 * with a hardcoded light-mode ink luminance and against the DARKEST
 * pixel, which is the wrong extreme for light type. It returned 0.93:1
 * for a header that is fine, and it would have returned a passing number
 * for one that was not.
 *
 * So the scheme is now an argument, both schemes are measured, and the
 * ink colour and the hazard direction are read out of the page at each
 * width rather than compiled in. Light type is scored against the
 * brightest backdrop pixel and dark type against the darkest, in both
 * schemes, because which one the type is is now a question with two
 * answers rather than one.
 *
 * WHY A LAYER HAS TO BE FORCED, AND WHY WITH A STYLESHEET
 *
 * The hero rotates four photographs, each carrying its own pair of
 * scrims, and the whole point of per-image scrims is that one image can be
 * given more alpha than the others. That makes "the hero's contrast" four
 * separate questions, so `--layer N` measures one of them: layer N is
 * pinned to opacity 1 and the rest to 0.
 *
 * Pinned with an injected stylesheet carrying `!important`, not by writing
 * `el.style.opacity`. The opacity is React state on a six-second interval,
 * so an inline write is undone on the next render — which on a slow shot
 * means measuring a crossfade in progress, and a crossfade in progress is
 * two photographs at partial alpha and a number that describes neither.
 *
 * The scrim and image queries are scoped to the forced layer for the same
 * reason. `hero.querySelectorAll("div[aria-hidden]")` now matches every
 * layer WRAPPER as well as their scrims, so unscoped it reported the
 * frame's own height as a scrim height.
 *
 * Usage: node verify-hero.mjs <screenshot-output-dir> [forcePhase] [scheme] [--layer N]
 *
 * forcePhase is "before" | "during" | "after". Everything phase-dependent
 * in the hero reads one data-hero-phase attribute through group-data
 * variants, so setting that attribute is enough to measure a phase the
 * calendar is not currently in.
 *
 * scheme is "light" | "dark" | "both" (default "both").
 *
 * WHAT --layer SELECTS, NOW THAT IT SELECTS TWO THINGS
 *
 * The caption belongs to the photograph, so `--layer N` now pins layer N
 * AND reports layer N's caption. Layer 0 has no caption and that section
 * is simply absent from its output. Layer 1 is the Migori choir, layer 2
 * is Taji Kenya and layer 3 is the host choir, so those three runs are the
 * ones that measure a caption.
 *
 * Exits non-zero if anything measured falls under 4.5:1, the captions
 * included.
 */
import { launch } from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3100";
const ALL_VIEWPORTS = [
  { w: 390, h: 844 }, { w: 768, h: 1024 }, { w: 1024, h: 768 },
  { w: 1440, h: 900 }, { w: 1920, h: 1080 }, { w: 2560, h: 1440 },
];
/* `--widths 390,768,1440` narrows the sweep. Four photographs x six
   viewports x two schemes is 36 page loads to answer a question that three
   widths answer, and re-measuring a width nothing changed at is not
   evidence. Heights are kept from the table above so a narrowed run is
   still measuring the same frames. */
const widthArg = process.argv.indexOf("--widths");
const VIEWPORTS =
  widthArg === -1
    ? ALL_VIEWPORTS
    : process.argv[widthArg + 1]
        .split(",")
        .map(Number)
        .map((w) => ALL_VIEWPORTS.find((v) => v.w === w) ?? { w, h: 900 });

/* The files on disk, for the true upscale factor. img.naturalWidth reports
   the srcset variant Chrome chose, which is a different question. Indexed
   by layer, mirroring HERO_IMAGES in src/lib/hero.ts. */
const SOURCES = [
  { name: "hands-bible", w: 735, h: 616 },
  { name: "migori-choir", w: 1600, h: 885 },
  { name: "taji-choir", w: 1491, h: 1055 },
  /* Layer 3, the host choir. Added with the photograph rather than after
     it: `SOURCES[LAYER] ?? SOURCES[0]` falls back silently, so a missing
     row here does not error — it reports the upscale column using
     hands-bible's dimensions and labels it with hands-bible's name, which
     is a wrong number that looks like a right one.

     The first two rows are stale for the same class of reason and are
     left alone deliberately: both files were re-cut to 1672x941 in a later
     drop and these numbers were not updated with them. That affects only
     the upscale column, never the contrast gate, and correcting it is not
     this change's business. */
  { name: "newlife-choir", w: 1629, h: 917 },
];

const layerArg = process.argv.indexOf("--layer");
const LAYER = layerArg === -1 ? 0 : Number(process.argv[layerArg + 1]);
const SOURCE = SOURCES[LAYER] ?? SOURCES[0];

const lin = (v) => { const x = v / 255; return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const parse = (css) => css.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
/** Contrast of an arbitrary type colour against a backdrop luminance. */
const against = (typeCss, L) => {
  const tl = lum(...parse(typeCss));
  return (Math.max(tl, L) + 0.05) / (Math.min(tl, L) + 0.05);
};
/** Light type is hurt by a bright backdrop; dark type by a dark one. */
const isLight = (css) => lum(...parse(css)) > 0.4;

const schemeArg = process.argv[4] ?? "both";
const SCHEMES = schemeArg === "both" ? ["light", "dark"] : [schemeArg];

const browser = await launch({
  executablePath: CHROME, headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--force-device-scale-factor=1"],
});
const rows = [];

for (const scheme of SCHEMES) {
for (const v of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: v.w, height: v.h, deviceScaleFactor: 1 });
  // Before the navigation, so the very first paint is already in the
  // scheme being measured and next-themes resolves "system" to it.
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: scheme }]);
  await page.setRequestInterception(true);
  page.on("request", (r) => {
    if (/\/serwist\/|sw\.js/.test(r.url())) r.abort().catch(() => {});
    else r.continue().catch(() => {});
  });
  await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 600));

  /* Pin the layer under measurement before anything is read, with a
     stylesheet rather than an inline write: the opacity is React state on
     an interval and an inline write is undone on the next render. Also
     kill the transition, so nothing is caught mid-crossfade. */
  await page.addStyleTag({
    content:
      `[data-hero-layer]{transition:none !important}` +
      `[data-hero-layer="${LAYER}"]{opacity:1 !important}` +
      `[data-hero-layer]:not([data-hero-layer="${LAYER}"]){opacity:0 !important}`,
  });
  /* Layers past the first mount in an effect and are lazy, so they exist
     but may not have decoded yet. Waiting on the forced layer's own image
     rather than on the page: `load` fired long before this layer existed. */
  await page.evaluate(async (layer) => {
    const img = document.querySelector(`[data-hero-layer="${layer}"] img`);
    if (img && !img.complete) await img.decode().catch(() => {});
  }, LAYER);
  await new Promise((r) => setTimeout(r, 300));

  const forcePhase = process.argv[3];
  if (forcePhase) {
    await page.evaluate((p) => {
      document.getElementById("home-hero").setAttribute("data-hero-phase", p);
    }, forcePhase);
    await new Promise((r) => setTimeout(r, 200));
  }

  const geo = await page.evaluate((layer) => {
    const hero = document.getElementById("home-hero");
    const frame = hero.querySelector(`[data-hero-layer="${layer}"]`);
    const h1 = hero.querySelector("h1");
    /* The whole text block, not h1 + its two next siblings. The hero
       gained the poster's theme, key verse and theme song, so "the h1 and
       the next two elements" stopped describing it and the region being
       scanned quietly excluded the call to action. home-hero-text is the
       RevealGroup, which is the block itself. */
    const block = document.getElementById("home-hero-text");
    const header = document.querySelector("header");
    const img = frame ? frame.querySelector("img") : hero.querySelector("img");
    const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
    /* Scoped to the forced layer's own children. It used to be any
       `div[aria-hidden]` at any depth inside the hero, which was right
       while there was one frame with two scrims in it. There are now three
       layer WRAPPERS, each aria-hidden and each the full height of the
       frame, so the unscoped query reported the frame height as a scrim
       height three times over before this was scoped. */
    const scrims = [...(frame ?? hero).querySelectorAll(":scope > div[aria-hidden]")]
      .filter((e) => getComputedStyle(e).display !== "none")
      .map((e) => Math.round(e.getBoundingClientRect().height));
    /* The colour the title is actually set in at this width, so the ratio
       below is computed against the extreme that can hurt it. */
    const typeColor = getComputedStyle(h1).color;
    /* ── THE CAPTION IS MEASURED SEPARATELY, ON PURPOSE ────────────────
       The block reading above is the WORST pixel anywhere under
       #home-hero-text, scored against the h1's colour. The caption is
       inside that block, so a passing block reading does bound it — but
       "bounded by something else's number" is not a measurement of this
       string, and the caption is the one line in the hero whose text
       changes when a choir is renamed. tools/perf/caption-fit.mjs checks
       that it fits; nothing checked what it sat on.

       So each caption's own box is measured, keyed by its own text, and
       against its own computed colour.

       WHICH CAPTION GOES WITH WHICH PHOTOGRAPH: the paragraphs are
       rendered by the same `images.map` as the layers, so DOM order IS
       layer order and captions[LAYER] is the caption of the picture
       --layer has pinned. Their own opacity is irrelevant here — every
       string in the hero is hidden before the screenshot regardless — so
       nothing needs pinning beyond the layer that is already pinned.

       The rect is a RANGE over the text, not the element box. The element
       is `inset-x-0` and so spans the whole caption row however short the
       string is; measuring that would score pixels to the right of the
       text that the text never covers. A range gives the painted extent,
       which is the region the words are actually legible against. */
    const captions = [...hero.querySelectorAll("#home-hero-text p")]
      .filter((p) => {
        const cs = getComputedStyle(p);
        return cs.position === "absolute" && parseFloat(cs.lineHeight) === 20;
      })
      .map((p) => {
        const text = (p.textContent || "").trim();
        const range = document.createRange();
        range.selectNodeContents(p);
        const r = range.getBoundingClientRect();
        return {
          text,
          color: getComputedStyle(p).color,
          box:
            r.width > 0 && r.height > 0
              ? { x: r.x, y: r.y, width: r.width, height: r.height }
              : box(p),
        };
      });
    /* And the colour the HEADER type is actually set in, in each state.
       Read here, before anything is hidden. In the transparent state
       every string in the header is forced white; in the glass state it
       follows --color-ink, which is dark in light mode and light in dark
       mode. Hardcoding either one is how this reported 0.93:1 for a
       header that passes. */
    const headerLinkColor = getComputedStyle(header.querySelector("a")).color;
    const rs = [block.getBoundingClientRect()];
    const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y));
    const x2 = Math.max(...rs.map((r) => r.right)), y2 = Math.max(...rs.map((r) => r.bottom));
    return {
      text: { x, y, width: x2 - x, height: y2 - y }, header: box(header), typeColor, headerLinkColor, captions,
      heroH: Math.round(hero.getBoundingClientRect().height),
      /* How far the type reaches from the bottom of the frame, and how
         tall the bottom scrim is, so coverage can be judged against the
         footprint it exists to protect. */
      textFootprint: Math.round(hero.getBoundingClientRect().bottom - y),
      scrimHeights: scrims,
      phase: hero.getAttribute("data-hero-phase"),
      natW: img.naturalWidth, natH: img.naturalHeight,
      renderW: Math.round(img.getBoundingClientRect().width),
      renderH: Math.round(img.getBoundingClientRect().height),
    };
  }, LAYER);

  /* Kill transitions and animations FIRST. Without this, anything with
     `transition-all` ignores the hide for its full duration. */
  await page.addStyleTag({
    content: "*,*::before,*::after{transition:none !important;animation:none !important}",
  });

  const hideType = () => page.evaluate(() => {
    const hero = document.getElementById("home-hero");
    // Every descendant, not a tag list: the icon inside a button is not
    // an <a>, a <button> or a <span>.
    hero.querySelectorAll("h1,p,a,button").forEach((e) => {
      e.style.setProperty("visibility", "hidden", "important");
      e.querySelectorAll("*").forEach((c) => c.style.setProperty("visibility", "hidden", "important"));
    });
    document.querySelector("header").querySelectorAll("*").forEach((e) =>
      e.style.setProperty("visibility", "hidden", "important"));
  });
  const showType = () => page.evaluate(() => {
    document.querySelectorAll("[style*='visibility']").forEach((e) => e.style.removeProperty("visibility"));
  });
  // Two frames, so the hide is committed to the compositor before capture.
  const settle = () => page.evaluate(() => new Promise((r) =>
    requestAnimationFrame(() => requestAnimationFrame(r))));

  const scan = async (regions) => {
    const shot = await page.screenshot({ type: "png", encoding: "base64" });
    return await page.evaluate(async (b64, regs) => {
      const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
      const c = new OffscreenCanvas(bmp.width, bmp.height);
      const ctx = c.getContext("2d"); ctx.drawImage(bmp, 0, 0);
      const out = {};
      for (const [k, r] of Object.entries(regs)) {
        const x = Math.max(0, Math.floor(r.x)), y = Math.max(0, Math.floor(r.y));
        const w = Math.min(c.width - x, Math.ceil(r.width)), h = Math.min(c.height - y, Math.ceil(r.height));
        out[k] = w <= 0 || h <= 0 ? null : Array.from(ctx.getImageData(x, y, w, h).data);
      }
      return out;
    }, shot, regions);
  };

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

  await hideType();
  await settle();
  /* The caption of the pinned layer, scanned in the same screenshot as
     the block. A second shot would be a second render of a rotating hero
     and there would be no guarantee it caught the same photograph. */
  const cap = geo.captions[LAYER];
  const px = await scan({
    text: geo.text,
    header: geo.header,
    ...(cap && cap.text ? { caption: cap.box } : {}),
  });
  const t = extremes(px.text), hd = extremes(px.header);
  const capEx = extremes(px.caption);

  // Glass state: scroll past the sentinel, re-measure the header only.
  await page.evaluate(() => window.scrollTo(0, 400));
  await new Promise((r) => setTimeout(r, 400));
  await hideType();
  await settle();
  const glass = await page.evaluate(() => ({
    state: document.querySelector("header").getAttribute("data-header-state"),
    // The glass state resets the header type to --color-ink, so its colour
    // has to be re-read here rather than reused from the transparent state.
    linkColor: getComputedStyle(document.querySelector("header a")).color,
  }));
  const hg = extremes((await scan({ header: geo.header })).header);

  rows.push({ scheme, v, geo, t, hd, hg, cap, capEx, glassState: glass.state, glassLinkColor: glass.linkColor });

  if (v.w === 1920 || v.w === 2560) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await showType();
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({
      // Phase in the name: two runs into one directory otherwise leaves
      // the second phase's shots labelled as the first's.
      path: `${process.argv[2]}/hero-${geo.phase}-${scheme}-${v.w}.png`,
      clip: { x: 0, y: 0, width: v.w, height: Math.min(v.h, 900) },
    });
  }
  await page.close();
}
}
await browser.close();

const pad = (s, n) => String(s).padEnd(n);
const verdict = (r) => `${r.toFixed(2)}:1 ${r >= 4.5 ? "PASS" : "FAIL"}`;

/*
 * The type's own colour decides which extreme is the hazard: light type is
 * scored against the BRIGHTEST backdrop pixel it sits on, dark type against
 * the DARKEST. Both cases now occur in both schemes — the hero title is
 * white over the photograph and ink under it, and the header's type is
 * white when transparent and --color-ink when glass — so neither the
 * colour nor the direction can be compiled in.
 */
const pick = (typeCss, ex) => ({
  ratio: against(typeCss, isLight(typeCss) ? ex.hi : ex.lo),
  rgb: isLight(typeCss) ? ex.hiRgb : ex.loRgb,
});

for (const scheme of SCHEMES) {
  const group = rows.filter((r) => r.scheme === scheme);
  console.log(`
=== ${scheme.toUpperCase()} — hero text, phase=${group[0].geo.phase} ===`);
  console.log(pad("viewport", 12) + pad("heroH", 8) + pad("scrims", 14) + pad("footprint", 12)
    + pad("type", 22) + pad("worst px", 18) + "AA");
  console.log("-".repeat(100));
  for (const r of group) {
    const p = pick(r.geo.typeColor, r.t);
    console.log(pad(`${r.v.w}x${r.v.h}`, 12) + pad(r.geo.heroH, 8)
      + pad((r.geo.scrimHeights.join("/") || "-") + "px", 14)
      + pad(`${r.geo.textFootprint}px`, 12)
      + pad(isLight(r.geo.typeColor) ? "white (brightest px)" : "ink (darkest px)", 22)
      + pad(`rgb(${p.rgb})`, 18) + verdict(p.ratio));
  }

  const withCaption = group.filter((r) => r.cap && r.cap.text && r.capEx);
  if (withCaption.length) {
    console.log(`
=== ${scheme.toUpperCase()} — caption, layer ${LAYER} (${SOURCE.name}) ===`);
    console.log(pad("viewport", 12) + pad("caption", 40) + pad("box", 16)
      + pad("type", 22) + pad("worst px", 18) + "AA");
    console.log("-".repeat(112));
    for (const r of withCaption) {
      const p = pick(r.cap.color, r.capEx);
      console.log(pad(`${r.v.w}x${r.v.h}`, 12) + pad(r.cap.text.slice(0, 38), 40)
        + pad(`${Math.round(r.cap.box.width)}x${Math.round(r.cap.box.height)}`, 16)
        + pad(isLight(r.cap.color) ? "white (brightest px)" : "ink (darkest px)", 22)
        + pad(`rgb(${p.rgb})`, 18) + verdict(p.ratio));
    }
  }

  console.log(`
=== ${scheme.toUpperCase()} — header, each state against the colour its type actually is ===`);
  console.log(pad("viewport", 12) + pad("transparent", 36) + "glass");
  console.log("-".repeat(84));
  for (const r of group) {
    const t = pick(r.geo.headerLinkColor, r.hd);
    const g = pick(r.glassLinkColor, r.hg);
    console.log(pad(`${r.v.w}x${r.v.h}`, 12)
      + pad(`rgb(${t.rgb})  ${verdict(t.ratio)}`, 36)
      + `rgb(${g.rgb})  ${verdict(g.ratio)}   [${r.glassState}]`);
  }
}

console.log(`
=== upscale (file on disk ${SOURCE.w}x${SOURCE.h}) ===`);
for (const r of rows.filter((r) => r.scheme === SCHEMES[0])) {
  const s = Math.max(r.geo.renderW / SOURCE.w, r.geo.renderH / SOURCE.h);
  const served = Math.max(r.geo.renderW / r.geo.natW, r.geo.renderH / r.geo.natH);
  console.log(pad(`${r.v.w}x${r.v.h}`, 12) + `css box ${r.geo.renderW}x${r.geo.renderH}  `
    + `vs source ${s.toFixed(3)}x (DPR2 ${(s * 2).toFixed(2)}x)  `
    + `vs served ${r.geo.natW}w ${served.toFixed(3)}x`);
}

const worst = (fn) => Math.min(...rows.map(fn));
const wt = worst((r) => pick(r.geo.typeColor, r.t).ratio);
const wh = worst((r) => pick(r.geo.headerLinkColor, r.hd).ratio);
const wg = worst((r) => pick(r.glassLinkColor, r.hg).ratio);
const capRows = rows.filter((r) => r.cap && r.cap.text && r.capEx);
const wc = capRows.length
  ? Math.min(...capRows.map((r) => pick(r.cap.color, r.capEx).ratio))
  : null;
console.log(`
worst across both schemes: hero text ${wt.toFixed(2)}:1   header transparent ${wh.toFixed(2)}:1   header glass ${wg.toFixed(2)}:1`
  + (wc === null ? "   caption n/a (layer has none)" : `   caption ${wc.toFixed(2)}:1`));

/* Exit code, so this can gate a commit rather than only be read. The
   caption is included: it is white type over a photograph at every width
   and a rename can put a longer string on unmeasured pixels. */
const floor = Math.min(wt, wh, wg, wc ?? Infinity);
process.exit(floor >= 4.5 ? 0 : 1);
