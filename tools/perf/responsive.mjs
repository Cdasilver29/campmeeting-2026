/**
 * The responsiveness audit, run rather than eyeballed.
 *
 * Nine widths x every route. Per combination it reports four things, all
 * of which are cheap to measure and expensive to notice by hand:
 *
 *   overflow    document.scrollWidth beyond clientWidth, plus the widest
 *               offending elements by name, so the cause is in the output
 *               and not a hunt afterwards
 *   clipped     an element whose content is wider than its box while its
 *               overflow is hidden or clipped — text being cut off
 *   taps        interactive elements under the target-size floor, in TWO
 *               bands, because they are two different findings:
 *
 *                 under 24px  fails WCAG 2.2 SC 2.5.8 Target Size
 *                             (Minimum), which is AA and is the floor
 *                             CLAUDE.md sets. A real defect.
 *                 under 44px  misses SC 2.5.5 Target Size (Enhanced),
 *                             which is AAA. Reported separately and
 *                             NOT counted as a problem.
 *
 *               One number was actively harmful here. This site sizes
 *               its controls 44px at touch widths and shrinks them at
 *               `lg`, where there is a pointer — `h-11 lg:h-8` on the
 *               inputs, `lg:h-9` on the filter selects. That is a
 *               deliberate affordance and it passes AA at 32 and 36px,
 *               but a flat 44 threshold reported 36 of them as failures
 *               and buried the one control that was genuinely wrong (the
 *               back button, 81x36, since fixed) inside the noise. This
 *               README's own opening warning is about an instrument that
 *               drives the design; a threshold that fails compliant
 *               controls is exactly that.
 *
 *               Inline links inside running text are exempt (WCAG 2.2
 *               target-size exemption) and are filtered by computed
 *               display rather than by guessing at selectors
 *   rail        whether the day rail is scrollable at this width, which
 *               is the specific bug being fixed: nine tiles must fit from
 *               md upward and may only scroll below it
 *
 * Offenders are reported as tag + first two class names, which is enough
 * to find the element and short enough to read in a table.
 *
 *   node responsive.mjs [baseUrl]
 */
import { launch } from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.argv[2] ?? "http://localhost:3100";

const WIDTHS = [360, 390, 414, 768, 820, 1024, 1280, 1440, 1920];

// Portrait heights for the phone and tablet widths, landscape for the
// desktop ones, because that is how each is actually held.
const HEIGHT = (w) => (w <= 414 ? 844 : w <= 820 ? 1180 : 900);

