/**
 * Cumulative Layout Shift per route, with the shifting elements named.
 *
 * Why this exists rather than reading measure.mjs's `cls` row: that script
 * reports one number and nothing about where it came from, which is enough
 * to notice a regression and not enough to fix one. A CLS reading with no
 * attribution sends you looking at whatever changed most recently rather
 * than at whatever moved.
 *
 * Every layout-shift entry carries `sources`, each with the node that
 * moved and its rect before and after. This records them, converts each
 * node to a short selector, and prints the largest movers per route
 * alongside the score. That is what identified the /livestream footer:
 * the score said 0.105, the attribution said the footer's brand lockup
 * travelled 282px.
 *
 * Not throttled, unlike measure.mjs. CLS is a geometric quantity — impact
 * fraction times distance fraction — so it does not depend on how fast the
 * CPU is, and throttling only widens the window in which a shift can land
 * outside the measurement. What it does need is a viewport, since both
 * fractions are relative to it, so the width is fixed and reported.
 *
 * Usage: node cls.mjs [runs] [route ...]
 */
import { launch } from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3100";

const args = process.argv.slice(2);
const RUNS = Number(args[0] ?? 5);
const ROUTES = args.slice(1).length
  ? args.slice(1)
  : [
      "/",
      "/schedule",
      "/livestream",
      "/speakers",
      "/ministries",
      "/about",
      "/contact",
      "/faq",
      "/downloads",
      "/announcements",
      "/prayer-requests",
    ];

// Both fractions in the CLS formula are relative to the viewport, so a
// shorter viewport scores the same physical movement higher. 390x844 is
// where /livestream is worst; 1440x900 is the desktop reading. Set with
// CLS_VIEWPORT=390x844.
const [vw, vh] = (process.env.CLS_VIEWPORT ?? "1440x900").split("x").map(Number);
const VIEWPORT = { width: vw, height: vh, deviceScaleFactor: 1 };

/**
 * CPU throttle, off by default. CLS does not need it (it is geometric), but
 * LCP very much does: a JS-driven entrance animation cannot start until
 * hydration, so on an unthrottled desktop it looks free and on a phone it
 * is not. Set CLS_THROTTLE=4 to read the number the audience gets.
 */
const THROTTLE = Number(process.env.CLS_THROTTLE ?? 1);
// Long enough for hydration, the useNow() tick that follows it, and any
// shift either of them causes. The livestream skeleton collapses on the
// first effect pass, so a shorter wait would have scored it as clean.
const SETTLE_MS = 2500;

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return NaN;
  return n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}

const browser = await launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
});

const summary = [];

for (const route of ROUTES) {
  const scores = [];
  const lcps = [];
  let lcpElement = "";
  /** selector -> { score, maxTravel } accumulated across runs */
  const movers = new Map();

  for (let run = 0; run < RUNS; run++) {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    await page.setCacheEnabled(false);

    if (THROTTLE > 1) {
      const client = await page.createCDPSession();
      await client.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });
    }

    // Same reason as measure.mjs: left alone the service worker precaches
    // the whole site on load and its work lands inside the window.
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (/\/serwist\/|sw\.js/.test(request.url())) request.abort().catch(() => {});
      else request.continue().catch(() => {});
    });

    await page.evaluateOnNewDocument(() => {
      window.__cls = 0;
      window.__shifts = [];
      window.__lcp = 0;
      window.__lcpElement = "";

      // LCP is reported alongside CLS because an entrance animation is the
      // one thing that can improve the second and quietly wreck the first:
      // an element at opacity 0 is not a candidate, so fading in the
      // largest text block moves LCP by however long the fade is delayed.
      // Measuring it here is what says whether a reveal cost anything.
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__lcp = entry.startTime;
          window.__lcpElement = entry.element
            ? entry.element.tagName.toLowerCase() +
              (entry.element.id ? `#${entry.element.id}` : "")
            : "(none)";
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });

      // A short, stable description of a node. id wins, then a data
      // attribute, then tag plus the first two class names — enough to
      // find the element in the source without dumping a class list that
      // is often 300 characters of Tailwind.
      const describe = (node) => {
        if (!node || node.nodeType !== 1) return "(detached)";
        if (node.id) return `#${node.id}`;
        const tag = node.tagName.toLowerCase();
        const data = [...node.attributes].find((a) => a.name.startsWith("data-"));
        if (data) return `${tag}[${data.name}]`;
        // className on an SVG element is an SVGAnimatedString, not a
        // string, and stringifying it yields "[object SVGAnimatedString]".
        // getAttribute is the one that works for both.
        const cls = (node.getAttribute("class") || "")
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .join(".");
        return cls ? `${tag}.${cls}` : tag;
      };

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          window.__cls += entry.value;
          for (const source of entry.sources ?? []) {
            window.__shifts.push({
              selector: describe(source.node),
              value: entry.value,
              // Vertical travel is what a collapsing skeleton produces,
              // and it is the number worth reading in the report.
              travel: Math.round(
                Math.abs((source.currentRect?.y ?? 0) - (source.previousRect?.y ?? 0)),
              ),
            });
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    });

    await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 120000 });
    await new Promise((resolve) => setTimeout(resolve, SETTLE_MS));

    const result = await page.evaluate(() => ({
      cls: window.__cls,
      shifts: window.__shifts,
      lcp: window.__lcp,
      lcpElement: window.__lcpElement,
    }));

    scores.push(result.cls);
    lcps.push(result.lcp);
    lcpElement = result.lcpElement || lcpElement;
    for (const shift of result.shifts) {
      const existing = movers.get(shift.selector) ?? { score: 0, maxTravel: 0 };
      // Divided by RUNS so the printed score is per-load, comparable to
      // the median beside it rather than a sum of every run.
      existing.score += shift.value / RUNS;
      existing.maxTravel = Math.max(existing.maxTravel, shift.travel);
      movers.set(shift.selector, existing);
    }

    await page.close();
  }

  const top = [...movers.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 4);

  summary.push({
    route,
    median: median(scores),
    max: Math.max(...scores),
    lcp: median(lcps),
    lcpElement,
    top,
  });
  process.stderr.write(`  ${route} done\n`);
}

await browser.close();

console.log(
  `\n=== CLS — ${RUNS} runs per route, ${VIEWPORT.width}x${VIEWPORT.height}, ${SETTLE_MS}ms settle, ${THROTTLE}x CPU ===\n`,
);
console.log(
  `${"route".padEnd(20)} ${"median".padStart(8)} ${"max".padStart(8)} ${"LCP ms".padStart(8)}   verdict / LCP element`,
);
for (const row of summary) {
  const verdict = row.max < 0.01 ? "ok" : row.max < 0.1 ? "NEEDS WORK" : "FAIL";
  console.log(
    `${row.route.padEnd(20)} ${row.median.toFixed(4).padStart(8)} ${row.max.toFixed(4).padStart(8)} ${row.lcp.toFixed(0).padStart(8)}   ${verdict}  ${row.lcpElement}`,
  );
}

console.log("\n--- what moved ---");
for (const row of summary) {
  if (row.top.length === 0) continue;
  console.log(`\n${row.route}`);
  for (const [selector, data] of row.top) {
    console.log(
      `  ${data.score.toFixed(4)}  travel ${String(data.maxTravel).padStart(4)}px  ${selector}`,
    );
  }
}
