/**
 * The supplied page-header artwork -> public/headers/<route>.webp.
 *
 * ── NO CROP, ON PURPOSE ──────────────────────────────────────────────
 *
 * Unlike the speaker cards, nothing here is cropped. The band crops these
 * with `object-fit: cover` at render time, and the whole point of
 * choosing an `object-position` per page (src/lib/page-header-art.ts) is
 * that the crop can differ between a 390px phone and a 1920px desktop —
 * which it must, because the band goes from 1.09:1 to 6.71:1 across that
 * range. Baking one crop into the file would throw that away.
 *
 * So the only operations are a downscale, where the source is bigger than
 * anything the band can use, and the WebP encode.
 *
 * ── THE SIZE CEILING ─────────────────────────────────────────────────
 *
 * 1600px wide. The band is full-bleed, so at a 1920 viewport it wants
 * 1920px of source and gets 1600: a 1.20x upscale, which is the same
 * order as the home hero's own 1.18x at that width and is not the thing
 * that limits these pictures. What limits them is below.
 *
 * ── WHAT ACTUALLY LIMITS THESE PICTURES ──────────────────────────────
 *
 * Seven of the ten supplied files are between 555 and 736 pixels wide.
 * They are NOT upscaled to hide that — an upscaled file is the same
 * softness at four times the bytes — so at a 1920 viewport the browser
 * upscales them itself, by up to 3.46x on /livestream. Reported by the
 * table this script prints, and by tools/perf/verify-page-header.mjs.
 * The fix is larger sources from the committee, not a converter setting.
 *
 * ── QUALITY ──────────────────────────────────────────────────────────
 *
 * q82, effort 6. Higher was measured and not kept: q88 costs 213 KB more
 * across the ten and puts no visible difference behind a scrim that
 * holds 0.66 alpha over every pixel of them. Every one of these files is
 * precached (see src/app/serwist/[path]), so those bytes are paid for on
 * campground signal by every phone, whether or not it opens the page.
 *
 * Usage: node tools/assets/header-photos.mjs <source-dir>
 */
import { createRequire } from "node:module";
import { mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const require = createRequire(join(ROOT, "package.json"));
const sharp = require("sharp");

const SRC = process.argv[2];
if (!SRC) {
  console.error("usage: node tools/assets/header-photos.mjs <source-dir>");
  process.exit(1);
}

const OUT = join(ROOT, "public", "headers");
mkdirSync(OUT, { recursive: true });

const MAX_W = 1600;
const QUALITY = 82;

/** route slug -> supplied file. /contact is absent: it reuses public/hero/church.webp. */
const HEADERS = [
  { route: "schedule", file: "schedule.jpg" },
  { route: "livestream", file: "livestream.jpg" },
  { route: "ministries", file: "ministries.jpg" },
  { route: "about", file: "about.jpg" },
  { route: "faq", file: "faq.jpg" },
  { route: "downloads", file: "downloads.jpg" },
  { route: "prayer-requests", file: "prayer-requests.jpg" },
  { route: "health", file: "health.jpg" },
  { route: "family-life", file: "family-life.jpg" },
  { route: "christian-education", file: "christian-education.jpg" },
];

/** The widest the band is ever asked to be, for the upscale column. */
const WIDEST_VIEWPORT = 1920;

const rows = [];

for (const h of HEADERS) {
  const src = join(SRC, h.file);
  const srcBytes = statSync(src).size;
  const meta = await sharp(src).metadata();

  let img = sharp(src);
  let outW = meta.width;
  let outH = meta.height;
  if (meta.width > MAX_W) {
    outW = MAX_W;
    outH = Math.round((meta.height * MAX_W) / meta.width);
    img = img.resize({ width: MAX_W });
  }

  const out = join(OUT, `${h.route}.webp`);
  await img.webp({ quality: QUALITY, effort: 6, smartSubsample: true }).toFile(out);

  rows.push({ ...h, meta, srcBytes, outW, outH, outBytes: statSync(out).size });
}

const pad = (v, n) => String(v).padEnd(n);
console.log(
  pad("route", 22) + pad("source", 24) + pad("source px", 12) + pad("source KB", 11) +
  pad("output px", 12) + pad("output KB", 11) + `upscale at ${WIDEST_VIEWPORT}`,
);
console.log("-".repeat(104));
for (const r of rows) {
  console.log(
    pad(r.route, 22) + pad(r.file, 24) +
    pad(`${r.meta.width}x${r.meta.height}`, 12) +
    pad((r.srcBytes / 1024).toFixed(1), 11) +
    pad(`${r.outW}x${r.outH}`, 12) +
    pad((r.outBytes / 1024).toFixed(1), 11) +
    `${(WIDEST_VIEWPORT / r.outW).toFixed(2)}x`,
  );
}

const total = rows.reduce((a, r) => a + r.outBytes, 0);
console.log(
  `\ntotal written: ${(total / 1024).toFixed(1)} KB into public/headers/ (all of it precached)` +
  `\n/contact adds nothing: it reuses public/hero/church.webp, which is already in the precache.`,
);
