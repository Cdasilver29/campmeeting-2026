/**
 * Does the site have one alignment grid?
 *
 * The question this answers is narrow and was previously answered by eye,
 * wrongly: at 1920 the header lockup started 128px to the left of every
 * page title, because the shell ran at 64rem and the page wrappers at
 * 48rem. Eyes do not catch a 128px offset when the two elements are 80px
 * apart vertically and neither has a visible edge.
 *
 * ── What this asserts, and why it is no longer the h1 ─────────────────
 *
 * It used to measure the page's h1 against the lockup and require them
 * equal. That assertion is dead: PageHeader is now a full-bleed band on
 * --color-surface-muted whose contents are centred, so on the thirteen
 * routes that carry one the h1 is deliberately NOT on the left edge. Left
 * as written, this harness would report 65 failures for a layout that is
 * doing exactly what it was asked to do — which is worse than no harness,
 * because the next person to run it spends an afternoon un-fixing the
 * thing it complains about.
 *
 * So the grid check moved down one element. What has to stay on the grid
 * is the BODY of the page: the first real piece of content below the
 * header band, which is where left-aligned reading starts again. That is
 * measured against the lockup and required equal, exactly as the h1 was.
 *
 * A second assertion replaces the one that was lost. The header band's
 * own intent is that its block is centred in the shell, so that is checked
 * too: the header's horizontal midpoint against the shell content box's
 * midpoint. Between them the two cover what the old single check covered,
 * plus the thing that broke it.
 *
 * Routes with no PageHeader (`/`, and any page that opens with something
 * else) fall back to measuring the h1 against the lockup, which is still
 * the right question there. The `basis` column says which of the two ran,
 * so a route silently changing shape is visible rather than absorbed.
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

      // The site header's own shell container, and the lockup inside it.
      // `header .shell` is scoped to the site header rather than to any
      // `header` on the page, which since the page header became a band
      // includes PageHeader's own element.
      const siteHeader = document.querySelector("body > header, header:not(main header)");
      const headerShell = siteHeader?.querySelector(".shell") ?? null;
      const lockup =
        siteHeader?.querySelector("a[href='/']") ??
        siteHeader?.querySelector(".shell > *") ??
        null;

      const h1 = document.querySelector("main h1");

      // The page header band, by its own attribute rather than by shape.
      // `main header` is not specific enough: /offline and /styleguide
      // each hand-roll a <header>, and /offline's sits inside a plain
      // Band, so shape-sniffing scored both as uncentred page headers.
      const headerBand = document.querySelector("[data-page-header]");
      const pageHeader = headerBand?.querySelector("header") ?? null;

      /**
       * Off-screen and zero-size content, filtered the way the responsive
       * harness has to filter it.
       *
       * Ancestors are walked, not just the element. The spam honeypot is
       * a 1x1 clipped wrapper at left:-9999px holding a full-size input:
       * the WRAPPER is off-screen and the input is statically positioned
       * inside it, so an element-only check sees a 215px-wide input and
       * reports /prayer-requests as aligning at x=-9999.
       */
      const isHidden = (el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return true;
        if (rect.right < 0 || rect.left > window.innerWidth) return true;

        for (let node = el; node && node !== document.body; node = node.parentElement) {
          const cs = getComputedStyle(node);
          if (cs.visibility === "hidden" || cs.display === "none") return true;
          if (cs.opacity === "0") return true;
          if (node.getAttribute("aria-hidden") === "true") return true;
          const box = node.getBoundingClientRect();
          if (box.width < 2 || box.height < 2) return true;
          if (box.right < 0 || box.left > window.innerWidth) return true;
        }
        return false;
      };

      /**
       * The first piece of real content below the header band: the element
       * where left-aligned reading starts again. A wrapper div would pass
       * trivially — it is full-width, so its left edge is the shell's by
       * construction and proves nothing — so this looks for something that
       * actually carries type.
       *
       * Centred elements are skipped rather than measured. /downloads and
       * /announcements both open with an EmptyState, which is `text-center`
       * by design, and measuring its paragraph reported a 120px offset on
       * ten combinations for markup doing exactly what it should. What the
       * assertion is about is where LEFT-ALIGNED reading resumes, so an
       * element that is deliberately not left-aligned is not a
       * counterexample to it.
       *
       * Returns a reason rather than a bare null, so "this page has no
       * left-aligned body content" is reported as the design state it is
       * instead of being scored as a failure.
       */
      const firstBelowBand = () => {
        if (!headerBand) return { el: null, reason: "no-band" };
        let sawCentred = false;
        let scope = headerBand.nextElementSibling;
        while (scope) {
          const candidates = scope.querySelectorAll(
            "h2, h3, p, li, dt, label, a, button, input, select, textarea",
          );
          for (const el of candidates) {
            if (isHidden(el)) continue;
            const align = getComputedStyle(el).textAlign;
            if (align === "center" || align === "-webkit-center") {
              sawCentred = true;
              continue;
            }
            return { el, reason: "ok" };
          }
          scope = scope.nextElementSibling;
        }
        return { el: null, reason: sawCentred ? "all-centred" : "nothing" };
      };

      const { el: below, reason: belowReason } = firstBelowBand();

      // The shell the body content sits on, for the width/gutter columns.
      let pageShell =
        below?.closest(".shell") ??
        h1?.closest(".shell") ??
        document.querySelector("main .shell");

      const headerRect = pageHeader?.getBoundingClientRect() ?? null;
      const headerShellBox = headerBand
        ? contentBox(headerBand.querySelector(".shell"))
        : null;

      return {
        headerShell: contentBox(headerShell),
        lockupLeft: lockup ? round(lockup.getBoundingClientRect().left) : null,
        pageShell: contentBox(pageShell),
        h1Left: h1 ? round(h1.getBoundingClientRect().left) : null,
        hasBand: !!headerBand,
        belowReason,
        belowLeft: below ? round(below.getBoundingClientRect().left) : null,
        belowTag: below
          ? below.tagName.toLowerCase() +
            (below.id ? `#${below.id}` : "") +
            `:${(below.textContent ?? "").trim().slice(0, 18)}`
          : null,

        /*
         * Is the column holding that content centred in its shell?
         *
         * A prose column is capped at the measure (~34rem) and centred in
         * an 80rem shell, so on a wide viewport its left edge is NOT the
         * shell's left edge and never can be. Asserting it against the
         * header lockup's x reports six routes as broken for doing exactly
         * what they are designed to do. What is actually true of a centred
         * column is that its two gutters are equal, so that is what gets
         * measured.
         *
         * Found geometrically rather than by class name: the wrapper stack
         * between the shell and the type varies (BandDrift, Reveal, a
         * document stack), and matching on `.prose-column` would miss the
         * pages that use the max-w-(--width-prose) form instead.
         */
        bodyColumnCentred: (() => {
          // Falls back to the h1 for the same reason the x measurement
          // does: /offline and /styleguide hand-roll a header and have no
          // page-header band, and their content is centred too.
          const anchor = below ?? h1;
          if (!anchor || !pageShell) return null;
          const shellBox = pageShell.getBoundingClientRect();
          const shellStyle = getComputedStyle(pageShell);
          const innerLeft = shellBox.left + parseFloat(shellStyle.paddingLeft);
          const innerRight = shellBox.right - parseFloat(shellStyle.paddingRight);
          const innerWidth = innerRight - innerLeft;

          /*
           * The OUTERMOST ancestor narrower than the shell, not the
           * innermost. /prayer-requests nests a field column (34rem)
           * inside the prose column (68ch), and the field column is
           * ranged left inside it — correctly, a form is not centred type.
           * Taking the innermost match measured the field column against
           * the shell and reported the page as off the grid. What is being
           * asked is where the page's content column sits, which is the
           * last one before the shell.
           */
          let outermost = null;
          for (let el = anchor; el && el !== pageShell; el = el.parentElement) {
            const box = el.getBoundingClientRect();
            if (box.width < innerWidth - 1) outermost = box;
          }
          if (!outermost) return null;

          const gapLeft = outermost.left - innerLeft;
          const gapRight = innerRight - outermost.right;
          // Only meaningful when there is real slack to distribute.
          if (gapLeft + gapRight < 2) return null;
          return Math.abs(gapLeft - gapRight) <= 1;
        })(),
        /* Centring of the header block inside its own shell content box —
           for the bands that are centred. /speakers is not: it carries a
           left-aligned lockup over its photograph and says so with
           data-header-align="start". Measured anyway it reports a ~300px
           offset at every width, which is the harness sending the next
           person to centre something that is deliberately ranged left. That
           is the failure mode the whole `data-page-header` attribute exists
           to avoid, one level down.

           Reported as "start" rather than skipped silently, so a band that
           LOSES its centring without declaring the change still fails. */
        headerAlign: headerBand?.getAttribute("data-header-align") ?? null,
        headerCentreOffset:
          headerBand?.getAttribute("data-header-align") === "start"
            ? null
            : headerRect && headerShellBox
              ? round(
                  headerRect.left +
                    headerRect.width / 2 -
                    (headerShellBox.left + headerShellBox.width / 2),
                )
              : null,
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
    `body x   = left edge of the first real content below the header band,\n` +
    `           or of the h1 on a route with no header band (basis column)\n` +
    `centred  = header block's midpoint minus its shell's midpoint, in px\n` +
    `content  = the shell's content-box width (gutters excluded)\n`,
);

