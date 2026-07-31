/**
 * Interleaved A/B of the quantity measure.mjs reports, for the one question
 * measure.mjs cannot answer.
 *
 * measure.mjs takes N runs of one URL and prints a median. Comparing two of
 * its runs means comparing two different half-hours of this machine's life:
 * the arms are separated in time, so build-to-build difference and
 * machine-load drift arrive added together and cannot be told apart. On a
 * box whose long-task readings for identical code spread 714-1,393 ms that
 * is not a small correction, it is most of the signal.
 *
 * So both builds are served at once, on two ports, and one browser
 * alternates between them. Every run of A has a run of B a few seconds
 * either side of it, and whatever the machine was doing that minute it was
 * doing to both.
 *
 * Order within a block is ABBA, not ABAB. ABAB gives A the earlier slot
 * every time, so any linear drift over the block lands entirely in the
 * difference. ABBA puts each arm at mean position 1.5 of 4, which cancels a
 * linear trend exactly; the block's leading arm alternates so a quadratic
 * one is split too.
 *
 * The statistics are rank-based throughout — Mann-Whitney U, a
 * Hodges-Lehmann shift with a distribution-free interval, Wilcoxon on the
 * block-paired differences. The metric's tail is long (one run in the
 * previous session's set came in at 2,999 ms against a 1,237 ms median), and
 * a mean and a t-test would be reporting that tail rather than the page.
 *
 * The number that decides the question is the interval, not the p-value.
 * "No significant difference" from an instrument that could not have
 * resolved the difference anyway is not evidence of anything, so the
 * interval is printed first and the resolution the run achieved is printed
 * next to the effect it was looking for.
 *
 * Usage:
 *   node ab-interleave.mjs --arm base=http://localhost:3101/schedule \
 *                          --arm head=http://localhost:3102/schedule \
 *                          --runs 20 --throttle 4 --out results.json
 */
import { launch } from "puppeteer-core";
import { writeFileSync } from "node:fs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

// ---------------------------------------------------------------- arguments

const argv = process.argv.slice(2);
const arms = [];
let RUNS = 20;
let THROTTLE = 4;
let OUT = null;
let SETTLE = 1500;

for (let i = 0; i < argv.length; i++) {
  const flag = argv[i];
  if (flag === "--arm") {
    const raw = argv[++i];
    const at = raw.indexOf("=");
    arms.push({ label: raw.slice(0, at), url: raw.slice(at + 1) });
  } else if (flag === "--runs") RUNS = Number(argv[++i]);
  else if (flag === "--throttle") THROTTLE = Number(argv[++i]);
  else if (flag === "--settle") SETTLE = Number(argv[++i]);
  else if (flag === "--out") OUT = argv[++i];
}

if (arms.length !== 2) {
  console.error("Need exactly two --arm label=url arguments.");
  process.exit(1);
}
if (RUNS % 2 !== 0) {
  console.error("--runs must be even so the ABBA blocks come out whole.");
  process.exit(1);
}

// ------------------------------------------------------------------- stats

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return NaN;
  return n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}

