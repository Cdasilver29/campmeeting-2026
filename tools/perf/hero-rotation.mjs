/**
 * The rotating hero's three behavioural claims, checked in a browser
 * rather than argued from the code.
 *
 * The contrast question is verify-hero.mjs's, per layer, and is not
 * repeated here. What this answers is the three things that are not about
 * pixels:
 *
 * 1. IT ROTATES, AND STOPS WHEN TOLD. Samples which layer is at full
 *    opacity over 16 seconds, then reaches the pause control BY KEYBOARD —
 *    Tab from the call to action, Enter — and samples again for another
 *    16, asserting the index never moves after the press. Pressing it with
 *    `el.click()` would prove nothing about a control that has to be
 *    reachable; the tab count is reported so a change in the hero's DOM
 *    order that buries the button is visible.
 *
 * 2. IT STOPS DEAD UNDER prefers-reduced-motion. The preference is
 *    emulated BEFORE the document runs, and then it asserts that only ONE
 *    layer exists in the DOM at all — not that the other two are held at
 *    opacity 0, which is what a slowed rotation would also look like — and
 *    that no pause control is rendered, since there is nothing to pause.
 *
 * 3. THE CAPTION DOES NOT WRAP ON A PHONE. Each caption's rendered height
 *    is compared against its own line box, per width, and the string is
 *    reported with the width it was measured at. A caption that wraps to
 *    two lines is not a contrast failure and no harness would otherwise
 *    catch it.
 *
 * Usage: node hero-rotation.mjs [widths]     default 390,768,1440
 */
import { launch } from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3100";
const WIDTHS = (process.argv[2] ?? "390,768,1440").split(",").map(Number);

/** Long enough for two transitions at the component's 6800ms interval. */
const WATCH_MS = 16000;
const SAMPLE_MS = 400;

const browser = await launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--force-device-scale-factor=1"],
});

const openPage = async (width, height, reduced) => {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  const features = [{ name: "prefers-color-scheme", value: "light" }];
  if (reduced) features.push({ name: "prefers-reduced-motion", value: "reduce" });
  await page.emulateMediaFeatures(features);
  await page.setRequestInterception(true);
  page.on("request", (r) => {
    if (/\/serwist\/|sw\.js/.test(r.url())) r.abort().catch(() => {});
    else r.continue().catch(() => {});
  });
  await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 800));
  return page;
};

/** Which layer is fully opaque right now, or -1 mid-crossfade. */
const activeLayer = (page) =>
  page.evaluate(() => {
    const layers = [...document.querySelectorAll("[data-hero-layer]")];
    const at = layers.findIndex((l) => Number(getComputedStyle(l).opacity) > 0.99);
    return { at, count: layers.length };
  });

const sample = async (page, ms) => {
  const seen = new Set();
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const { at } = await activeLayer(page);
    if (at >= 0) seen.add(at);
    await new Promise((r) => setTimeout(r, SAMPLE_MS));
  }
  return [...seen].sort();
};

console.log("=== 1. rotation, and the pause control by keyboard (1440x900) ===");
{
  const page = await openPage(1440, 900, false);
  const { count } = await activeLayer(page);
  console.log(`layers mounted after hydration: ${count}`);

  const before = await sample(page, WATCH_MS);
  console.log(`layers seen over ${WATCH_MS / 1000}s, rotating: [${before}]`);

  /* Tab from the call to action. Focus is put on the CTA by name rather
     than tabbing up from the document start, because the header holds a
     variable number of links and the count would then describe the header
     rather than the hero. */
  await page.evaluate(() => {
    document.querySelector('#home-hero a[href="/schedule"]').focus();
  });
  let tabs = 0;
  let focused = "";
  for (; tabs < 6; tabs++) {
    await page.keyboard.press("Tab");
    focused = await page.evaluate(() => {
      const el = document.activeElement;
      return `${el.tagName.toLowerCase()}|${el.getAttribute("aria-label") ?? ""}`;
    });
    if (focused.startsWith("button|Pause")) break;
  }
  console.log(
    `tabs from the call to action to the pause control: ${tabs + 1}  (focus: ${focused})`,
  );

  await page.keyboard.press("Enter");
  const label = await page.evaluate(
    () => document.activeElement.getAttribute("aria-label"),
  );
  const pinned = await activeLayer(page);
  const after = await sample(page, WATCH_MS);
  console.log(`after Enter: label is now "${label}", layer ${pinned.at}`);
  console.log(
    `layers seen over ${WATCH_MS / 1000}s, paused: [${after}]  ` +
      `${after.length === 1 ? "PASS - it stopped" : "FAIL - it kept rotating"}`,
  );

  await page.keyboard.press("Enter");
  const resumed = await sample(page, WATCH_MS);
  console.log(
    `layers seen over ${WATCH_MS / 1000}s after Enter again: [${resumed}]  ` +
      `${resumed.length > 1 ? "PASS - it resumed" : "FAIL - it did not resume"}`,
  );
  await page.close();
}

console.log("\n=== 2. prefers-reduced-motion (1440x900) ===");
{
  const page = await openPage(1440, 900, true);
  const { count } = await activeLayer(page);
  const controls = await page.evaluate(
    () => document.querySelectorAll('#home-hero button[aria-label*="background"]').length,
  );
  const seen = await sample(page, WATCH_MS);
  console.log(`layers in the DOM: ${count}  ${count === 1 ? "PASS" : "FAIL"}`);
  console.log(`pause controls rendered: ${controls}  ${controls === 0 ? "PASS" : "FAIL"}`);
  console.log(
    `layers seen over ${WATCH_MS / 1000}s: [${seen}]  ` +
      `${seen.length === 1 && seen[0] === 0 ? "PASS - first image only" : "FAIL"}`,
  );
  await page.close();
}

console.log("\n=== 3. captions: does any of them wrap? ===");
console.log(
  "width  layer  lines  height/line   caption".padEnd(40),
);
for (const w of WIDTHS) {
  const page = await openPage(w, w < 768 ? 844 : 900, false);
  const rows = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("#home-hero-text p").forEach((p) => {
      const cs = getComputedStyle(p);
      if (cs.position !== "absolute") return; // the captions, not the verse or meta
      const line = parseFloat(cs.lineHeight);
      out.push({
        text: p.textContent,
        h: Math.round(p.getBoundingClientRect().height),
        line: Math.round(line),
      });
    });
    return out;
  });
  rows.forEach((r, i) => {
    const lines = Math.round(r.h / r.line);
    console.log(
      `${String(w).padEnd(7)}${String(i).padEnd(7)}${String(lines).padEnd(7)}` +
        `${`${r.h}/${r.line}`.padEnd(14)}${r.text || "(none)"}` +
        (lines > 1 ? "   WRAPS" : ""),
    );
  });
  await page.close();
}

await browser.close();
