/**
 * The phone hero and the phone header, measured on the real built page.
 *
 * `verify-hero.mjs` is the instrument for the six desktop widths and it
 * stays that. This one answers the questions that are only questions on a
 * phone, and that no existing harness asks:
 *
 *   - what part of the photograph is actually in the frame, given that a
 *     near-full-height portrait box crops the WIDTH and the subject is
 *     what has to survive
 *   - whether the primary action clears the fold on the smallest phone
 *     worth supporting, which is the one thing a full-height hero can
 *     silently get wrong
 *   - every header control's real hit box against the 48px floor,
 *     including pseudo-element hit areas, which getBoundingClientRect
 *     does not see
 *   - the header in both states, over the photograph, at four widths
 *     none of which the desktop harness covers
 *
 * 320 is in the list because it is the narrowest viewport in real use and
 * the header lockup had to be designed against it, not because anything
 * else on the site is tuned for it.
 *
 * Usage: node phone-hero.mjs [phase]     phase: before | during | after
 */
import { launch } from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3100";
const PHONES = [
  { w: 320, h: 640, note: "narrowest in use" },
  { w: 360, h: 640, note: "the fold test" },
  { w: 390, h: 844, note: "iPhone 14/15" },
  { w: 414, h: 896, note: "iPhone 11 Pro Max" },
];
/** The file on disk, for the kept-window arithmetic. */
const SOURCE = { w: 735, h: 616 };
const TARGET_FLOOR = 48;

const lin = (v) => {
  const x = v / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
};
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const parse = (css) => css.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
const against = (typeCss, L) => {
  const tl = lum(...parse(typeCss));
  return (Math.max(tl, L) + 0.05) / (Math.min(tl, L) + 0.05);
};
const isLight = (css) => lum(...parse(css)) > 0.4;

const phase = process.argv[2] ?? "before";

const browser = await launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--force-device-scale-factor=1"],
});

const rows = [];