function quantile(values, q) {
  const sorted = [...values].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

/**
 * Mann-Whitney U, two-sided, normal approximation with a tie correction and
 * a continuity correction. Reported as "how often would a gap this large
 * come out of two samples drawn from the same page", which is the question
 * being asked of it, and not as a verdict.
 */
function mannWhitney(a, b) {
  const n1 = a.length;
  const n2 = b.length;
  const pooled = [...a.map((v) => ({ v, g: 0 })), ...b.map((v) => ({ v, g: 1 }))];
  pooled.sort((x, y) => x.v - y.v);

  // Average ranks over ties.
  const ranks = new Array(pooled.length);
  const tieGroups = [];
  let i = 0;
  while (i < pooled.length) {
    let j = i;
    while (j + 1 < pooled.length && pooled[j + 1].v === pooled[i].v) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) ranks[k] = avg;
    if (j > i) tieGroups.push(j - i + 1);
    i = j + 1;
  }

  let rankSumA = 0;
  for (let k = 0; k < pooled.length; k++) if (pooled[k].g === 0) rankSumA += ranks[k];

  const u1 = rankSumA - (n1 * (n1 + 1)) / 2;
  const u2 = n1 * n2 - u1;
  const u = Math.min(u1, u2);

  const n = n1 + n2;
  const meanU = (n1 * n2) / 2;
  const tieTerm = tieGroups.reduce((sum, t) => sum + (t ** 3 - t), 0);
  const varU = ((n1 * n2) / 12) * (n + 1 - tieTerm / (n * (n - 1)));
  if (varU <= 0) return { u, p: 1, z: 0 };

  const z = (Math.abs(u - meanU) - 0.5) / Math.sqrt(varU);
  return { u, z, p: 2 * (1 - normalCdf(z)) };
}

function normalCdf(z) {
  // Abramowitz & Stegun 26.2.17.
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  const p =
    d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1 - p : p;
}

/**
 * Hodges-Lehmann shift: the median of every pairwise b - a. This is the
 * location shift the Mann-Whitney test is testing, so the estimate and the
 * p-value are answering the same question rather than two adjacent ones.
 * The interval is the distribution-free one read off the sorted pairwise
 * differences at the critical U.
 */
function hodgesLehmann(a, b, alpha = 0.05) {
  const diffs = [];
  for (const y of b) for (const x of a) diffs.push(y - x);
  diffs.sort((p, q) => p - q);

  const n1 = a.length;
  const n2 = b.length;
  const total = n1 * n2;
  const z = 1.959963984540054; // two-sided 95%
  const k = Math.round(total / 2 - z * Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12));
  const lowIndex = Math.max(0, k - 1);
  const highIndex = Math.min(total - 1, total - k);

  return { shift: median(diffs), low: diffs[lowIndex], high: diffs[highIndex] };
}

/** Wilcoxon signed-rank on the block-level paired differences. */
function wilcoxonSigned(diffs) {
  const nonZero = diffs.filter((d) => d !== 0);
  const n = nonZero.length;
  if (n < 1) return { p: 1, n: 0 };

  const byMagnitude = nonZero
    .map((d) => ({ d, abs: Math.abs(d) }))
    .sort((x, y) => x.abs - y.abs);
  const ranks = new Array(n);
  let i = 0;
  while (i < n) {
    let j = i;
    while (j + 1 < n && byMagnitude[j + 1].abs === byMagnitude[i].abs) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) ranks[k] = avg;
    i = j + 1;
  }

  let wPlus = 0;
  for (let k = 0; k < n; k++) if (byMagnitude[k].d > 0) wPlus += ranks[k];
  const meanW = (n * (n + 1)) / 4;
  const varW = (n * (n + 1) * (2 * n + 1)) / 24;
  const z = (Math.abs(wPlus - meanW) - 0.5) / Math.sqrt(varW);
  return { p: 2 * (1 - normalCdf(z)), n, wPlus, z };
}

/** Percentile bootstrap on the difference of medians. */
function bootstrapMedianDiff(a, b, iterations = 20000) {
  const shifts = new Array(iterations);
  for (let it = 0; it < iterations; it++) {
    const ra = new Array(a.length);
    const rb = new Array(b.length);
    for (let k = 0; k < a.length; k++) ra[k] = a[(Math.random() * a.length) | 0];
    for (let k = 0; k < b.length; k++) rb[k] = b[(Math.random() * b.length) | 0];
    shifts[it] = median(rb) - median(ra);
  }
  shifts.sort((p, q) => p - q);
  return {
    low: shifts[Math.floor(iterations * 0.025)],
    high: shifts[Math.floor(iterations * 0.975)],
  };
}

// --------------------------------------------------------------- the order

/**
 * RUNS runs of each arm, laid out as ABBA / BAAB blocks. Each block holds
 * two runs of each arm; the leading arm alternates block to block.
 */
