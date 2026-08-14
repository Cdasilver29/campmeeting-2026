/**
 * The hero caption must be ONE line at every width.
 *
 * ── WHY THIS IS A SCRIPT AND NOT A COMMENT ───────────────────────────
 *
 * The caption row reserves exactly one 20px line — `min-h-5` on the box,
 * `leading-5` on the captions, in hero-rotation.tsx — and each caption is
 * ABSOLUTELY POSITIONED inside it so the three can crossfade. Absolute
 * positioning is what makes a wrap invisible to every other kind of
 * check: the layout does not move, nothing shifts, CLS stays at zero, and
 * the second line simply draws outside its box. It is also white type
 * over a photograph at every width, including below `md` where the rest
 * of the hero text block is ink on the page surface — checked, not
 * assumed, and the reason a wrap is a contrast problem and not only an
 * untidy one.
 *
 * So the constraint is real and completely invisible in the source. A
 * caption is just a string in src/lib/hero.ts, and the only thing
 * standing between a longer one and white text on unmeasured pixels is
 * somebody remembering to measure. That happened: the guest choir's name
 * was corrected to "Newlife Migori Adventist Church Choir", the caption
 * was set to "Guest Choir · " plus the name on a characters-count
 * estimate, and it wrapped at 320 and 360. The estimate was wrong because
 * the caption box is not the viewport — it is the viewport minus the
 * shell padding, the 20px pause control and a 12px gap.
 *
 * ── WHAT IT MEASURES ─────────────────────────────────────────────────
 *
 * Every caption on the page, in its own computed font, against its own
 * box, at each width. It reports the measured text width and the box, so
 * a failure says how much too long it is rather than only that it failed.
 *
 * Phase is irrelevant here and is not driven: the caption row is the same
 * width in all three. If you do need to drive phase, note that `?now=`
 * will NOT do it — that only feeds useNow(), i.e. client components. The
 * phase attributes (`data-hero-phase`, `data-livestream-phase`) are
 * written by inline scripts that read the real clock, so a harness has to
 * set the attribute itself.
 *
 * ── SETUP ────────────────────────────────────────────────────────────
 *
 *   pnpm build && pnpm start          # in the repo
 *   mkdir /tmp/perf && cd /tmp/perf   # puppeteer-core is not a dep
 *   pnpm add puppeteer-core@24.12.1
 *   cp <repo>/tools/perf/caption-fit.mjs .
 *   node caption-fit.mjs
 */
import { launch } from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.argv[2] ?? "http://localhost:3000";

/**
 * 320 is the floor the rest of tools/perf uses and is where the OLD
 * caption ("Camp Meeting 2026 Guest Choir · Migori Central", 276.8px into
 * a 248px box) already wrapped. 360 is the width that matters most: it is
 * a very common Android and it is where a caption that looks fine on a
 * 390 iPhone quietly goes to two lines.
 */
const WIDTHS = [320, 360, 390, 414, 430, 560, 640, 768, 1024, 1440];

const browser = await launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();

let failures = 0;

console.log("w      caption                                     text     box      ");
for (const w of WIDTHS) {
  await page.setViewport({ width: w, height: 800, deviceScaleFactor: 1 });
  await page.goto(BASE, { waitUntil: "networkidle0" });
  // The rotation mounts its other two layers in an effect, after paint.
  await new Promise((r) => setTimeout(r, 900));

  const rows = await page.evaluate(() => {
    // The captions are the only <p> inside the caption row, which is the
    // one element with a min-height matching its children's line-height.
    const caps = [...document.querySelectorAll("p")].filter((p) => {
      const cs = getComputedStyle(p);
      return cs.position === "absolute" && parseFloat(cs.lineHeight) === 20;
    });
    return caps.map((p) => {
      const cs = getComputedStyle(p);
      const box = p.parentElement.getBoundingClientRect().width;
      const ctx = document.createElement("canvas").getContext("2d");
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const text = (p.textContent || "").trim();
      return {
        text,
        textW: +ctx.measureText(text).width.toFixed(1),
        boxW: +box.toFixed(1),
        renderedH: +p.getBoundingClientRect().height.toFixed(1),
        lineH: parseFloat(cs.lineHeight),
        colour: cs.color,
      };
    });
  });

  for (const r of rows) {
    const wrapped = r.renderedH > r.lineH + 1;
    if (wrapped) failures++;
    console.log(
      `${String(w).padEnd(6)} ${r.text.slice(0, 42).padEnd(42)} ` +
        `${String(r.textW).padStart(7)}  ${String(r.boxW).padStart(7)}  ` +
        `${wrapped ? `WRAPPED (${r.renderedH}px, over by ${(r.textW - r.boxW).toFixed(1)}px)` : "ok"}`,
    );
  }
}

console.log(
  `\n${failures === 0 ? "PASS — every caption is one line at every width" : `FAIL — ${failures} wrapped`}`,
);
await browser.close();
process.exit(failures === 0 ? 0 : 1);
