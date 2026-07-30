/**
 * Does the site have one alignment grid?
 *
 * The question this answers is narrow and was previously answered by eye,
 * wrongly: at 1920 the header lockup started 128px to the left of every
 * page title, because the shell ran at 64rem and the page wrappers at
 * 48rem. Eyes do not catch a 128px offset when the two elements are 80px
 * apart vertically and neither has a visible edge.
 *
 * So: measure the x position of the header lockup and the x position of
 * the page's h1, at each width, on each route, and require them equal.
 * Also report the content column's own width and left offset, which is
 * what the gate asks for.
 *
 * Left offsets are read from getBoundingClientRect(), which is the
 * painted position including any transform. The page-transition wrapper
 * animates translateY only, so x is unaffected, but the measurement waits
 * for it to settle regardless.
 *
 *   node align.mjs [baseUrl]
 */
import { launch } from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.argv[2] ?? "http://localhost:3100";

const WIDTHS = [390, 768, 1024, 1440, 1920];

const ROUTES = [
  "/",
  "/schedule",
  "/schedule/sabbath-15",
  "/speakers",
  "/ministries",
  "/about",
  "/faq",
  "/contact",
  "/livestream",
  "/downloads",
  "/announcements",
  "/prayer-requests",
  "/gallery",
  "/offline",
  "/styleguide",
  "/speakers/kennedy-mfune",
  "/ministries/children",
];

const browser = await launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
});

const rows = [];

for (const route of ROUTES) {
  for (const width of WIDTHS) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await page.setRequestInterception(true);
    page.on("request", (r) => {
      if (/\/serwist\/|sw\.js/.test(r.url())) r.abort().catch(() => {});
      else r.continue().catch(() => {});
    });

    await page.goto(BASE + route, { waitUntil: "load", timeout: 120000 });
    // Past the page transition, so nothing is mid-translate.
    await new Promise((res) => setTimeout(res, 600));

    const measured = await page.evaluate(() => {
      const round = (n) => Math.round(n * 100) / 100;

      const contentBox = (el) => {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const padL = parseFloat(cs.paddingLeft);
        const padR = parseFloat(cs.paddingRight);
        return {
          left: round(rect.left + padL),
          width: round(rect.width - padL - padR),
          gutter: round(padL),
        };
      };

      // The header's own shell container, and the lockup inside it.
      const headerShell = document.querySelector("header .shell");
      const lockup = document.querySelector("header a[href='/'], header .shell > *");

      // The page's own shell. On the home page the hero carries one too,
      // and the first `main .shell` is the one under it; take the wrapper
      // that actually holds the h1 where there is one.
      const h1 = document.querySelector("main h1");
      let pageShell = null;
      if (h1) {
        pageShell = h1.closest(".shell");
      }
      if (!pageShell) pageShell = document.querySelector("main .shell");

      return {
        headerShell: contentBox(headerShell),
        lockupLeft: lockup ? round(lockup.getBoundingClientRect().left) : null,
        pageShell: contentBox(pageShell),
        h1Left: h1 ? round(h1.getBoundingClientRect().left) : null,
        h1Tag: h1 ? h1.className.slice(0, 30) : null,
        docScrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      };
    });

    rows.push({ route, width, ...measured });
    await page.close();
  }
}

await browser.close();

const pad = (s, n) => String(s).padEnd(n);
const num = (v, n = 8) => String(v ?? "-").padStart(n);

console.log(
  `\n=== alignment — ${BASE} ===\n` +
    `lockup x = left edge of the header brand lockup\n` +
    `h1 x     = left edge of the page title\n` +
    `content  = the shell's content-box width (gutters excluded)\n`,
);

console.log(
  pad("route", 26) +
    num("vw", 6) +
    num("lockup x") +
    num("h1 x") +
    num("match", 7) +
    num("content") +
    num("shell L") +
    num("gutter") +
    num("overflow", 10),
);

let failures = 0;
for (const r of rows) {
  const match =
    r.lockupLeft !== null && r.h1Left !== null
      ? Math.abs(r.lockupLeft - r.h1Left) < 0.5
      : null;
  if (match === false) failures++;
  const overflow = r.docScrollWidth > r.clientWidth ? `+${r.docScrollWidth - r.clientWidth}` : "ok";
  console.log(
    pad(r.route, 26) +
      num(r.width, 6) +
      num(r.lockupLeft) +
      num(r.h1Left) +
      num(match === null ? "n/a" : match ? "YES" : "NO", 7) +
      num(r.pageShell?.width) +
      num(r.pageShell?.left) +
      num(r.pageShell?.gutter) +
      num(overflow, 10),
  );
}

console.log(
  `\n${failures === 0 ? "PASS" : `FAIL — ${failures} mismatched`} ` +
    `(${rows.length} route x width combinations)`,
);
