/**
 * Contrast for every text pair on the home page's clock-driven cards,
 * measured in the browser rather than reasoned about from tokens.
 *
 * tools/perf/contrast.mjs checks the PALETTE: every ratio asserted in a
 * comment in globals.css, computed from the hexes. It cannot check these
 * cards, because what a reader actually sees here is composited — the
 * live card's ground is `primary` at 6% over the band, the "On now" pill
 * is `accent-50` under a 25%-alpha ring, and a chip sits on a card that
 * sits on a band. Only the browser knows what those resolve to.
 *
 * So this walks the three cards, finds every element with its own text,
 * reads the computed colour and composites the background back up the
 * ancestor chain until it hits an opaque one, and reports the ratio
 * against the floor the text's own size and weight require:
 *
 *   3.0   large text: 24px and over, or 18.66px and over at 700+
 *   4.5   everything else (WCAG 1.4.3 AA)
 *
 * Both themes, in one run. Exit code 1 if any pair fails.
 *
 *   node tools/perf/card-contrast.mjs [baseUrl]
 *
 * The clock is stubbed to a mid-camp-meeting Tuesday morning, which is
 * the only phase where all three cards are on the page at once.
 */
import { launch } from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.argv[2] ?? "http://localhost:3100";
/** Tuesday 18 August 2026, 10:30 EAT. Live card, Next Up and On Duty all on. */
const WHEN = "2026-08-18T07:30:00Z";

const CARDS = [
  ['section[aria-labelledby="now-heading"]', "Happening now"],
  ['section[aria-labelledby="next-heading"]', "Next up"],
  ['section[aria-labelledby="on-duty-heading"]', "On duty"],
];

const browser = await launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
});

let failures = 0;

for (const theme of ["light", "dark"]) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: theme },
  ]);
  await page.evaluateOnNewDocument((iso) => {
    const fixed = new Date(iso).getTime();
    const Real = Date;
    globalThis.Date = class extends Real {
      constructor(...a) {
        if (a.length === 0) super(fixed);
        else super(...a);
      }
      static now() {
        return fixed;
      }
    };
  }, WHEN);
  await page.goto(BASE + "/", { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluate(
    (t) => document.documentElement.setAttribute("data-theme", t),
    theme,
  );
  await new Promise((r) => setTimeout(r, 1200));

  const rows = await page.evaluate((cards) => {
    /*
     * Colours are composited by PAINTING them, not by parsing them.
     *
     * The first version of this parsed `getComputedStyle().color` with a
     * number regex, and it was confidently wrong twice: Tailwind emits
     * an alpha like `ink-muted/70` as `color-mix(in oklab, ...)`, which
     * Chrome resolves to `oklab(...)` or `color(srgb ...)`, and pulling
     * the first four numbers out of either gives nonsense. It reported
     * the time range's separator dash at 1.11:1 in dark mode — a dash
     * that is plainly visible on screen.
     *
     * A 1x1 canvas has no such problem. `fillStyle` accepts every colour
     * syntax the browser does, and filling the ground and then the
     * colour on top of it IS the compositing, done by the same engine
     * that painted the page. What comes back out of getImageData is
     * sRGB bytes.
     */
    const ctx = document.createElement("canvas").getContext("2d", {
      willReadFrequently: true,
    });
    ctx.canvas.width = ctx.canvas.height = 1;
    const paint = (color, groundRgb) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = `rgb(${groundRgb[0]},${groundRgb[1]},${groundRgb[2]})`;
      ctx.fillRect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2]];
    };
    const same = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
    /** Opaque when the ground underneath makes no difference. */
    const isOpaque = (color) =>
      same(paint(color, [255, 255, 255]), paint(color, [0, 0, 0]));
    /** Fully transparent when it leaves both grounds untouched. */
    const isClear = (color) =>
      same(paint(color, [255, 255, 255]), [255, 255, 255]) &&
      same(paint(color, [0, 0, 0]), [0, 0, 0]);

    const lin = (v) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const lum = ([r, g, b]) =>
      0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const ratio = (a, b) => {
      const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
      return (x + 0.05) / (y + 0.05);
    };
    const hex = ([r, g, b]) =>
      "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

    // Every background from this element up to the first opaque one,
    // then painted back down in order — which is what the compositor
    // does, so it is what the reader sees.
    const groundOf = (el) => {
      const stack = [];
      for (let n = el; n; n = n.parentElement) {
        const bg = getComputedStyle(n).backgroundColor;
        if (isClear(bg)) continue;
        stack.push(bg);
        if (isOpaque(bg)) break;
      }
      // The document's own ground, if nothing opaque was found on the way.
      let ground = [255, 255, 255];
      while (stack.length) ground = paint(stack.pop(), ground);
      return ground;
    };

    const out = [];
    for (const [sel, label] of cards) {
      const root = document.querySelector(sel);
      if (!root) continue;
      for (const el of root.querySelectorAll("*")) {
        const own = [...el.childNodes].some(
          (n) => n.nodeType === 3 && n.textContent.trim(),
        );
        if (!own) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none") continue;
        // Screen-reader-only text is not seen and has no contrast.
        if (el.closest(".sr-only")) continue;
        const size = parseFloat(cs.fontSize);
        const weight = Number(cs.fontWeight) || 400;
        const large = size >= 24 || (size >= 18.66 && weight >= 700);
        const bg = groundOf(el);
        const fg = paint(cs.color, bg);
        out.push({
          card: label,
          text: el.textContent.trim().slice(0, 34),
          size: `${Math.round(size)}px/${weight}`,
          fg: hex(fg),
          bg: hex(bg),
          ratio: Math.round(ratio(fg, bg) * 100) / 100,
          floor: large ? 3 : 4.5,
        });
      }
    }
    return out;
  }, CARDS);

  console.log(`\n══ ${theme.toUpperCase()} ${"═".repeat(70)}`);
  console.log(
    "card".padEnd(15) +
      "text".padEnd(36) +
      "size".padEnd(10) +
      "fg".padEnd(9) +
      "bg".padEnd(9) +
      "ratio".padStart(7) +
      "  floor  ",
  );
  // Dedupe: the same class combination measured twice tells you nothing.
  const seen = new Set();
  for (const r of rows) {
    const key = `${r.card}|${r.fg}|${r.bg}|${r.size}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const pass = r.ratio >= r.floor;
    if (!pass) failures++;
    console.log(
      r.card.padEnd(15) +
        r.text.padEnd(36) +
        r.size.padEnd(10) +
        r.fg.padEnd(9) +
        r.bg.padEnd(9) +
        String(r.ratio).padStart(7) +
        `  ${r.floor}    ` +
        (pass ? "PASS" : "FAIL"),
    );
  }
  await page.close();
}

await browser.close();
console.log(failures ? `\n${failures} FAILING PAIR(S)` : "\nAll pairs pass.");
process.exitCode = failures ? 1 : 0;
