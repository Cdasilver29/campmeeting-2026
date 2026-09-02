/**
 * /archive and the home page showcase, checked end to end on the built site.
 *
 * Needs `next start -p 3100` running against a production build. Every
 * assertion here is one the archive work was gated on: the click-to-load
 * discipline, the lazy thumbnails, the year and theme controls, the one
 * session with no recording, the showcase rotation and its pause control,
 * and what prefers-reduced-motion does to all of it.
 *
 * Usage: node tools/perf/archive.mjs
 * Exit code 1 if any assertion fails.
 */
import { launch } from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3100";

const browser = await launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox"],
});

const results = [];
const check = (name, pass, detail = "") =>
  results.push({ name, pass, detail });

async function newPage({ reducedMotion = false, viewport } = {}) {
  const page = await browser.newPage();
  await page.setViewport(viewport ?? { width: 1440, height: 900 });
  await page.setCacheEnabled(false);
  if (reducedMotion) {
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
  }
  // Keep the service worker out of the way, the same way cls.mjs and
  // measure.mjs do: block its script rather than stubbing the API, which
  // Next's registration code reads during hydration.
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (/\/serwist\/|sw\.js/.test(request.url())) request.abort().catch(() => {});
    else request.continue().catch(() => {});
  });
  return page;
}

/* ── 1. No YouTube request on /archive until a poster is pressed ───── */
{
  const page = await newPage();
  const yt = [];
  page.on("request", (r) => {
    const h = new URL(r.url()).hostname;
    if (h.includes("youtube") || h.includes("ytimg") || h.includes("ggpht"))
      yt.push(r.url());
  });
  await page.goto(`${BASE}/archive`, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));

  const players = yt.filter((u) => u.includes("/embed/"));
  check(
    "/archive opens no YouTube PLAYER before a press",
    players.length === 0,
    `${players.length} embed requests`,
  );
  const thumbs = yt.filter((u) => u.includes("img.youtube.com"));
  check(
    "/archive does load thumbnails (lazily, in-viewport only)",
    thumbs.length > 0 && thumbs.length < 54,
    `${thumbs.length} of 54 thumbnails fetched on load`,
  );
  await page.close();
}

/* ── 2. Year tabs: 7 of them, 2026 first and selected ──────────────── */
{
  const page = await newPage();
  // networkidle0, not domcontentloaded: everything below presses a
  // React control, and a press before hydration silently does nothing.
  await page.goto(`${BASE}/archive`, { waitUntil: "networkidle0" });
  await page.waitForFunction(
    () =>
      document.querySelector('[role="tab"]')?.getAttribute("aria-selected") !==
      null,
  );
  const tabs = await page.$$eval('[role="tab"]', (els) =>
    els.map((e) => ({
      text: e.textContent.trim(),
      selected: e.getAttribute("aria-selected") === "true",
    })),
  );
  check("/archive has one tab per archived year", tabs.length === 7, `${tabs.length} tabs`);
  check(
    "the most recent year leads, is selected, and is marked Latest",
    tabs[0]?.text.startsWith("2026") &&
      tabs[0]?.selected &&
      tabs[0]?.text.includes("Latest"),
    JSON.stringify(tabs[0]),
  );
  check(
    "only one tab is selected",
    tabs.filter((t) => t.selected).length === 1,
  );

  /* Theme sections and counts. */
  const sections = await page.$$eval("section[id]", (els) =>
    els
      .filter((e) => e.querySelector("h3"))
      .map((e) => e.querySelector("h3").textContent.replace(/\s+/g, " ").trim()),
  );
  check(
    "/archive renders nine themed sections with counts",
    sections.length === 9,
    sections.join(" | "),
  );

  /* One action to all the Stewardship talks. */
  const before = await page.$$eval("section[id]", (e) => e.length);
  const pressed = await page.evaluate(() => {
    const chip = [...document.querySelectorAll("button")].find((b) =>
      b.textContent.trim().startsWith("Stewardship"),
    );
    if (!chip) return false;
    chip.click();
    return true;
  });
  await new Promise((r) => setTimeout(r, 300));
  const after = await page.$$eval("section[id]", (e) =>
    e.map((x) => x.id),
  );
  check(
    "one press on the Stewardship chip narrows the page to it",
    pressed && after.length === 1 && after[0] === "stewardship",
    `${before} sections -> ${after.join(",")}`,
  );

  /* The unavailable recording is present and is not a link. */
  await page.evaluate(() => {
    const all = [...document.querySelectorAll("button")].find(
      (b) => b.textContent.trim().startsWith("All themes"),
    );
    all?.click();
  });
  await new Promise((r) => setTimeout(r, 300));
  const missing = await page.evaluate(() => {
    const panel = document.getElementById("archive-panel-2026");
    const cards = [...panel.querySelectorAll("section[id] > ul > li")];
    const without = cards.filter((li) =>
      li.textContent.includes("Recording not available"),
    );
    return {
      cards: cards.length,
      links: cards.filter((li) =>
        li.querySelector('a[href*="youtube.com/watch"]'),
      ).length,
      count: without.length,
      anyIsLink: without.some((li) => Boolean(li.querySelector("a"))),
      text: without[0]?.textContent.replace(/\s+/g, " ").trim() ?? "",
    };
  });
  check(
    "all 55 sessions are listed, 54 of them as links",
    missing.cards === 55 && missing.links === 54,
    `${missing.cards} cards, ${missing.links} links`,
  );
  check(
    "the one session with no recording is listed and is not a link",
    missing.count === 1 && missing.anyIsLink === false,
    missing.text,
  );
  await page.close();
}

