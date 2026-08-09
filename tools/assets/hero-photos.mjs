/**
 * The home hero's photographs -> public/hero/<name>.webp.
 *
 * A converter alongside speaker-photos.mjs, host-photos.mjs and
 * header-photos.mjs, and checked in for the same reason: the size cap and
 * the quality below are decisions, and a decision that lives only in a
 * shell history is one the next person has to re-make by eye.
 *
 * ── TWO FILES PER PHOTOGRAPH NOW, AND WHY ────────────────────────────
 *
 * This script used to write one file per picture and let `object-fit:
 * cover` find a crop for every viewport. It now writes a MOBILE file and
 * a DESKTOP file per picture, cut differently by the photographer, and
 * src/lib/hero.ts serves them through a real `<picture>` element with a
 * `media` query on the source.
 *
 * That is art direction, not responsive sizing, and the distinction is
 * the whole reason the shape of this changed. Responsive sizing is one
 * picture at several resolutions, and `sizes` plus a srcset is the answer
 * to it — the browser picks a file, and every candidate is the same
 * photograph. Art direction is a DIFFERENT CROP per breakpoint, which no
 * srcset can express, because `sizes` describes how big the box is and
 * says nothing about what should be inside it.
 *
 * What made it necessary is the frame. The hero is 88svh on a phone,
 * which is 0.53:1 at 390x844, and full-bleed landscape from md up. That
 * is not a resize, it is a different aspect ratio, and the old note in
 * this file admitted what it cost:
 *
 *   "At 390x743 the frame is 0.53:1, so `cover` keeps 29% of migori's
 *   width and 37% of taji's: on a phone both stop being group shots and
 *   become close shots of the three or four singers in the middle."
 *
 * The phone files fix exactly that. Migori's is a portrait re-frame of the
 * same choir that keeps the whole rank; the hands file is the same
 * photograph composed vertically instead of being centre-cropped to a
 * third of itself.
 *
 * ── NO CROP HERE, DELIBERATELY ───────────────────────────────────────
 *
 * Every file below is written at its supplied dimensions. The cropping
 * decision has moved upstream to whoever framed these, which is the point
 * of being given two per picture, and re-cropping them here would be
 * overruling that with arithmetic. `object-position` in src/lib/hero.ts
 * still handles the residual, because a phone is not exactly 0.563:1 and a
 * desktop is not exactly 1.777:1.
 *
 * ── NOTHING IS RESIZED, AND THAT IS A CHANGE ─────────────────────────
 *
 * There is no MAX_W any more. The two desktop files are 1672px wide,
 * which is 72px over the 1600 ceiling this script used to enforce, and
 * they are written at 1672: the cap existed to stop a 6000px source being
 * precached whole, not to shave 4% off a file that is already close to the
 * mark. Keeping it takes the upscale at a 1920 viewport from 1.20x to
 * 1.15x for nothing.
 *
 * ── THE FIRST PHOTOGRAPH IS NO LONGER THE SOFT ONE ───────────────────
 *
 * Worth recording, because this file and src/lib/hero.ts have both been
 * carrying a request to the committee about it for several sessions.
 *
 * hands-bible was 735x616, converted by hand before this script existed,
 * and it was the first image in the rotation — so the softest picture on
 * the site was the one every visitor saw, upscaled 2.61x at 1920. The note
 * asked for "the original from the poster designer, which will be at least
 * 1080x1080 and is very likely a licensed stock frame at 3000px or more".
 *
 * Desktop-hero.PNG is that frame, or near enough: 1672x941 of the same
 * clasped hands on the same open Bible, 2.3x the width and a wider
 * composition. The request is answered and both halves of it are gone from
 * src/lib/hero.ts. A phone crop of it arrived in the same drop.
 *
 * ── QUALITY ──────────────────────────────────────────────────────────
 *
 * q90, up from the q82 this script used to write, because this pass was
 * asked for visually lossless and the hero is the one place on the site
 * where that argument is easy: the two scrims are sized to the header and
 * the text block, and the MIDDLE OF THE FRAME IS UNSCRIMMED. The bands in
 * header-photos.mjs take q78-82 on the reasoning that a 0.62-alpha wash
 * covers every one of their pixels; that reasoning does not reach here and
 * never did.
 *
 * Measured, per file, effort 6:
 *
 *   file              q82      q86      q90
 *   hands-mobile      23.6     29.2     40.1 KiB
 *   hands-desktop     65.0     78.1    102.7
 *   migori-mobile     56.3     70.9     99.2
 *   migori-desktop    93.5    115.7    150.0
 *   taji-mobile      149.7    177.2    216.0
 *
 * q90 costs about 220 KB across the five against q82. Every file in
 * public/ is precached (src/app/serwist/[path]), so that is real, and it
 * is reported rather than hidden. Drop QUALITY to 86 and re-run if the
 * committee would rather have the bytes back.
 *
 * ── ONE FILE IS MUCH LARGER THAN THE REST ────────────────────────────
 *
 * taji-choir-mobile is 216 KB, more than twice migori's phone crop, and
 * it is the subject rather than a setting. That frame is a lit stage with
 * five singers, a rank of printed national flags behind them and a
 * foreground of several dozen graduation caps — high-frequency detail
 * across the entire picture with no soft region anywhere for the encoder
 * to save on. Compare hands-mobile at 40 KB, which is one subject against
 * an unlit plum ground.
 *
 * There is no cheaper setting hiding in it; the q82/q86/q90 row above is
 * a smooth curve. It is the largest photograph on the site and it is worth
 * knowing that it is the third one in the rotation, so nobody sees it for
 * thirteen seconds and it is never the LCP.
 *
 * ── TAJI HAS NO DESKTOP FILE, ON PURPOSE ─────────────────────────────
 *
 * Only two of the three pictures were re-cut for wide screens. taji keeps
 * public/hero/taji-choir.webp, which this script has never written and
 * still does not touch — it is 1491x1055 from the earlier drop and it is
 * unchanged on disk. That is intended and is not a gap waiting to be
 * filled: see the note on `taji-choir` in src/lib/hero.ts.
 *
 * Usage: node tools/assets/hero-photos.mjs <source-dir>
 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync, statSync } from "node:fs";
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

const QUALITY = 90;

/**
 * Output name -> supplied file. Mirrors HERO_IMAGES in src/lib/hero.ts,
 * which pairs each `-mobile` with its wide counterpart in one `<picture>`.
 *
 * `viewport` is the width this file is actually painted at, for the
 * upscale column: the phone crops are served below 768 and the wide ones
 * from 768 up, so scoring a portrait phone file against a 1920 desktop
 * would report an upscale that cannot happen.
 */
