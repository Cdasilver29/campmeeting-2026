/**
 * The cost of a full style recalc + layout of the rendered programme,
 * measured as a tight in-page loop rather than inferred from a page-load
 * trace.
 *
 * Why this instrument: page-load TBT on this machine has a +/-20% spread
 * run to run (31.7s to 44.6s on identical code), so it cannot answer
 * "did this styling pass add main-thread work". A forced-reflow loop can:
 * it invalidates layout for the whole programme subtree and reads it back
 * synchronously, hundreds of times, in one page. The median of that is
 * stable to a few percent and is exactly the quantity at issue — how
 * expensive it is to lay out this DOM.
 *
 * It is also the quantity content-visibility: auto is meant to change,
 * since skipping offscreen subtrees removes them from precisely this work.
 */
import { launch } from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = process.argv[2] ?? "http://localhost:3100/schedule";
const ITERATIONS = Number(process.argv[3] ?? 60);
const PAGES = Number(process.argv[4] ?? 5);
const LABEL = process.argv[5] ?? "run";

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  return n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}

const browser = await launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
});

const perPage = [];

for (let p = 0; p < PAGES; p++) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.setCacheEnabled(false);

  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (/\/serwist\/|sw\.js/.test(request.url())) request.abort().catch(() => {});
    else request.continue().catch(() => {});
  });

  await page.goto(URL, { waitUntil: "load", timeout: 180000 });
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const result = await page.evaluate((iterations) => {
    // The widest element that contains the whole programme. Changing its
    // width invalidates layout for every descendant, which is the work
    // being priced.
    const target =
      document.querySelector("main > div > div, main > div") ?? document.body;

    const samples = [];
    for (let i = 0; i < iterations; i++) {
      // Alternating a sub-pixel width forces a real geometry change that
      // Chrome cannot coalesce away, without moving anything visibly.
      target.style.width = i % 2 ? "calc(100% - 0.01px)" : "100%";
      const start = performance.now();
      void document.body.offsetHeight; // synchronous recalc + layout
      samples.push(performance.now() - start);
    }
    target.style.width = "";

    const sorted = samples.slice().sort((a, b) => a - b);
    const mid = sorted.length % 2
      ? sorted[(sorted.length - 1) / 2]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;

    return {
      median: mid,
      p10: sorted[Math.floor(sorted.length * 0.1)],
      p90: sorted[Math.floor(sorted.length * 0.9)],
      elements: document.getElementsByTagName("*").length,
      scrollHeight: document.documentElement.scrollHeight,
    };
  }, ITERATIONS);

  perPage.push(result);
  process.stderr.write(
    `  ${LABEL} page ${p + 1}/${PAGES}: layout ${result.median.toFixed(2)}ms  ` +
      `elements ${result.elements}  height ${result.scrollHeight}px\n`,
  );
  await page.close();
}

await browser.close();

const medians = perPage.map((r) => r.median);
console.log(`\n=== ${LABEL} — ${URL} ===`);
console.log(`forced style+layout of full programme, ${ITERATIONS} reflows x ${PAGES} pages`);
console.log(
  `  median ${median(medians).toFixed(2)} ms   ` +
    `range ${Math.min(...medians).toFixed(2)} - ${Math.max(...medians).toFixed(2)} ms`,
);
console.log(`  elements     ${perPage.map((r) => r.elements).join(", ")}`);
console.log(`  scrollHeight ${perPage.map((r) => r.scrollHeight).join(", ")} px`);
