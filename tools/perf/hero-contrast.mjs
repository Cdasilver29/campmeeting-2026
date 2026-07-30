/**
 * Hero contrast, measured rather than modelled.
 *
 * Builds the candidate hero in a real headless Chrome at each viewport
 * width, so object-cover crops exactly as it will on the site and the two
 * gradient scrims composite through Chrome's own painter. Then screenshots
 * it, walks every pixel of the text block's bounding box, and reports the
 * BRIGHTEST one as a contrast ratio against white.
 *
 * Brightest, not average: a mean hides the clipped cloud that is the whole
 * problem with this photograph.
 *
 * Usage: node hero-contrast.mjs [heightMode] [topStops] [bottomStops]
 *   heightMode  "full" (h-svh, pre-event) or "60" (60svh, during/after)
 */
import { launch } from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const IMAGE = "http://localhost:3100/hero/church.webp";

/*
 * The scrim ink. Near-black #0b0f14 rather than the brand navy: black is
 * darker, so it protects type at a lower alpha, and it darkens without
 * tinting so the photograph keeps its own colour. Measured over a pure-
 * white pixel, the alpha each ink needs before white type reaches 4.5:1:
 *
 *   navy #052252   0.62
 *   #0b0f14        0.57
 *   pure black     0.54
 *
 * Keep in sync with SCRIM_INK in src/lib/hero.ts.
 */
const INK = "11, 15, 20"; /* #0b0f14 */

/** width x height pairs: the crop depends on container aspect ratio. */
const VIEWPORTS = [
  { width: 390, height: 844, note: "iPhone 14 Pro" },
  { width: 768, height: 1024, note: "iPad portrait" },
  { width: 1024, height: 768, note: "iPad landscape" },
  { width: 1440, height: 900, note: "laptop" },
  { width: 1920, height: 1080, note: "desktop" },
];

const heightMode = process.argv[2] ?? "full";

/*
 * Stops are expressed across each scrim element's OWN height, and the
 * element is what decides how much of the frame is covered. Mixing the
 * two (a 44%-tall element whose gradient also ends at 44%) kills the
 * gradient at 19% of the frame and leaves the top of the text block bare.
 *
 * The floor both scrims have to clear: #0b0f14 over a pure-white pixel
 * needs alpha >= 0.57 for white type to reach 4.5:1, and 0.58 is used so
 * the margin is not one rounding step wide. Wherever type sits, alpha
 * stays above that and only then fades.
 */
const topStops =
  process.argv[3] ??
  `rgba(${INK}, 0.62) 0px, rgba(${INK}, 0.60) 80px, rgba(${INK}, 0.44) 104px, rgba(${INK}, 0.22) 130px, rgba(${INK}, 0.08) 152px, rgba(${INK}, 0) 176px`;
const bottomStops =
  process.argv[4] ??
  `rgba(${INK}, 0.62) 0%, rgba(${INK}, 0.60) 70%, rgba(${INK}, 0.58) 82%, rgba(${INK}, 0.40) 88%, rgba(${INK}, 0.20) 93%, rgba(${INK}, 0.07) 97%, rgba(${INK}, 0) 100%`;
/*
 * A percentage alone cannot work. The text block is a fixed number of
 * pixels tall, the hero is not, so at 60svh on a short viewport 45% of
 * the frame is shorter than the type sitting in it and the top of the
 * title lands where the scrim has already faded out. The floor keeps the
 * dense part of the gradient behind the type at every height.
 */
const bottomHeight = process.argv[5] ?? "max(30%, 20rem)";

function srgbToLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance. */
function luminance(r, g, b) {
  return (
    0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
  );
}

/** Contrast of white against a background luminance. */
function contrastWithWhite(bgLuminance) {
  return 1.05 / (bgLuminance + 0.05);
}

/* White needs 4.5:1, so the background must stay at or below this. */
const MAX_BG_LUMINANCE = 1.05 / 4.5 - 0.05;

