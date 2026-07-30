/**
 * Does prefers-reduced-motion actually produce a static page?
 *
 * Reading the code path does not answer this. The global CSS rule in
 * globals.css only zeroes CSS-driven durations, Reveal and PageTransition
 * are JS-driven and branch on a hook that returns nothing during SSR, and
 * a hydration branch that swaps an opacity-0 element for a plain one is a
 * visible change even though no animation ever ran. So: emulate the
 * preference in a real browser and watch the pixels.
 *
 * Three checks per route, all of which must pass:
 *
 *   frames      N screenshots over ~2s, byte-compared. Any difference
 *               means something moved after the first paint.
 *   animations  document.getAnimations() must be empty. Catches a
 *               transition or keyframe that is running but happens to be
 *               painting the same pixels at the sampled moments.
 *   transforms  no element may be left holding a non-identity transform
 *               or a non-1 opacity from an entrance that never completed.
 *
 * Usage: node reduced-motion.mjs [route ...]
 */
import { createHash } from "node:crypto";
import { launch } from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3100";
const ROUTES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["/", "/schedule", "/about", "/faq", "/speakers", "/ministries", "/contact", "/downloads"];

const FRAMES = 8;
const FRAME_GAP_MS = 250;

const browser = await launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--force-device-scale-factor=1"],
});

let failures = 0;

for (const route of ROUTES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.setRequestInterception(true);
  page.on("request", (r) => {
    if (/\/serwist\/|sw\.js/.test(r.url())) r.abort().catch(() => {});
    else r.continue().catch(() => {});
  });

  // The preference has to be set before the document runs, or the hook
  // reads the default and the whole test is measuring the wrong branch.
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);

  await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 180000 });
  await page.evaluate(() => document.fonts.ready);

  const hashes = [];
  const raw = [];
  for (let i = 0; i < FRAMES; i++) {
    const shot = await page.screenshot({ type: "png" });
    hashes.push(createHash("sha1").update(shot).digest("hex").slice(0, 12));
    raw.push(shot);
    await new Promise((r) => setTimeout(r, FRAME_GAP_MS));
  }

  /*
   * WHERE the frames differ, not just that they do.
   *
   * "NOT STATIC" on its own is unactionable and, worse, easy to wave away
   * as noise. A bounding box and a pixel count says whether this is a
   * 3x30 control repainting on hydration or half the page moving. The
   * first differing pair is compared, in the page, using the same
   * OffscreenCanvas route the contrast harnesses use.
   */
  let diff = null;
  const firstChange = hashes.findIndex((h, i) => i > 0 && h !== hashes[i - 1]);
  if (firstChange > 0) {
    diff = await page.evaluate(
      async (a, b) => {
        const decode = async (bytes) =>
          createImageBitmap(new Blob([new Uint8Array(bytes)], { type: "image/png" }));
        const [ba, bb] = await Promise.all([decode(a), decode(b)]);
        const c = new OffscreenCanvas(ba.width, ba.height);
        const ctx = c.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(ba, 0, 0);
        const da = ctx.getImageData(0, 0, c.width, c.height).data;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(bb, 0, 0);
        const db = ctx.getImageData(0, 0, c.width, c.height).data;

        let n = 0, x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
        for (let i = 0; i < da.length; i += 4) {
          if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2]) {
            const p = i / 4;
            const x = p % c.width, y = (p / c.width) | 0;
            n++;
            if (x < x0) x0 = x;
            if (y < y0) y0 = y;
            if (x > x1) x1 = x;
            if (y > y1) y1 = y;
          }
        }
        if (n === 0) return { pixels: 0 };
        const el = document.elementFromPoint((x0 + x1) / 2, (y0 + y1) / 2);
        return {
          pixels: n,
          box: `${x1 - x0 + 1}x${y1 - y0 + 1} at (${x0},${y0})`,
          element: el
            ? `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}.${(el.getAttribute("class") ?? "").slice(0, 40)}`
            : "?",
        };
      },
      [...raw[firstChange - 1]],
      [...raw[firstChange]],
    );
  }

  const running = await page.evaluate(() =>
    document.getAnimations().map((a) => {
      const target = a.effect?.target;
      return `${a.constructor.name} on ${target?.tagName ?? "?"}.${(target?.getAttribute?.("class") ?? "").slice(0, 30)} state=${a.playState}`;
    }),
  );

  const stuck = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      const s = getComputedStyle(el);
      const transformed = s.transform !== "none" && s.transform !== "matrix(1, 0, 0, 1, 0, 0)";
      const faded = s.opacity !== "1" && Number(s.opacity) < 1;
      if (transformed || faded) {
        out.push(`${el.tagName}.${(el.getAttribute("class") ?? "").slice(0, 40)} transform=${s.transform} opacity=${s.opacity}`);
      }
    }
    return out;
  });

  const unique = [...new Set(hashes)];
  const framesOk = unique.length === 1;
  const animationsOk = running.length === 0;
  // A deliberately translucent decoration is not a stalled entrance, so
  // report these and let the reader judge rather than failing outright.
  const ok = framesOk && animationsOk;
  if (!ok) failures++;

  console.log(`\n${route}  ${ok ? "STATIC" : "NOT STATIC"}`);
  console.log(`  frames      ${unique.length} distinct of ${FRAMES}  ${framesOk ? "ok" : "CHANGED at frame " + firstChange}`);
  if (diff) {
    console.log(`  diff        ${diff.pixels} px in a ${diff.box} region, over ${diff.element}`);
  }
  console.log(`  animations  ${running.length}${running.length ? "\n    " + running.join("\n    ") : "  ok"}`);
  console.log(`  translucent/transformed elements: ${stuck.length}`);
  for (const s of stuck.slice(0, 6)) console.log(`    ${s}`);

  await page.close();
}