for (const v of PHONES) {
  const page = await browser.newPage();
  await page.setViewport({ width: v.w, height: v.h, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: "light" },
  ]);
  await page.setRequestInterception(true);
  page.on("request", (r) => {
    if (/\/serwist\/|sw\.js/.test(r.url())) r.abort().catch(() => {});
    else r.continue().catch(() => {});
  });
  await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 500));

  await page.evaluate((p) => {
    document.getElementById("home-hero").setAttribute("data-hero-phase", p);
  }, phase);
  await new Promise((r) => setTimeout(r, 250));

  const geo = await page.evaluate(() => {
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom };
    };
    const hero = document.getElementById("home-hero");
    const block = document.getElementById("home-hero-text");
    const header = document.querySelector("header");
    const img = hero.querySelector("img");
    const cta = block.querySelector("a");

    /*
     * Every header control's real hit box. A pseudo-element with negative
     * insets enlarges the target without changing the rect, so those are
     * read and added back — the same correction responsive.mjs needed
     * before it would stop reporting correctly-sized controls as failures.
     */
    const controls = [...header.querySelectorAll("a,button")]
      /*
       * Only what is actually rendered at this width. The eight desktop
       * nav links are `hidden lg:flex`, so below lg they have no box at
       * all — and reporting eight 0x0 "UNDER FLOOR" rows per viewport is
       * the same class of noise the sr-only and honeypot filters exist to
       * remove in responsive.mjs. A control that is not painted is not a
       * tap target that is too small.
       */
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      })
      .map((el) => {
      const r = el.getBoundingClientRect();
      let w = r.width;
      let h = r.height;
      for (const pseudo of ["::before", "::after"]) {
        const s = getComputedStyle(el, pseudo);
        if (s.content === "none" || s.position !== "absolute") continue;
        const inset = (side) => -parseFloat(s[side] || "0") || 0;
        w += inset("left") + inset("right");
        h += inset("top") + inset("bottom");
      }
      const label =
        el.getAttribute("aria-label") ||
        (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 28) ||
        el.tagName.toLowerCase();
      return { label, w: Math.round(w), h: Math.round(h) };
    });

    /* Anything in the header sticking out of the viewport, or wrapping. */
    const headerOverflow = [...header.querySelectorAll("*")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > innerWidth + 0.5 || r.left < -0.5);
      })
      .map((el) => `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 40));

    /*
     * The lockup wordmark, so "does it wrap" is measured rather than
     * eyeballed: a wordmark spilling onto a third line is the failure the
     * short form exists to avoid.
     *
     * Selected by data-wordmark, not by shape. `a span:not(.sr-only)`
     * matches the 48px mask span that paints the mark, which has no text
     * in it, and this reported "2 lines" for an element with no lines.
     *
     * The lockup is two lines BY DESIGN (name over city), so the number to
     * watch is 3, not 2. It is reported per line so a wrap is visible as
     * a line whose height exceeds one line-height rather than as a total.
     */
    const wordmark = header.querySelector("[data-wordmark]");
    const lineHeight = wordmark
      ? parseFloat(getComputedStyle(wordmark).lineHeight)
      : 0;
    const wordmarkLines = wordmark
      ? [...wordmark.children].map((child) =>
          Math.round(child.getBoundingClientRect().height / lineHeight),
        )
      : [];

    /*
     * How the verse and theme-song row breaks. Reported, not asserted:
     * two references on two lines is a correct result, and the pair is
     * expected to wrap at 320 in both phases and at 360 in the full-bleed
     * phase, where the type is text-lg.
     *
     * This measurement is why the separator glyph between them is gone.
     * With an aria-hidden middle dot in the row, a wrap stranded it at the
     * end of line one, and that is a fault rather than a break. Without
     * it, a wrap is just a line break. Do not reintroduce a separator
     * without re-reading this column.
     */
    const verse = block.querySelector("p");
    const verseLines = verse
      ? Math.round(
          verse.getBoundingClientRect().height /
            parseFloat(getComputedStyle(verse).lineHeight),
        )
      : 0;

    return {
      hero: box(hero),
      text: box(block),
      verseLines,
      header: box(header),
      cta: box(cta),
      ctaLabel: (cta.textContent || "").trim(),
      typeColor: getComputedStyle(block.querySelector("h1")).color,
      headerLinkColor: getComputedStyle(header.querySelector("a")).color,
      img: {
        renderW: Math.round(img.getBoundingClientRect().width),
        renderH: Math.round(img.getBoundingClientRect().height),
        natW: img.naturalWidth,
        position: getComputedStyle(img).objectPosition,
      },
      scrims: [...hero.querySelectorAll("div[aria-hidden]")]
        .filter((e) => getComputedStyle(e).display !== "none")
        .map((e) => Math.round(e.getBoundingClientRect().height)),
      controls,
      headerOverflow,
      wordmarkLines,
      /*
       * What is PAINTED, which is not innerText. innerText respects
       * display:none but not `clip`, and `sr-only` hides by clipping to a
       * 1x1 box rather than by display, so innerText reported
       * "Newlife / Seventh-day Adventist Church Newlife / Nairobi" for a
       * lockup that paints "Newlife / Nairobi". The announced name is read
       * separately from the accessibility tree, because the two differ
       * here on purpose and reporting either alone would hide that.
       */
      wordmarkText: wordmark
        ? [...wordmark.querySelectorAll("*")]
            .filter((el) => {
              if (!el.textContent.trim()) return false;
              if (el.querySelector("*")) return false; // leaves only
              const s = getComputedStyle(el);
              if (s.display === "none" || s.visibility === "hidden") return false;
              const r = el.getBoundingClientRect();
              return r.width > 1 && r.height > 1; // sr-only is 1x1
            })
            .map((el) => el.textContent.trim())
            .join(" / ")
        : "",
      docOverflow: Math.round(
        document.documentElement.scrollWidth - innerWidth,
      ),
      innerHeight: innerHeight,
    };
  });

  /*
   * The lockup's ACCESSIBLE name, from Chrome's own accessibility tree
   * rather than from textContent. textContent concatenates the visible
   * short form and the sr-only full name and reports
   * "NewlifeSeventh-day Adventist Church Newlife", which is not what any
   * screen reader announces: the short form is aria-hidden. Asking the
   * tree is asking the question that matters.
   */
  const snapshot = await page.accessibility.snapshot({ interestingOnly: false });
  const findLink = (node) => {
    if (!node) return null;
    if (node.role === "link" && /Newlife/i.test(node.name || "")) return node;
    for (const child of node.children ?? []) {
      const hit = findLink(child);
      if (hit) return hit;
    }
    return null;
  };
  geo.accessibleName = findLink(snapshot)?.name ?? "(not found)";

  await page.addStyleTag({
    content:
      "*,*::before,*::after{transition:none !important;animation:none !important}",
  });

  const hideType = () =>
    page.evaluate(() => {
      const hero = document.getElementById("home-hero");
      hero.querySelectorAll("h1,p,a").forEach((e) => {
        e.style.setProperty("visibility", "hidden", "important");
        e.querySelectorAll("*").forEach((c) =>
          c.style.setProperty("visibility", "hidden", "important"),
        );
      });
      document
        .querySelector("header")
        .querySelectorAll("*")
        .forEach((e) => e.style.setProperty("visibility", "hidden", "important"));
    });
  const settle = () =>
    page.evaluate(
      () =>
        new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        ),
    );

  const scan = async (regions) => {
    const shot = await page.screenshot({ type: "png", encoding: "base64" });
    return await page.evaluate(
      async (b64, regs) => {
        const bmp = await createImageBitmap(
          await (await fetch(`data:image/png;base64,${b64}`)).blob(),
        );
        const c = new OffscreenCanvas(bmp.width, bmp.height);
        const ctx = c.getContext("2d");
        ctx.drawImage(bmp, 0, 0);
        const out = {};
        for (const [k, r] of Object.entries(regs)) {
          const x = Math.max(0, Math.floor(r.x));
          const y = Math.max(0, Math.floor(r.y));
          const w = Math.min(c.width - x, Math.ceil(r.width));
          const h = Math.min(c.height - y, Math.ceil(r.height));
          out[k] =
            w <= 0 || h <= 0
              ? null
              : Array.from(ctx.getImageData(x, y, w, h).data);
        }
        return out;
      },
      shot,
      regions,
    );
  };

  const extremes = (arr) => {
    if (!arr) return null;
    let hi = -1;
    let lo = 2;
    let hiRgb = null;
    let loRgb = null;
    for (let i = 0; i < arr.length; i += 4) {
      const L = lum(arr[i], arr[i + 1], arr[i + 2]);
      if (L > hi) { hi = L; hiRgb = [arr[i], arr[i + 1], arr[i + 2]]; }
      if (L < lo) { lo = L; loRgb = [arr[i], arr[i + 1], arr[i + 2]]; }
    }
    return { hi, hiRgb, lo, loRgb };
  };

  await hideType();
  await settle();
  const px = await scan({ text: geo.text, header: geo.header });
  const text = extremes(px.text);
  const headerTransparent = extremes(px.header);

  await page.evaluate(() => window.scrollTo(0, 400));
  await new Promise((r) => setTimeout(r, 400));
  await hideType();
  await settle();
  const glass = await page.evaluate(() => ({
    state: document.querySelector("header").getAttribute("data-header-state"),
    linkColor: getComputedStyle(document.querySelector("header a")).color,
  }));
  const headerGlass = extremes((await scan({ header: geo.header })).header);

  rows.push({ v, geo, text, headerTransparent, headerGlass, glass });
  await page.close();
}

await browser.close();

const pad = (s, n) => String(s).padEnd(n);
const verdict = (r, floor = 4.5) =>
  `${r.toFixed(2)}:1 ${r >= floor ? "PASS" : "FAIL"}`;
const pick = (typeCss, ex) => ({
  ratio: against(typeCss, isLight(typeCss) ? ex.hi : ex.lo),
  rgb: isLight(typeCss) ? ex.hiRgb : ex.loRgb,
});

console.log(`\n=== phase=${phase} — what is in the frame ===`);
console.log(
  pad("viewport", 12) + pad("hero h", 9) + pad("frame", 12) + pad("keeps", 9) +
    pad("window of source", 20) + "object-position",
);
console.log("-".repeat(80));
for (const { v, geo } of rows) {
  const frameAspect = geo.img.renderW / geo.img.renderH;
  const srcAspect = SOURCE.w / SOURCE.h;
  const keep = Math.min(1, frameAspect / srcAspect);
  const from = (1 - keep) * 0.5;
  console.log(
    pad(`${v.w}x${v.h}`, 12) +
      pad(`${Math.round(geo.hero.height)}px`, 9) +
      pad(`${geo.img.renderW}x${geo.img.renderH}`, 12) +
      pad(`${(keep * 100).toFixed(1)}%`, 9) +
      pad(
        `x ${(from * 100).toFixed(1)}%-${((from + keep) * 100).toFixed(1)}%`,
        20,
      ) +
      geo.img.position,
  );
}

console.log(`\n=== phase=${phase} — contrast ===`);
console.log(
  pad("viewport", 12) + pad("scrims", 14) + pad("hero type", 22) +
    pad("hero text", 16) + pad("header transparent", 20) + "header glass",
);
console.log("-".repeat(100));
for (const r of rows) {
  const t = pick(r.geo.typeColor, r.text);
  const ht = pick(r.geo.headerLinkColor, r.headerTransparent);
  const hg = pick(r.glass.linkColor, r.headerGlass);
  console.log(
    pad(`${r.v.w}x${r.v.h}`, 12) +
      pad(`${r.geo.scrims.join("/")}px`, 14) +
      pad(isLight(r.geo.typeColor) ? "white (brightest px)" : "ink (darkest px)", 22) +
      pad(verdict(t.ratio), 16) +
      pad(verdict(ht.ratio), 20) +
      `${verdict(hg.ratio)} [${r.glass.state}]`,
  );
}

console.log(`\n=== phase=${phase} — the fold ===`);
console.log(
  pad("viewport", 12) + pad("CTA bottom", 13) + pad("fold", 8) +
    pad("above fold", 13) + "doc overflow",
);
console.log("-".repeat(60));
for (const { v, geo } of rows) {
  const above = geo.cta.bottom <= geo.innerHeight;
  console.log(
    pad(`${v.w}x${v.h}`, 12) +
      pad(`${Math.round(geo.cta.bottom)}px`, 13) +
      pad(`${geo.innerHeight}px`, 8) +
      pad(above ? "YES" : "NO", 13) +
      pad(`verse ${geo.verseLines} line${geo.verseLines === 1 ? "" : "s"}`, 16) +
      (geo.docOverflow > 0 ? `+${geo.docOverflow}px FAIL` : "none"),
  );
}

console.log(`\n=== the lockup ===`);
console.log(
  pad("viewport", 12) + pad("painted", 26) + pad("lines/line", 12) + "announced",
);
console.log("-".repeat(100));
for (const { v, geo } of rows) {
  const wraps = geo.wordmarkLines.some((n) => n > 1);
  console.log(
    pad(`${v.w}x${v.h}`, 12) +
      pad(`"${geo.wordmarkText}"`, 26) +
      pad(`${geo.wordmarkLines.join(",")} ${wraps ? "WRAPS" : "ok"}`, 12) +
      `"${geo.accessibleName}"`,
  );
}

console.log(`\n=== header controls against the ${TARGET_FLOOR}px floor ===`);
for (const { v, geo } of rows) {
  console.log(`  ${v.w}x${v.h}`);
  for (const c of geo.controls) {
    const ok = c.w >= TARGET_FLOOR && c.h >= TARGET_FLOOR;
    console.log(
      `    ${pad(c.label, 34)}${pad(`${c.w}x${c.h}`, 12)}${ok ? "PASS" : "UNDER FLOOR"}`,
    );
  }
  if (geo.headerOverflow.length) {
    console.log(`    header overflow: ${geo.headerOverflow.join(", ")}`);
  }
}

const worstText = Math.min(
  ...rows.map((r) => pick(r.geo.typeColor, r.text).ratio),
);
const worstHt = Math.min(
  ...rows.map((r) => pick(r.geo.headerLinkColor, r.headerTransparent).ratio),
);
const worstHg = Math.min(
  ...rows.map((r) => pick(r.glass.linkColor, r.headerGlass).ratio),
);
console.log(
  `\nworst: hero text ${worstText.toFixed(2)}:1   header transparent ${worstHt.toFixed(2)}:1   header glass ${worstHg.toFixed(2)}:1`,
);
