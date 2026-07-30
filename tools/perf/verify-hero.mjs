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
 * WHY THE HEADER IS NOT MEASURED AGAINST WHITE IN BOTH STATES
 *
 * Over the photograph the header's type is white, so the hazard is the
 * BRIGHTEST backdrop pixel. Once the header takes its own glass surface
 * the type is --color-ink, so the hazard inverts: the risk is a DARK
 * pixel showing through the translucent surface. Measuring white against
 * the glass state would be measuring a colour that is never used there.
 *
 * Usage: node verify-hero.mjs <screenshot-output-dir> [forcePhase]
 *
 * forcePhase is "before" | "during" | "after". Everything phase-dependent
 * in the hero reads one data-hero-phase attribute through group-data
 * variants, so setting that attribute is enough to measure a phase the
 * calendar is not currently in.
 */
import { launch } from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3100";
const VIEWPORTS = [
  { w: 390, h: 844 }, { w: 768, h: 1024 }, { w: 1024, h: 768 },
  { w: 1440, h: 900 }, { w: 1920, h: 1080 }, { w: 2560, h: 1440 },
];

/* The file on disk, for the true upscale factor. img.naturalWidth reports
   the srcset variant Chrome chose, which is a different question. */
const SOURCE = { w: 1634, h: 962 };

const lin = (v) => { const x = v / 255; return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
/** Contrast of white against a backdrop luminance. */
const cw = (L) => 1.05 / (L + 0.05);
/** --color-ink #10202e, relative luminance 0.01341. */
const INK_L = lum(16, 32, 46);
/** Contrast of ink against a backdrop luminance. */
const ci = (L) => (L + 0.05) / (INK_L + 0.05);

const browser = await launch({
  executablePath: CHROME, headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--force-device-scale-factor=1"],
});
const rows = [];

for (const v of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: v.w, height: v.h, deviceScaleFactor: 1 });
  await page.setRequestInterception(true);
  page.on("request", (r) => {
    if (/\/serwist\/|sw\.js/.test(r.url())) r.abort().catch(() => {});
    else r.continue().catch(() => {});
  });
  await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 600));

  const forcePhase = process.argv[3];
  if (forcePhase) {
    await page.evaluate((p) => {
      document.getElementById("home-hero").setAttribute("data-hero-phase", p);
    }, forcePhase);
    await new Promise((r) => setTimeout(r, 200));
  }

  const geo = await page.evaluate(() => {
    const hero = document.getElementById("home-hero");
    const h1 = hero.querySelector("h1");
    const meta = h1.nextElementSibling;
    const cta = meta.nextElementSibling;
    const header = document.querySelector("header");
    const img = hero.querySelector("img");
    const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
    const scrims = [...hero.querySelectorAll(":scope > div[aria-hidden]")].map((e) =>
      Math.round(e.getBoundingClientRect().height));
    const rs = [h1, meta, cta].map((e) => e.getBoundingClientRect());
    const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y));
    const x2 = Math.max(...rs.map((r) => r.right)), y2 = Math.max(...rs.map((r) => r.bottom));
    return {
      text: { x, y, width: x2 - x, height: y2 - y }, header: box(header),
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
  });

  /* Kill transitions and animations FIRST. Without this, anything with
     `transition-all` ignores the hide for its full duration. */
  await page.addStyleTag({
    content: "*,*::before,*::after{transition:none !important;animation:none !important}",
  });

  const hideType = () => page.evaluate(() => {
    const hero = document.getElementById("home-hero");
    // Every descendant, not a tag list: the icon inside a button is not
    // an <a>, a <button> or a <span>.
    hero.querySelectorAll("h1,p,a").forEach((e) => {
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
  const px = await scan({ text: geo.text, header: geo.header });
  const t = extremes(px.text), hd = extremes(px.header);

  // Glass state: scroll past the sentinel, re-measure the header only.
  await page.evaluate(() => window.scrollTo(0, 400));
  await new Promise((r) => setTimeout(r, 400));
  await hideType();
  await settle();
  const glassState = await page.evaluate(() =>
    document.querySelector("header").getAttribute("data-header-state"));
  const hg = extremes((await scan({ header: geo.header })).header);

  rows.push({ v, geo, t, hd, hg, glassState });

  if (v.w === 1920 || v.w === 2560) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await showType();
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({
      // Phase in the name: two runs into one directory otherwise leaves
      // the second phase's shots labelled as the first's.
      path: `${process.argv[2]}/hero-${geo.phase}-${v.w}.png`,
      clip: { x: 0, y: 0, width: v.w, height: Math.min(v.h, 900) },
    });
  }
  await page.close();
}
await browser.close();

const pad = (s, n) => String(s).padEnd(n);
const verdict = (r) => `${r.toFixed(2)}:1 ${r >= 4.5 ? "PASS" : "FAIL"}`;

console.log("\n=== hero text, white on the brightest composited pixel, phase=" + rows[0].geo.phase + " ===");
console.log(pad("viewport", 12) + pad("heroH", 8) + pad("scrims", 14) + pad("footprint", 12) + pad("worst px", 18) + "white AA");
console.log("-".repeat(80));
for (const r of rows) {
  console.log(pad(`${r.v.w}x${r.v.h}`, 12) + pad(r.geo.heroH, 8)
    + pad(r.geo.scrimHeights.join("/") + "px", 14)
    + pad(`${r.geo.textFootprint}px`, 12)
    + pad(`rgb(${r.t.hiRgb})`, 18) + verdict(cw(r.t.hi)));
}

console.log("\n=== header, each state against the colour its type actually is ===");
console.log(pad("viewport", 12) + pad("transparent: white on brightest", 34) + "glass: ink on darkest");
console.log("-".repeat(80));
for (const r of rows) {
  console.log(pad(`${r.v.w}x${r.v.h}`, 12)
    + pad(`rgb(${r.hd.hiRgb})  ${verdict(cw(r.hd.hi))}`, 34)
    + `rgb(${r.hg.loRgb})  ${verdict(ci(r.hg.lo))}   [${r.glassState}]`);
}

console.log(`\n=== upscale (file on disk ${SOURCE.w}x${SOURCE.h}) ===`);
for (const r of rows) {
  const s = Math.max(r.geo.renderW / SOURCE.w, r.geo.renderH / SOURCE.h);
  const served = Math.max(r.geo.renderW / r.geo.natW, r.geo.renderH / r.geo.natH);
  console.log(pad(`${r.v.w}x${r.v.h}`, 12) + `css box ${r.geo.renderW}x${r.geo.renderH}  `
    + `vs source ${s.toFixed(3)}x (DPR2 ${(s * 2).toFixed(2)}x)  `
    + `vs served ${r.geo.natW}w ${served.toFixed(3)}x`);
}

const wt = Math.min(...rows.map((r) => cw(r.t.hi)));
const wh = Math.min(...rows.map((r) => cw(r.hd.hi)));
const wg = Math.min(...rows.map((r) => ci(r.hg.lo)));
console.log(`\nworst: hero text ${wt.toFixed(2)}:1   header transparent ${wh.toFixed(2)}:1   header glass ${wg.toFixed(2)}:1`);