const ROUTES = [
  "/",
  "/schedule",
  "/schedule/sabbath-15",
  "/speakers",
  "/speakers/kennedy-mfune",
  "/ministries",
  "/ministries/children",
  "/about",
  "/faq",
  "/contact",
  "/livestream",
  "/downloads",
  "/announcements",
  // /prayer-requests was here and is removed. The route no longer exists,
  // so it was nine 404s per run reported as nine clean rows.
  "/children",
  "/gallery",
  "/offline",
  "/styleguide",
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
    await page.setViewport({
      width,
      height: HEIGHT(width),
      deviceScaleFactor: 1,
      isMobile: width <= 820,
      hasTouch: width <= 820,
    });
    await page.setRequestInterception(true);
    page.on("request", (r) => {
      if (/\/serwist\/|sw\.js/.test(r.url())) r.abort().catch(() => {});
      else r.continue().catch(() => {});
    });

    await page.goto(BASE + route, { waitUntil: "load", timeout: 120000 });
    await new Promise((res) => setTimeout(res, 700));

    const found = await page.evaluate(() => {
      const name = (el) => {
        const cls = (el.getAttribute("class") ?? "")
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .join(".");
        const id = el.id ? `#${el.id}` : "";
        return `${el.tagName.toLowerCase()}${id}${cls ? "." + cls : ""}`;
      };

      const client = document.documentElement.clientWidth;
      const all = [...document.querySelectorAll("body *")];

      /*
       * Screen-reader-only text is a 1x1 clipped box holding a full
       * sentence, by construction. Left in, it is the loudest thing in the
       * report — 126 "CLIPPED by 346px" rows and 126 "TAP<44 1x1" rows for
       * markup that is working exactly as intended — and real findings get
       * lost behind it. Detected by the clip, not by class name, so it also
       * catches a hand-rolled visually-hidden helper.
       */
      const isVisuallyHidden = (el) => {
        const cs = getComputedStyle(el);
        if (cs.clipPath === "inset(50%)") return true;
        const r = el.getBoundingClientRect();
        return r.width <= 1 && r.height <= 1;
      };

      /*
       * ...and anything inside such a box, which the check above misses
       * because the descendant of a 1x1 clipped span has a full-size rect
       * of its own. Also catches the spam honeypot, which is deliberately
       * parked at left:-9999px inside an aria-hidden wrapper: it was being
       * reported as a 215x24 tap target on every form on the site.
       */
      const inHiddenSubtree = (el) => {
        for (let n = el; n && n !== document.body; n = n.parentElement) {
          if (isVisuallyHidden(n)) return true;
          if (n.getAttribute("aria-hidden") === "true") return true;
          const cs = getComputedStyle(n);
          if (cs.opacity === "0" || cs.visibility === "hidden") return true;
        }
        return false;
      };

      /* Entirely off the left or top of the viewport: an off-screen
         positioning technique, not something a reader can hit or see. */
      const offScreen = (el) => {
        const r = el.getBoundingClientRect();
        return r.right <= 0 || r.bottom <= 0 || r.left >= client + 1000;
      };

      /*
       * The effective hit area, which is not always the border box.
       *
       * A 32px control with `before:absolute before:-inset-1.5` is a 44px
       * target; getBoundingClientRect reports 32 and knows nothing about
       * the pseudo-element. Reporting that as a failure sends you off to
       * "fix" a control that is already correct — and, worse, to make it
       * visually bigger to satisfy an instrument. So the negative insets
       * of ::before and ::after are read and added back.
       */
      const hitBox = (el) => {
        /*
         * A radio or checkbox wrapped in a label is activated by clicking
         * anywhere in the label, so the label is the target and the 16px
         * box is only the part that gets drawn. Measuring the input alone
         * reported every consent control on the site as a failure and
         * would have led to inflating a radio button to 44px to satisfy
         * the instrument.
         */
        if (el.tagName === "INPUT" && /^(radio|checkbox)$/.test(el.type)) {
          const label =
            el.closest("label") ??
            (el.id ? document.querySelector(`label[for="${el.id}"]`) : null);
          if (label) {
            const lr = label.getBoundingClientRect();
            if (lr.width > 0 && lr.height > 0) {
              return { width: lr.width, height: lr.height };
            }
          }
        }

        const r = el.getBoundingClientRect();
        let grow = { top: 0, right: 0, bottom: 0, left: 0 };
        for (const pseudo of ["::before", "::after"]) {
          const cs = getComputedStyle(el, pseudo);
          if (cs.content === "none" || cs.position !== "absolute") continue;
          for (const side of ["top", "right", "bottom", "left"]) {
            const v = parseFloat(cs[side]);
            if (Number.isFinite(v) && v < 0) {
              grow[side] = Math.max(grow[side], -v);
            }
          }
        }
        return {
          width: r.width + grow.left + grow.right,
          height: r.height + grow.top + grow.bottom,
        };
      };

      // Horizontal overflow: elements painting past the viewport's right
      // edge. Fixed and sticky elements are included — a sticky rail that
      // overflows is exactly the bug here.
      const overflowing = [];
      for (const el of all) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (inHiddenSubtree(el)) continue;
        if (rect.right > client + 1) {
          overflowing.push({ el, name: name(el), right: Math.round(rect.right) });
        }
      }
      // Only the outermost offenders. A too-wide element makes every
      // ancestor's content overflow as well, so the raw list is a chain
      // from <body> down and the useful entry is the one at the top of it.
      // Keep an entry only if no other offender contains it.
      const outermost = overflowing
        .filter((a) => !overflowing.some((b) => b.el !== a.el && b.el.contains(a.el)))
        .map(({ name, right }) => ({ name, right }));

      /*
       * The other way a document overflows, and the one the check above
       * cannot see: an element whose own box fits but whose CONTENT does
       * not, with overflow visible. An unbreakable 365px token inside a
       * 320px paragraph pushes the document out while every rect on the
       * page, including the paragraph's, stays inside the viewport.
       *
       * That case reported "OVERFLOW +25px []" — an overflow with no
       * offender — which is the sort of output that gets written off as
       * instrument noise. It was a real horizontal scrollbar on /faq at
       * 360.
       */
      if (outermost.length === 0) {
        for (const el of all) {
          if (inHiddenSubtree(el)) continue;
          const cs = getComputedStyle(el);
          if (cs.overflowX !== "visible") continue;
          if (el.children.length > 0) continue; // leaf holding the text
          if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
            outermost.push({
              name: `${name(el)} (content ${el.scrollWidth} in ${el.clientWidth})`,
              right: el.scrollWidth,
            });
          }
        }
      }

      // Clipped content: a box that hides its own overflow while holding
      // something wider than itself.
      const clipped = [];
      for (const el of all) {
        if (isVisuallyHidden(el)) continue;
        const cs = getComputedStyle(el);
        if (!/hidden|clip/.test(cs.overflowX)) continue;
        if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
          clipped.push({
            name: name(el),
            by: el.scrollWidth - el.clientWidth,
          });
        }
      }

      // Tap targets. Inline links inside running text are exempt under
      // WCAG 2.2, and computed display is how that is told apart from a
      // control laid out as a block or a flex item.
      const taps = [];
      for (const el of document.querySelectorAll(
        "a, button, select, input, [role=button], summary",
      )) {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        if (cs.display === "inline") continue;
        if (el.type === "hidden") continue;
        if (isVisuallyHidden(el) || inHiddenSubtree(el) || offScreen(el)) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        const hit = hitBox(el);
        const smallest = Math.min(hit.width, hit.height);
        if (smallest < 44) {
          taps.push({
            name: name(el),
            w: Math.round(hit.width),
            h: Math.round(hit.height),
            // AA is the line that matters. See the header note.
            failsAA: smallest < 24,
          });
        }
      }

      const scroller = document.getElementById("day-rail-scroller");
      const rail = scroller
        ? {
            scrollable: scroller.scrollWidth > scroller.clientWidth + 1,
            by: scroller.scrollWidth - scroller.clientWidth,
            tiles: scroller.children.length,
          }
        : null;

      return {
        overflow: document.documentElement.scrollWidth - client,
        offenders: outermost.slice(0, 4),
        clipped: clipped.slice(0, 4),
        taps,
        rail,
      };
    });

    rows.push({ route, width, ...found });
    await page.close();
  }
}

