/**
 * The home hero's photographs -> public/hero/<name>.webp.
 *
 * A third converter alongside speaker-photos.mjs and header-photos.mjs,
 * and checked in for the same reason: the size cap and the quality below
 * are decisions, and a decision that lives only in a shell history is one
 * the next person has to re-make by eye.
 *
 * hands-bible.webp is NOT written by this script and is deliberately left
 * alone. It is 735x616, converted by hand at q92 before this existed, and
 * re-encoding it here would change bytes in the one file the hero has
 * always shipped for no reason other than tidiness. It is listed in
 * src/lib/hero.ts with the rest.
 *
 * ── NO CROP ──────────────────────────────────────────────────────────
 *
 * Both of these are group photographs and the hero frame is a different
 * shape at every width — 0.53:1 on a phone at 88svh, 1.6:1 at 1440 — so
 * `cover` has to do the cropping at render time. Baking one crop in would
 * pick the phone's crop or the desktop's and lose the other.
 *
 * What that costs is worth stating rather than discovering. At 390x743 the
 * frame is 0.53:1, so `cover` keeps 29% of migori's width and 37% of
 * taji's: on a phone both stop being group shots and become close shots of
 * the three or four singers in the middle of the row. That is an
 * acceptable answer for these two pictures specifically, because a choir
 * is a dense rank of people and the middle of the rank still reads as a
 * choir. It would not be an acceptable answer for a photograph with one
 * subject off to one side.
 *
 * ── THE SIZE CEILING ─────────────────────────────────────────────────
 *
 * 1600px, the same ceiling the header bands use. The hero is full-bleed,
 * so at a 1920 viewport it wants 1920px of source and gets 1600: a 1.20x
 * upscale. Nothing is upscaled to reach the cap — taji is 1491px wide and
 * is written at 1491.
 *
 * For context on how good that is: hands-bible, which is still the first
 * image and therefore the one every visitor sees, is 735px wide and
 * upscales 2.61x at 1920. These two are the sharpest photographs on the
 * site.
 *
 * ── QUALITY ──────────────────────────────────────────────────────────
 *
 * q82, effort 6, matching the header bands. Measured alternatives, per
 * file, and not kept:
 *
 *   migori   q78 135.9   q82 160.1   q86 192.8   q90 241.3 KiB
 *   taji     q78 130.5   q82 150.4   q86 179.9   q90 223.6 KiB
 *
 * The headers' argument for q82 was that a 0.66 scrim covers every pixel
 * of them, and that argument does NOT hold here: the hero's two scrims are
 * sized to the header and the text block, and the middle of the frame is
 * untouched. The argument that does hold is bytes. Every file in public/
 * is precached, so these are paid for on campground signal by every phone
 * whether or not the rotation ever reaches them, and q86 is +63 KiB across
 * the two for a difference nobody has demonstrated at this size.
 *
 * Usage: node tools/assets/hero-photos.mjs <source-dir>
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
  console.error("usage: node tools/assets/hero-photos.mjs <source-dir>");
  process.exit(1);
}

const OUT = join(ROOT, "public", "hero");
mkdirSync(OUT, { recursive: true });

const MAX_W = 1600;
const QUALITY = 82;

/** Output name -> supplied file. Mirrors HERO_IMAGES in src/lib/hero.ts. */
const PHOTOS = [
  { name: "migori-choir", file: "migoriguest.png" },
  { name: "taji-choir", file: "tajiguest.png" },
];

const rows = [];

for (const p of PHOTOS) {
  const src = join(SRC, p.file);
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

  const out = join(OUT, `${p.name}.webp`);
  await img.webp({ quality: QUALITY, effort: 6, smartSubsample: true }).toFile(out);

  rows.push({ ...p, meta, srcBytes, outW, outH, outBytes: statSync(out).size });
}

const pad = (v, n) => String(v).padEnd(n);
console.log(
  pad("name", 16) + pad("source", 20) + pad("source px", 12) + pad("source KB", 11) +
  pad("output px", 12) + pad("output KB", 11) + "upscale at 1920",
);
console.log("-".repeat(96));
for (const r of rows) {
  console.log(
    pad(r.name, 16) + pad(r.file, 20) +
    pad(`${r.meta.width}x${r.meta.height}`, 12) +
    pad((r.srcBytes / 1024).toFixed(1), 11) +
    pad(`${r.outW}x${r.outH}`, 12) +
    pad((r.outBytes / 1024).toFixed(1), 11) +
    `${(1920 / r.outW).toFixed(2)}x`,
  );
}

const total = rows.reduce((a, r) => a + r.outBytes, 0);
console.log(
  `\ntotal written: ${(total / 1024).toFixed(1)} KB into public/hero/ (all of it precached)` +
  `\nhands-bible.webp is not written by this script and is unchanged.`,
);