console.log(
  pad("route", 26) +
    num("vw", 6) +
    num("lockup x") +
    num("body x") +
    num("basis", 7) +
    num("match", 7) +
    num("how", 8) +
    num("centred", 9) +
    num("content") +
    num("gutter") +
    num("overflow", 10),
);

let gridFailures = 0;
let centreFailures = 0;
let unmeasured = 0;

for (const r of rows) {
  // Below the band where there is one, the h1 where there is not.
  const basis = r.hasBand
    ? r.belowLeft !== null
      ? "below"
      : r.belowReason === "all-centred"
        ? "centrd"
        : "none"
    : "h1";
  const bodyLeft = r.hasBand ? r.belowLeft : r.h1Left;

  /*
   * Two ways to be on the grid, not one.
   *
   * A full-width column starts where the header lockup starts. A prose
   * column is capped at the measure and CENTRED in the shell, so it
   * cannot start there and is on the grid when its gutters are equal.
   * Before this distinction existed the harness scored /about, /faq,
   * /contact, /livestream, /prayer-requests and /offline as 24 failures
   * for being centred on purpose.
   */
  const flushLeft =
    r.lockupLeft !== null && bodyLeft !== null
      ? Math.abs(r.lockupLeft - bodyLeft) < 0.5
      : null;
  const match =
    flushLeft === true ? true : r.bodyColumnCentred === true ? true : flushLeft;
  const basisKind = flushLeft === true ? "flush" : match === true ? "centrd" : "-";
  if (match === false) gridFailures++;
  // A band with genuinely nothing below it is not a pass. A band whose
  // body content is all deliberately centred (an EmptyState page) is:
  // there is no left-aligned reading on it to be off the grid.
  if (r.hasBand && r.belowLeft === null && r.belowReason !== "all-centred") {
    unmeasured++;
  }

  // 1px, not 0.5: the header block's own width can land on a half pixel
  // at an odd viewport width, and half of that is a rounding artefact
  // rather than an alignment fault.
  const centred =
    r.headerCentreOffset === null ? null : Math.abs(r.headerCentreOffset) <= 1;
  if (centred === false) centreFailures++;

  const overflow = r.docScrollWidth > r.clientWidth ? `+${r.docScrollWidth - r.clientWidth}` : "ok";
  console.log(
    pad(r.route, 26) +
      num(r.width, 6) +
      num(r.lockupLeft) +
      num(bodyLeft) +
      num(basis, 7) +
      num(match === null ? "n/a" : match ? `YES` : "NO", 7) +
      num(basisKind, 8) +
      num(
        r.headerAlign === "start"
          ? "start"
          : r.headerCentreOffset === null
            ? "n/a"
            : centred
              ? "YES"
              : `NO ${r.headerCentreOffset}`,
        9,
      ) +
      num(r.pageShell?.width) +
      num(r.pageShell?.gutter) +
      num(overflow, 10),
  );

  // Name the element a failure was measured on. A bare "NO" sends you
  // hunting for a misaligned page when the answer is usually that the
  // harness picked the wrong element, which is how the last four bugs in
  // these scripts went.
  if (match === false) {
    console.log(pad("", 26) + "  ^ measured on: " + (r.belowTag ?? "h1"));
  }
}

// What the report says it measured, so a future silent miss is visible.
const withBand = rows.filter((r) => r.hasBand).length;
const allCentred = rows.filter((r) => r.belowReason === "all-centred").length;
console.log(
  `\nmeasured: ${withBand} of ${rows.length} combinations carry a header band ` +
    `(body x taken below it); ${rows.length - withBand} fall back to the h1.\n` +
    `          ${allCentred} have no left-aligned body content below the band ` +
    `(an EmptyState page); nothing there can be off the grid.`,
);

const problems = gridFailures + centreFailures + unmeasured;
console.log(
  `\n${problems === 0 ? "PASS" : "FAIL"} — ` +
    `${gridFailures} off the grid, ` +
    `${centreFailures} header blocks not centred, ` +
    `${unmeasured} bands with nothing measurable below them ` +
    `(${rows.length} route x width combinations)`,
);

process.exitCode = problems === 0 ? 0 : 1;