/* ── 3. Home showcase: rotates, pauses, and stops dead when asked ──── */
{
  const page = await newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });

  const phase = await page.$eval("#home-archive", (e) =>
    e.getAttribute("data-archive-phase"),
  );
  check("home showcase resolves the event phase", phase === "after", `phase=${phase}`);

  const railSel = "#home-archive ul[aria-label]";
  const cards = await page.$$eval(`${railSel} > li`, (e) => e.length);
  check("the showcase holds the 14 sermons", cards === 14, `${cards} cards`);

  const hasPause = await page.$eval("#home-archive", (e) =>
    Boolean(
      [...e.querySelectorAll("button")].find((b) =>
        (b.getAttribute("aria-label") ?? "").includes("archive highlights"),
      ),
    ),
  );
  check("a pause control is rendered and keyboard reachable", hasPause);

  const start = await page.$eval(railSel, (e) => e.scrollLeft);
  await new Promise((r) => setTimeout(r, 6000));
  const moved = await page.$eval(railSel, (e) => e.scrollLeft);
  check("the rail advances on its own", moved > start, `${start} -> ${moved}`);

  /* Press pause and confirm it stops. */
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("#home-archive button")].find((x) =>
      (x.getAttribute("aria-label") ?? "").includes("archive highlights"),
    );
    b.click();
  });
  const atPause = await page.$eval(railSel, (e) => e.scrollLeft);
  await new Promise((r) => setTimeout(r, 6000));
  const afterPause = await page.$eval(railSel, (e) => e.scrollLeft);
  check(
    "the pause control actually stops it",
    Math.abs(afterPause - atPause) < 2,
    `${atPause} -> ${afterPause}`,
  );
  await page.close();
}

/* ── 4. prefers-reduced-motion stops it completely ─────────────────── */
{
  const page = await newPage({ reducedMotion: true });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
  const railSel = "#home-archive ul[aria-label]";
  const start = await page.$eval(railSel, (e) => e.scrollLeft);
  await new Promise((r) => setTimeout(r, 7000));
  const end = await page.$eval(railSel, (e) => e.scrollLeft);
  check(
    "reduced motion: the rail never moves",
    start === 0 && end === 0,
    `${start} -> ${end}`,
  );
  const pauseShown = await page.$eval("#home-archive", (e) =>
    Boolean(
      [...e.querySelectorAll("button")].find((b) =>
        (b.getAttribute("aria-label") ?? "").includes("archive highlights"),
      ),
    ),
  );
  check(
    "reduced motion: no pause control, because nothing rotates",
    pauseShown === false,
  );
  const stillReachable = await page.$$eval(`${railSel} > li a`, (e) => e.length);
  check(
    "reduced motion: every card is still present and reachable",
    stillReachable === 14,
    `${stillReachable} links`,
  );
  await page.close();
}

/* ── 5. /livestream carries no archive grid any more ───────────────── */
{
  const page = await newPage();
  await page.goto(`${BASE}/livestream`, { waitUntil: "networkidle0" });
  const thumbs = await page.$$eval("img", (els) =>
    els.filter((e) => e.src.includes("img.youtube.com")).length,
  );
  check("/livestream renders no recording thumbnails", thumbs === 0, `${thumbs} found`);
  const toArchive = await page.$$eval('a[href="/archive"]', (e) => e.length);
  check("/livestream routes to /archive", toArchive > 0, `${toArchive} links`);
  const nav = await page.$$eval('nav a, header a', (els) =>
    els.map((e) => e.getAttribute("href")).filter((h) => h === "/archive").length,
  );
  check("/archive is in the site header", nav > 0, `${nav} nav links`);
  await page.close();
}

/* ── 6. Nothing in the archive imports the programme ───────────────── */
{
  const page = await newPage();
  await page.goto(`${BASE}/archive`, { waitUntil: "domcontentloaded" });
  const leaked = await page.evaluate(() =>
    document.body.textContent.includes("Sabbath Preparation") ||
    document.body.textContent.includes("Medical Camp"),
  );
  check("/archive shows no programme content", leaked === false);
  await page.close();
}

await browser.close();

let failed = 0;
console.log("");
for (const r of results) {
  if (!r.pass) failed++;
  console.log(
    `${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  — ${r.detail}` : ""}`,
  );
}
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
