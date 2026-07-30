/**
 * Direct CDP measurement, because Lighthouse on this box cannot resolve
 * 50ms: it returned a 10.4-13.3s TBT range on identical code.
 *
 * What this measures, per run, on a fresh page in one long-lived browser:
 *   longTaskTotal  sum of (longtask.duration - 50), the TBT definition
 *                  applied to every long task on the page
 *   recalcStyle    sum of UpdateLayoutTree trace event durations
 *   layout         sum of Layout trace event durations
 *   paint          sum of Paint + PrePaint durations
 *   cls            final cumulative layout-shift value
 *   elements       document.getElementsByTagName('*').length
 *
 * recalcStyle + layout + paint is the part a pure styling pass can move,
 * and the part content-visibility is supposed to shrink. longTaskTotal is
 * reported because the brief asks about TBT, but it is dominated by React
 * hydration, which no CSS change touches.
 *
 * CPU is throttled to a fixed rate so a run is comparable to another run
 * rather than to wall-clock reality.
 */
import { launch } from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = process.argv[2] ?? "http://localhost:3100/schedule";
const RUNS = Number(process.argv[3] ?? 9);
const THROTTLE = Number(process.argv[4] ?? 4);
const LABEL = process.argv[5] ?? "run";

const TRACE_CATEGORIES = [
  "disabled-by-default-devtools.timeline",
  "devtools.timeline",
];

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return NaN;
  return n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}

const browser = await launch({
  executablePath: CHROME,
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-first-run",
    "--disable-extensions",
    "--disable-background-networking",
  ],
});

const results = [];

for (let i = 0; i < RUNS; i++) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.setCacheEnabled(false);

  const client = await page.createCDPSession();
  await client.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });

  // The service worker is blocked for measurement. Left alone it starts
  // precaching the entire site the moment the page loads, and under a 4x
  // throttle that work lands inside the trace window and swamps the
  // page's own style and layout cost by an order of magnitude. The
  // programme's offline behaviour is not what is being measured here.
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (/\/serwist\/|sw\.js/.test(request.url())) request.abort().catch(() => {});
    else request.continue().catch(() => {});
  });

  // Observers have to exist before any content parses, so they go in as
  // an init script rather than being evaluated after navigation.
  await page.evaluateOnNewDocument(() => {
    window.__cls = 0;
    window.__longTasks = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__longTasks.push(entry.duration);
      }
    }).observe({ type: "longtask", buffered: true });
  });

  await page.tracing.start({ categories: TRACE_CATEGORIES });
  // "load", not "networkidle0": idle never arrives promptly here and the
  // trace window has to be bounded, or it measures however long the wait
  // happened to be rather than the cost of rendering the page.
  await page.goto(URL, { waitUntil: "load", timeout: 120000 });
  // Enough for hydration and the style/layout it triggers to settle.
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const traceBuffer = await page.tracing.stop();

  // tracing.stop() hands back a Uint8Array; .toString() on one of those
  // yields comma-separated byte values, not the JSON.
  const trace = JSON.parse(Buffer.from(traceBuffer).toString("utf8"));
  const sums = { UpdateLayoutTree: 0, Layout: 0, Paint: 0, PrePaint: 0 };
  for (const event of trace.traceEvents) {
    if (event.name in sums && typeof event.dur === "number") {
      sums[event.name] += event.dur / 1000; // us -> ms
    }
  }

  const page_ = await page.evaluate(() => ({
    cls: window.__cls,
    longTasks: window.__longTasks,
    elements: document.getElementsByTagName("*").length,
  }));

  const longTaskTotal = page_.longTasks.reduce(
    (total, duration) => total + Math.max(0, duration - 50),
    0,
  );

  results.push({
    longTaskTotal,
    recalcStyle: sums.UpdateLayoutTree,
    layout: sums.Layout,
    paint: sums.Paint + sums.PrePaint,
    styleLayoutPaint: sums.UpdateLayoutTree + sums.Layout + sums.Paint + sums.PrePaint,
    cls: page_.cls,
    elements: page_.elements,
  });

  await client.detach();
  await page.close();
  process.stderr.write(`  ${LABEL} run ${i + 1}/${RUNS} done\n`);
}

await browser.close();

const keys = [
  "longTaskTotal",
  "recalcStyle",
  "layout",
  "paint",
  "styleLayoutPaint",
  "cls",
  "elements",
];

console.log(`\n=== ${LABEL} — ${URL} — ${RUNS} runs, ${THROTTLE}x CPU throttle ===`);
for (const key of keys) {
  const values = results.map((r) => r[key]);
  const round = key === "cls" ? 4 : key === "elements" ? 0 : 1;
  const fmt = (v) => Number(v).toFixed(round);
  console.log(
    `${key.padEnd(17)} median ${fmt(median(values)).padStart(9)}   ` +
      `min ${fmt(Math.min(...values)).padStart(9)}   max ${fmt(Math.max(...values)).padStart(9)}`,
  );
}
console.log(`\nraw: ${JSON.stringify(results)}`);