await browser.close();

const pad = (s, n) => String(s).padEnd(n);

console.log(`\n=== responsiveness — ${BASE} ===\n`);

let problems = 0;
for (const r of rows) {
  const bits = [];
  if (r.overflow > 0) {
    bits.push(
      `OVERFLOW +${r.overflow}px [${r.offenders.map((o) => o.name).join(", ")}]`,
    );
  }
  if (r.clipped.length) {
    bits.push(`CLIPPED ${r.clipped.map((c) => `${c.name} by ${c.by}px`).join(", ")}`);
  }
  const failingAA = r.taps.filter((t) => t.failsAA);
  if (failingAA.length) {
    const uniq = [...new Map(failingAA.map((t) => [t.name, t])).values()];
    bits.push(
      `TAP<24 (fails AA) ${uniq.map((t) => `${t.name} ${t.w}x${t.h}`).join(", ")}`,
    );
  }
  if (r.rail?.scrollable && r.width >= 768) {
    bits.push(`RAIL SCROLLS by ${r.rail.by}px (should not above md)`);
  }
  if (bits.length) {
    problems++;
    console.log(`${pad(r.route, 26)}${pad(r.width, 6)}${bits.join("\n" + " ".repeat(32))}`);
  }
}

console.log(
  `\n${problems === 0 ? "CLEAN" : `${problems} of ${rows.length} combinations have findings`}`,
);

/*
 * The AAA band, listed once by control rather than 36 times by
 * combination. It is not a failure list — it is what the site would have
 * to change to clear SC 2.5.5, and every entry in it is currently a
 * deliberate `lg:` compact variant of a control that is 44px on touch.
 */
const enhanced = new Map();
for (const r of rows) {
  for (const t of r.taps) {
    if (t.failsAA) continue;
    if (!enhanced.has(t.name)) enhanced.set(t.name, { ...t, routes: new Set() });
    enhanced.get(t.name).routes.add(r.route);
  }
}
if (enhanced.size) {
  console.log(`\n--- under 44px but passing AA (SC 2.5.5, AAA) ---`);
  for (const t of enhanced.values()) {
    console.log(`  ${pad(`${t.w}x${t.h}`, 10)}${pad(t.name, 44)}${[...t.routes].join(" ")}`);
  }
}

// The day rail specifically, since it is the named bug.
console.log(`\n--- day rail, /schedule ---`);
for (const r of rows.filter((r) => r.route === "/schedule" && r.rail)) {
  console.log(
    `  ${pad(r.width, 6)} tiles ${r.rail.tiles}  ` +
      `${r.rail.scrollable ? `scrolls, ${r.rail.by}px hidden` : "fits, nothing clipped"}`,
  );
}
