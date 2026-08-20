/**
 * Token contrast, asserted rather than commented.
 *
 * Every ratio written into a comment in src/app/globals.css is also a row
 * in this file, and this file recomputes it. A comment that stops being
 * true fails a check instead of sitting there being wrong — which is the
 * failure mode the previous palette had, where three of the stated ratios
 * described values that had since moved.
 *
 * Pure arithmetic: no browser, no build. It reads the hexes out of
 * globals.css so the two cannot drift, then checks each declared pairing
 * against the floor its ROLE requires:
 *
 *   4.5   normal body text (WCAG 1.4.3 AA)
 *   3.0   large text, icons, borders, focus rings, any non-text UI
 *         component that has to be distinguishable (WCAG 1.4.11)
 *
 * Usage: node tools/perf/contrast.mjs
 * Exit code 1 if any pairing fails its floor.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const CSS = join(here, "..", "..", "src", "app", "globals.css");

/* ── colour maths ──────────────────────────────────────────────────── */

function rgb(hex) {
  let s = hex.trim().replace("#", "");
  if (s.length === 3) s = s.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
}
const channel = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const luminance = (hex) => {
  const [r, g, b] = rgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
export function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * `fg` at `alpha` over `bg`, as an opaque hex.
 *
 * A ratio is only defined between two opaque colours, and several of the
 * pairings below are written in the components as `text-white/85` or
 * `bg-surface-muted/50` — an alpha, not a colour. Compositing them here is
 * what lets those rows be asserted at all rather than eyeballed. sRGB
 * source-over, which is what the browser paints.
 */
const mix = (fg, bg, alpha) => {
  const f = rgb(fg);
  const b = rgb(bg);
  return (
    "#" +
    [0, 1, 2]
      .map((i) =>
        Math.round(f[i] * alpha + b[i] * (1 - alpha))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
};

/* ── read the tokens back out of the stylesheet ────────────────────── */

/**
 * Two scopes, because the same token name carries two values: the light
 * value in the @theme block and the dark override in .dark. The regex
 * takes the LAST declaration of a name inside its scope, which is how the
 * cascade resolves it.
 *
 * `var(--other)` is followed, not skipped. Half the shadcn names are
 * aliases — `--secondary-foreground: var(--color-ink)` — and reading only
 * the literal hexes silently left the dark mode's aliases holding their
 * light-mode values, which is a false pass waiting to happen. It is what
 * this harness reported on its first run.
 */
function readTokens(css) {
  const darkStart = css.indexOf(".dark {");
  const darkEnd = css.indexOf("\n}", darkStart);
  const darkBlock = css.slice(darkStart, darkEnd);
  const rest = css.slice(0, darkStart) + css.slice(darkEnd);

  const NAME = "(--color-[a-z0-9-]+|--primary[a-z-]*|--secondary[a-z-]*|--ring)";

  const collect = (source) => {
    const out = {};
    const pattern = new RegExp(
      `${NAME}\\s*:\\s*(#[0-9a-fA-F]{3,8}|var\\(\\s*--[a-z0-9-]+\\s*\\))\\s*;`,
      "g",
    );
    let match;
    while ((match = pattern.exec(source))) out[match[1]] = match[2].trim();
    return out;
  };

  const resolve = (table) => {
    const out = {};
    for (const key of Object.keys(table)) {
      let value = table[key];
      for (let hops = 0; value?.startsWith("var(") && hops < 8; hops += 1) {
        value = table[value.slice(4, -1).trim()];
      }
      out[key] = value;
    }
    return out;
  };

  const lightRaw = collect(rest);
  return {
    light: resolve(lightRaw),
    dark: resolve({ ...lightRaw, ...collect(darkBlock) }),
  };
}

const { light, dark } = readTokens(readFileSync(CSS, "utf8"));

/* ── the pairings this site actually ships ─────────────────────────── */

const TEXT = 4.5;
const UI = 3.0;

/**
 * [foreground, background, floor, what it is]
 * `#fff` and `#1f0d35` appear as literals only where the component does.
 */
const pairs = (t, mode) => [
  // Body and surfaces
  [t["--color-ink"], t["--color-surface"], TEXT, "ink on surface"],
  [t["--color-ink"], t["--color-surface-muted"], TEXT, "ink on surface-muted"],
  [t["--color-ink"], t["--color-surface-warm"], TEXT, "ink on surface-warm"],
  [t["--color-ink-muted"], t["--color-surface"], TEXT, "ink-muted on surface"],
  [t["--color-ink-muted"], t["--color-surface-muted"], TEXT, "ink-muted on surface-muted"],
  [t["--color-ink-muted"], t["--color-surface-warm"], TEXT, "ink-muted on surface-warm"],
  [t["--color-line"], t["--color-surface"], 1.15, "line against surface (visible hairline, not a WCAG floor)"],

  // Interactive
  [t["--primary-foreground"], t["--primary"], TEXT, "primary-foreground on primary"],
  [t["--secondary-foreground"], t["--secondary"], TEXT, "secondary-foreground on secondary"],
  [t["--color-accent-500"], t["--color-surface"], UI, "accent-500 as the focus ring on surface"],
  [t["--color-accent-500"], t["--color-surface"], TEXT, "accent-500 as link text on surface"],
  [t["--color-accent-600"], t["--color-surface"], TEXT, "accent-600 as the page-header eyebrow on surface"],
  // The label on a filled button follows --primary-foreground, which is
  // white in light mode and the dark surface in dark mode. Every hover
  // and pressed fill is checked against the same colour the rest state is.
  [t["--primary-foreground"], t["--color-accent-600"], TEXT, "button label on the accent-600 hover fill"],
  [t["--primary-foreground"], t["--color-accent-700"], TEXT, "button label on the accent-700 pressed fill"],
  [t["--color-accent-500"], t["--color-accent-50"], TEXT, "accent-500 on accent-50"],

  // Functional
  [t["--color-featured-foreground"], t["--color-featured"], TEXT, "urgent badge label on featured"],
  [t["--color-featured"], t["--color-surface"], TEXT, "featured as text/icon on surface"],
  [t["--color-live"], t["--color-surface"], UI, "live dot on surface"],
  [t["--color-live"], t["--color-surface-muted"], UI, "live dot on surface-muted"],
  [t["--color-bookmark"], t["--color-surface"], UI, "bookmark icon on surface"],
  [t["--color-bookmark"], t["--color-surface-muted"], UI, "bookmark icon on surface-muted (its hover)"],

  // ── /livestream ───────────────────────────────────────────────────
  // The player's poster, the archive's part chip and the archive's play
  // disc are all filled with a RAW PALETTE NAME rather than a step of the
  // accent scale, because the accent scale flips with the theme and these
  // carry white type. Emperor and Grapevine hold one value in both modes,
  // so both rows below are the same number twice — which is the property
  // being asserted, not an oversight.
  ["#ffffff", t["--color-emperor"], TEXT, "livestream poster: white on the Emperor ground"],
  ["#ffffff", t["--color-grapevine"], TEXT, "livestream poster: white on the Grapevine hover ground"],
  // The poster's second line, composited: white at 85% over each ground.
  [mix("#ffffff", t["--color-emperor"], 0.85), t["--color-emperor"], TEXT, "livestream poster: the white/85 hint line on Emperor"],
  [mix("#ffffff", t["--color-grapevine"], 0.85), t["--color-grapevine"], TEXT, "livestream poster: the white/85 hint line on Grapevine"],
  [t["--color-emperor"], "#ffffff", TEXT, "livestream poster: the Emperor play glyph in its white disc"],
  // The focus ring, offset onto the stage tray rather than onto the page.
  [t["--color-accent-500"], t["--color-surface-muted"], UI, "livestream: the focus ring on the stage tray"],
  // The live badge, which gained a ground in the same pass.
  [t["--color-ink"], t["--color-surface-muted"], TEXT, "livestream: the live badge's words on its pill"],
  // The archive card, which gained a body in the same pass. `primary` is
  // the accent scale here and SHOULD flip: it is ordinary link text on an
  // ordinary surface, not white type on a fill.
  [t["--primary"], t["--color-surface-muted"], TEXT, "livestream archive: the recording title on the card body"],
  [t["--color-ink-muted"], t["--color-surface-muted"], TEXT, "livestream archive: the card's meta line"],
  // The dashed empty panels are surface-muted at 50% over the page.
  [t["--color-ink-muted"], mix(t["--color-surface-muted"], t["--color-surface"], 0.5), TEXT, "livestream: empty-panel copy on the 50% muted ground"],

  // Ministry families, ink on its own tint
  ...["devotion", "word", "care", "community"].flatMap((family) => [
    [t[`--color-tag-${family}`], t[`--color-tag-${family}-tint`], TEXT, `tag ${family}: ink on tint`],
    [t[`--color-tag-${family}`], t["--color-surface"], UI, `tag ${family}: dot on surface`],
  ]),

  // Warm, stated so the failure is on the record rather than discovered.
  // Light mode only: on a dark ground Warm passes comfortably (9.39:1 on
  // the dark surface, 6.84:1 on the poster plum), and that is the whole
  // point of the token. It is white that it cannot sit on.
  ...(mode === "light"
    ? [[t["--color-warm"], t["--color-surface"], TEXT, "WARM as text on surface — EXPECTED TO FAIL, see globals.css"]]
    : [[t["--color-warm"], t["--color-surface"], TEXT, "warm on the dark surface — the one ground it is allowed"]]),
];

/* ── run ───────────────────────────────────────────────────────────── */

let failures = 0;
const EXPECTED_FAIL = "EXPECTED TO FAIL";

for (const [mode, tokens] of [["light", light], ["dark", dark]]) {
  console.log(`\n── ${mode} ${"─".repeat(66 - mode.length)}`);
  console.log(
    "ratio".padEnd(9) + "floor".padEnd(8) + "".padEnd(6) + "pairing",
  );
  for (const [fg, bg, floor, label] of pairs(tokens, mode)) {
    if (!fg || !bg) {
      console.log(`  ??       —              MISSING TOKEN: ${label}`);
      failures += 1;
      continue;
    }
    const ratio = contrast(fg, bg);
    const expectedFail = label.includes(EXPECTED_FAIL);
    const ok = ratio >= floor;
    const verdict = expectedFail ? (ok ? "UNEXPECTED PASS" : "fails, as documented") : ok ? "pass" : "FAIL";
    if (expectedFail ? ok : !ok) failures += 1;
    console.log(
      `${ratio.toFixed(2)}:1`.padEnd(9) +
        `${floor.toFixed(2)}`.padEnd(8) +
        verdict.padEnd(22) +
        `${label}  (${fg} on ${bg})`,
    );
  }
}

console.log(
  failures === 0
    ? "\nEvery pairing clears the floor its role requires.\n"
    : `\n${failures} pairing(s) did not behave as documented.\n`,
);
process.exit(failures === 0 ? 0 : 1);