function buildOrder(runs) {
  const order = [];
  const blocks = runs / 2;
  for (let b = 0; b < blocks; b++) {
    const lead = b % 2;
    const other = 1 - lead;
    order.push(
      { arm: lead, block: b },
      { arm: other, block: b },
      { arm: other, block: b },
      { arm: lead, block: b },
    );
  }
  return order;
}

// ------------------------------------------------------------- measurement

const TRACE_CATEGORIES = [
  "disabled-by-default-devtools.timeline",
  "devtools.timeline",
];

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

/** One run. Deliberately identical to measure.mjs, so the numbers compare. */
async function measureOnce(url) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.setCacheEnabled(false);

  const client = await page.createCDPSession();
  await client.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });

  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (/\/serwist\/|sw\.js/.test(request.url())) request.abort().catch(() => {});
    else request.continue().catch(() => {});
  });

  await page.evaluateOnNewDocument(() => {
    window.__cls = 0;
    window.__longTasks = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__longTasks.push(entry.duration);
    }).observe({ type: "longtask", buffered: true });
  });

  await page.tracing.start({ categories: TRACE_CATEGORIES });
  await page.goto(url, { waitUntil: "load", timeout: 120000 });
  await new Promise((resolve) => setTimeout(resolve, SETTLE));
  const traceBuffer = await page.tracing.stop();

  const trace = JSON.parse(Buffer.from(traceBuffer).toString("utf8"));
  const sums = { UpdateLayoutTree: 0, Layout: 0, Paint: 0, PrePaint: 0 };
  for (const event of trace.traceEvents) {
    if (event.name in sums && typeof event.dur === "number") sums[event.name] += event.dur / 1000;
  }

  const fromPage = await page.evaluate(() => ({
    cls: window.__cls,
    longTasks: window.__longTasks,
    elements: document.getElementsByTagName("*").length,
    docHeight: document.documentElement.scrollHeight,
  }));

  await client.detach();
  await page.close();

  return {
    longTaskTotal: fromPage.longTasks.reduce((t, d) => t + Math.max(0, d - 50), 0),
    longTaskCount: fromPage.longTasks.length,
    longestTask: fromPage.longTasks.length ? Math.max(...fromPage.longTasks) : 0,
    recalcStyle: sums.UpdateLayoutTree,
    layout: sums.Layout,
    paint: sums.Paint + sums.PrePaint,
    styleLayoutPaint: sums.UpdateLayoutTree + sums.Layout + sums.Paint + sums.PrePaint,
    cls: fromPage.cls,
    elements: fromPage.elements,
    docHeight: fromPage.docHeight,
  };
}

const order = buildOrder(RUNS);
const results = [];
const startedAt = Date.now();

for (let i = 0; i < order.length; i++) {
  const { arm, block } = order[i];
  const sample = await measureOnce(arms[arm].url);
  results.push({
    index: i,
    block,
    arm: arms[arm].label,
    armIndex: arm,
    tMs: Date.now() - startedAt,
    ...sample,
  });
  process.stderr.write(
    `  ${String(i + 1).padStart(3)}/${order.length}  block ${String(block).padStart(2)}  ` +
      `${arms[arm].label.padEnd(6)}  longTask ${sample.longTaskTotal.toFixed(0).padStart(6)} ms  ` +
      `slp ${sample.styleLayoutPaint.toFixed(0).padStart(5)} ms\n`,
  );
}

await browser.close();

// ------------------------------------------------------------------ report

const A = results.filter((r) => r.armIndex === 0);
const B = results.filter((r) => r.armIndex === 1);
const labelA = arms[0].label;
const labelB = arms[1].label;

console.log(
  `\n=== interleaved A/B — ${RUNS} runs per arm, ${THROTTLE}x CPU throttle, ABBA blocks ===`,
);
console.log(`  A = ${labelA}  ${arms[0].url}`);
console.log(`  B = ${labelB}  ${arms[1].url}\n`);