const PHOTOS = [
  { name: "hands-bible-mobile", file: "Mobile-hero.PNG", viewport: 430 },
  { name: "hands-bible", file: "Desktop-hero.PNG", viewport: 1920 },
  { name: "migori-choir-mobile", file: "Migori-mobile.PNG", viewport: 430 },
  { name: "migori-choir", file: "Migori-desktop.PNG", viewport: 1920 },
  { name: "taji-choir-mobile", file: "Taji-mobile.PNG", viewport: 430 },
  // taji-choir.webp is absent on purpose. See the note above.
];

const rows = [];
const skipped = [];

for (const p of PHOTOS) {
  const src = join(SRC, p.file);
  // The committee replaces these a few at a time, the way header-photos.mjs
  // already allows for, so a source directory holding only the new ones is
  // the normal case rather than a mistake.
  if (!existsSync(src)) {
    skipped.push(p);
    continue;
  }
  const srcBytes = statSync(src).size;
  const meta = await sharp(src).metadata();

  const out = join(OUT, `${p.name}.webp`);
  await sharp(src).webp({ quality: QUALITY, effort: 6, smartSubsample: true }).toFile(out);

  rows.push({
    ...p,
    meta,
    srcBytes,
    outW: meta.width,
    outH: meta.height,
    outBytes: statSync(out).size,
  });
}

const pad = (v, n) => String(v).padEnd(n);
console.log(
  pad("name", 22) + pad("source", 20) + pad("source px", 12) + pad("source KB", 11) +
  pad("output px", 12) + pad("output KB", 11) + "upscale where served",
);
console.log("-".repeat(108));
for (const r of rows) {
  console.log(
    pad(r.name, 22) + pad(r.file, 20) +
    pad(`${r.meta.width}x${r.meta.height}`, 12) +
    pad((r.srcBytes / 1024).toFixed(1), 11) +
    pad(`${r.outW}x${r.outH}`, 12) +
    pad((r.outBytes / 1024).toFixed(1), 11) +
    `${(r.viewport / r.outW).toFixed(2)}x at ${r.viewport}`,
  );
}

const total = rows.reduce((a, r) => a + r.outBytes, 0);
console.log(
  `\ntotal written: ${(total / 1024).toFixed(1)} KB into public/hero/ (all of it precached)` +
  `\ntaji-choir.webp and church.webp are not written by this script and are unchanged.`,
);

if (skipped.length) {
  console.log(
    `\nnot in ${SRC}, left as they are on disk:\n  ` +
      skipped.map((p) => `${p.name} (${p.file})`).join("\n  "),
  );
}