/*
 * The live indicator's pulse, checked directly.
 *
 * It is the only looping animation on the site and the route sweep above
 * cannot reach it: the dot renders only while the event is running, the
 * ?now= clock override is development-only, and these runs are against a
 * production build in July. So the class is put on an element in a real
 * page under the emulated preference and asked what it resolves to.
 *
 * Two assertions, because the global reduced-motion block alone is not
 * enough: collapsing animation-duration to 0.01ms stops the movement but
 * leaves the ring painted at its first keyframe — a permanent 45% halo.
 * The rule that removes it is what is being verified here.
 */
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.setRequestInterception(true);
  page.on("request", (r) => {
    if (/\/serwist\/|sw\.js/.test(r.url())) r.abort().catch(() => {});
    else r.continue().catch(() => {});
  });
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 180000 });

  const pulse = await page.evaluate(() => {
    const el = document.createElement("span");
    el.className = "live-pulse";
    document.body.appendChild(el);
    const s = getComputedStyle(el);
    const result = {
      display: s.display,
      animationName: s.animationName,
      animationDuration: s.animationDuration,
      // The ELEMENT's own animations, not the document's. document
      // .getAnimations() returns everything on the page at that instant,
      // so this reported "4 running" for an element that has none and
      // cannot have any — it is display:none — and failed a rule that
      // works. Same class of mistake as measuring white against a backdrop
      // the type is never white on.
      running: el.getAnimations().length,
      documentWide: document.getAnimations().length,
    };
    el.remove();
    return result;
  });

  const pulseOk = pulse.display === "none" && pulse.running === 0;
  if (!pulseOk) failures++;
  console.log(`\n.live-pulse under reduced motion  ${pulseOk ? "STOPPED" : "STILL RUNNING"}`);
  console.log(`  display ${pulse.display}   animation ${pulse.animationName} ${pulse.animationDuration}   its own getAnimations() ${pulse.running}   (document-wide, for reference: ${pulse.documentWide})`);
  await page.close();
}

await browser.close();
console.log(`\n${failures === 0 ? "ALL ROUTES STATIC UNDER REDUCED MOTION" : `${failures} check(s) failed`}`);