function heroHtml(mode) {
  const height = mode === "full" ? "100svh" : "60svh";
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #052252; }
  .hero { position: relative; isolation: isolate; height: ${height};
          overflow: hidden; background: #052252;
          display: flex; flex-direction: column; justify-content: flex-end; }
  .hero img { position: absolute; inset: 0; width: 100%; height: 100%;
              object-fit: cover; z-index: -20; }
  /* Top scrim: sits only behind the header. */
  .scrim-top { position: absolute; top: 0; left: 0; right: 0; height: 176px;
               z-index: -10; pointer-events: none;
               background: linear-gradient(to bottom, ${topStops}); }
  /* Bottom scrim: behind the text block and no further. */
  .scrim-bottom { position: absolute; bottom: 0; left: 0; right: 0;
                  height: ${bottomHeight};
                  z-index: -10; pointer-events: none;
                  background: linear-gradient(to top, ${bottomStops}); }
  .wrap { width: 100%; max-width: 64rem; margin: 0 auto; padding: 0 1.5rem 4rem; }
  #textblock { display: flex; flex-direction: column; gap: 1rem;
               max-width: 42rem; color: #fff; }
  .eyebrow { font: 600 0.875rem/1.25rem system-ui; letter-spacing: .1em;
             text-transform: uppercase; }
  .title { font: 400 clamp(2.75rem, 1.5rem + 5vw, 5.5rem)/1.02 Georgia, serif; }
  .meta { font: 400 1.125rem/1.75rem system-ui; }
  .cta { align-self: flex-start; background: #fff; color: #052252;
         padding: .625rem 1.25rem; border-radius: 5px;
         font: 500 0.875rem/1.25rem system-ui; }
  /* The header strip, so the top scrim is measured where the nav sits.
     5rem tall, matching --spacing-header: the box the type sits in is
     what the top scrim has to cover, and a shorter mock box would sample
     only the densest part of the gradient and pass too easily. */
  #headerblock { position: absolute; top: 0; left: 0; right: 0; height: 5rem;
                 display: flex; align-items: center; justify-content: space-between;
                 max-width: 64rem; margin: 0 auto; padding: 0 1.5rem;
                 color: #fff; font: 500 0.875rem/1.25rem system-ui; }
</style></head>
<body>
  <section class="hero">
    <img src="${IMAGE}" alt="">
    <div class="scrim-top"></div>
    <div class="scrim-bottom"></div>
    <div id="headerblock"><span>Camp Meeting 2026</span><span>Today Schedule Speakers Ministries About</span></div>
    <div class="wrap">
      <!-- Matches the shipped block: title, one meta line, CTA. The
           church-name eyebrow is gone; the header lockup carries it. -->
      <div id="textblock">
        <h1 class="title">Camp Meeting 2026</h1>
        <p class="meta">15 to 22 August 2026 at 5th Ngong Avenue, Nairobi</p>
        <span class="cta">See the programme</span>
      </div>
    </div>
  </section>
</body></html>`;
}

const browser = await launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--force-device-scale-factor=1"],
});

console.log(`\nheight mode: ${heightMode === "full" ? "h-svh (pre-event)" : "60svh (during / after)"}`);
console.log(`top scrim:    linear-gradient(to bottom, ${topStops})`);
console.log(`bottom scrim: linear-gradient(to top, ${bottomStops})`);
console.log(
  `\nwhite passes AA where the brightest composited pixel has luminance <= ${MAX_BG_LUMINANCE.toFixed(4)}\n`,
);

const rows = [];

for (const viewport of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
  });
  await page.setContent(heroHtml(heightMode), { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);

  const boxes = await page.evaluate(() => {
    const rect = (selector) => {
      const r = document.querySelector(selector).getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    const hero = document.querySelector(".hero").getBoundingClientRect();
    const scrim = document.querySelector(".scrim-bottom").getBoundingClientRect();
    return {
      text: rect("#textblock"),
      header: rect("#headerblock"),
      geometry: {
        heroHeight: Math.round(hero.height),
        scrimHeight: Math.round(scrim.height),
        scrimPercent: Math.round((scrim.height / hero.height) * 100),
        textHeight: Math.round(rect("#textblock").height),
        // How far up the scrim the top of the type sits. Above ~70% the
        // gradient has faded too far to protect it.
        textTopUpScrim: Math.round(
          ((hero.bottom - rect("#textblock").y) / scrim.height) * 100,
        ),
      },
    };
  });

  // Hide the type but keep its box: visibility, not display, so layout is
  // untouched and the boxes measured above still describe the same region.
  // Sampling the backdrop with the glyphs gone is the only way to measure
  // the backdrop — filtering "near-white" pixels out of a screenshot that
  // contains white text also filters out the clipped cloud that is the
  // entire hazard.
  await page.evaluate(() => {
    for (const selector of ["#textblock", "#headerblock"]) {
      document.querySelector(selector).style.visibility = "hidden";
    }
  });

  const shot = await page.screenshot({ type: "png", encoding: "base64" });

  // Decode and scan in-page: Chrome already has a PNG decoder and a
  // canvas, so no image library is needed on the Node side.
  const measured = await page.evaluate(
    async (shotBase64, regions) => {
      const bitmap = await createImageBitmap(
        await (await fetch(`data:image/png;base64,${shotBase64}`)).blob(),
      );
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext("2d");
      context.drawImage(bitmap, 0, 0);

      const scan = (region) => {
        const pad = 4;
        const x = Math.max(0, Math.floor(region.x - pad));
        const y = Math.max(0, Math.floor(region.y - pad));
        const w = Math.min(canvas.width - x, Math.ceil(region.width + pad * 2));
        const h = Math.min(canvas.height - y, Math.ceil(region.height + pad * 2));
        const { data } = context.getImageData(x, y, w, h);
        const out = [];
        for (let i = 0; i < data.length; i += 4) {
          out.push([data[i], data[i + 1], data[i + 2]]);
        }
        return { pixels: out, box: { x, y, w, h } };
      };

      return { text: scan(regions.text), header: scan(regions.header) };
    },
    shot,
    boxes,
  );

  const summarise = (scan) => {
    // Every pixel in the box is backdrop: the type was hidden before the
    // screenshot was taken.
    const background = scan.pixels;
    let worst = { luminance: -1, rgb: null };
    for (const [r, g, b] of background) {
      const l = luminance(r, g, b);
      if (l > worst.luminance) worst = { luminance: l, rgb: [r, g, b] };
    }
    const sorted = background.map(([r, g, b]) => luminance(r, g, b)).sort((a, b) => a - b);
    const p999 = sorted[Math.floor(sorted.length * 0.999)] ?? 0;
    return {
      ratio: contrastWithWhite(worst.luminance),
      ratioP999: contrastWithWhite(p999),
      rgb: worst.rgb,
      luminance: worst.luminance,
      sampled: background.length,
      box: scan.box,
    };
  };

  const text = summarise(measured.text);
  const header = summarise(measured.header);
  rows.push({ viewport, text, header, geometry: boxes.geometry });

  await page.close();
}

const pad = (s, n) => String(s).padEnd(n);
console.log(
  pad("viewport", 20) + pad("text worst px", 18) + pad("text AA", 12) + pad("header worst px", 18) + "header AA",
);
console.log("-".repeat(80));
for (const { viewport, text, header } of rows) {
  const label = `${viewport.width}x${viewport.height}`;
  console.log(
    pad(`${label} ${viewport.note.slice(0, 6)}`, 20) +
      pad(`rgb(${text.rgb})`, 18) +
      pad(`${text.ratio.toFixed(2)}:1 ${text.ratio >= 4.5 ? "PASS" : "FAIL"}`, 12) +
      pad(`rgb(${header.rgb})`, 18) +
      `${header.ratio.toFixed(2)}:1 ${header.ratio >= 4.5 ? "PASS" : "FAIL"}`,
  );
}

console.log(`\ngeometry (bottom scrim height: ${bottomHeight})`);
console.log(
  pad("viewport", 20) + pad("hero h", 10) + pad("scrim h", 10) + pad("scrim %", 10) + pad("text h", 10) + "text top up scrim",
);
console.log("-".repeat(80));
for (const { viewport, geometry } of rows) {
  console.log(
    pad(`${viewport.width}x${viewport.height}`, 20) +
      pad(`${geometry.heroHeight}px`, 10) +
      pad(`${geometry.scrimHeight}px`, 10) +
      pad(`${geometry.scrimPercent}%`, 10) +
      pad(`${geometry.textHeight}px`, 10) +
      `${geometry.textTopUpScrim}%`,
  );
}

const worstText = Math.min(...rows.map((r) => r.text.ratio));
const worstHeader = Math.min(...rows.map((r) => r.header.ratio));
console.log(
  `\nworst text ${worstText.toFixed(2)}:1 ${worstText >= 4.5 ? "PASS" : "FAIL"}   ` +
    `worst header ${worstHeader.toFixed(2)}:1 ${worstHeader >= 4.5 ? "PASS" : "FAIL"}`,
);

await browser.close();