const METRICS = [
  "longTaskTotal",
  "styleLayoutPaint",
  "recalcStyle",
  "layout",
  "paint",
  "longestTask",
  "longTaskCount",
  "cls",
  "elements",
  "docHeight",
];

const summary = {};

for (const metric of METRICS) {
  const a = A.map((r) => r[metric]);
  const b = B.map((r) => r[metric]);
  const round = metric === "cls" ? 4 : metric === "elements" || metric === "docHeight" ? 0 : 1;
  const f = (v) => Number(v).toFixed(round);

  const mw = mannWhitney(a, b);
  const hl = hodgesLehmann(a, b);
  const boot = bootstrapMedianDiff(a, b);

  // Block-paired: mean of each arm's two runs inside a block, differenced.
  const blockDiffs = [];
  for (let blk = 0; blk < RUNS / 2; blk++) {
    const inBlockA = A.filter((r) => r.block === blk).map((r) => r[metric]);
    const inBlockB = B.filter((r) => r.block === blk).map((r) => r[metric]);
    if (!inBlockA.length || !inBlockB.length) continue;
    const meanA = inBlockA.reduce((s, v) => s + v, 0) / inBlockA.length;
    const meanB = inBlockB.reduce((s, v) => s + v, 0) / inBlockB.length;
    blockDiffs.push(meanB - meanA);
  }
  const wil = wilcoxonSigned(blockDiffs);

  summary[metric] = {
    a: { median: median(a), min: Math.min(...a), max: Math.max(...a), p25: quantile(a, 0.25), p75: quantile(a, 0.75), values: a },
    b: { median: median(b), min: Math.min(...b), max: Math.max(...b), p25: quantile(b, 0.25), p75: quantile(b, 0.75), values: b },
    medianDiff: median(b) - median(a),
    hodgesLehmann: hl,
    bootstrapCI: boot,
    mannWhitneyP: mw.p,
    wilcoxonP: wil.p,
    blockDiffs,
  };

  console.log(`--- ${metric}`);
  console.log(
    `  ${labelA.padEnd(6)} median ${f(median(a)).padStart(9)}   IQR ${f(quantile(a, 0.25))} - ${f(quantile(a, 0.75))}   range ${f(Math.min(...a))} - ${f(Math.max(...a))}`,
  );
  console.log(
    `  ${labelB.padEnd(6)} median ${f(median(b)).padStart(9)}   IQR ${f(quantile(b, 0.25))} - ${f(quantile(b, 0.75))}   range ${f(Math.min(...b))} - ${f(Math.max(...b))}`,
  );
  console.log(
    `  shift  ${f(median(b) - median(a)).padStart(9)}  (median)   ` +
      `${f(hl.shift)} (Hodges-Lehmann)  95% CI ${f(hl.low)} to ${f(hl.high)}`,
  );
  console.log(`  bootstrap 95% CI on median shift   ${f(boot.low)} to ${f(boot.high)}`);
  console.log(
    `  Mann-Whitney p ${mw.p.toFixed(4)}   Wilcoxon on ${wil.n} block pairs p ${wil.p.toFixed(4)}`,
  );
  console.log("");
}

// What the run could actually have resolved, printed next to what it found.
const lt = summary.longTaskTotal;
const halfWidth = (lt.hodgesLehmann.high - lt.hodgesLehmann.low) / 2;
console.log("--- resolution");
console.log(
  `  longTaskTotal 95% interval is ${halfWidth.toFixed(0)} ms wide either side of the estimate.`,
);
console.log(
  `  A difference smaller than that cannot be told from zero at this sample size,`,
);
console.log(`  whatever the p-value says.\n`);

if (OUT) {
  writeFileSync(OUT, JSON.stringify({ arms, RUNS, THROTTLE, results, summary }, null, 2));
  console.log(`raw written to ${OUT}`);
}
