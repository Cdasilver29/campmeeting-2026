/**
 * The supplied speaker artwork -> public/speakers/<id>.webp.
 *
 * Checked in for the same reason tools/perf is: the numbers below are
 * decisions, and a decision that lives only in a shell history is a
 * decision the next person has to re-make by eye.
 *
 * ── WHAT WAS SUPPLIED, AND WHY IT IS CROPPED ─────────────────────────
 *
 * None of the seven files is a photograph. Each is a 1:1 SOCIAL POSTER
 * card: the person cut out onto the camp meeting's plum ground, with
 * their role in a script face and their name in a heavy sans burnt into
 * the lower fifth of the frame — "Main Speaker / Pr. Kennedy Mfune",
 * "Teens Speaker / Eld. Barrack Bosire", and so on.
 *
 * That text cannot ship. The site sets the speaker's name and role in
 * type directly beside the picture, so the burnt-in line is the same
 * words a second time in someone else's typeface; and at the 48px the
 * card avatar renders it is four illegible grey bars. So the crop is not
 * an art-direction preference, it is the only way to use these files at
 * all.
 *
 * ── THE CROP ─────────────────────────────────────────────────────────
 *
 * A 3:4 portrait window, as tall as the caption allows, centred on the
 * head-and-shoulders mass. `bottom` is where each poster's caption
 * begins, read off the file; `cx` is the horizontal centre of the
 * subject, which is NOT 0.5 on any of them because every card sets the
 * person off-centre to leave room for the type.
 *
 * `posY` is the vertical `object-position` the round avatar needs. A 1:1
 * window onto a 3:4 frame keeps the full width and 75% of the height, so
 * the value decides which 75%. It is derived, not chosen: it puts the
 * face's centre at 42% of the circle, which is where a face sits in a
 * portrait rather than dead centre. The values that come out at 0% are
 * the well-composed frames — a portrait's face is already high, so
 * centring it in a square crop means starting at the top edge.
 *
 * Both numbers are mirrored in src/data/event.ts (`image`,
 * `imagePosition`). This script writes the file; that data tells the
 * components how to frame it.
 *
 * ── SIZE ─────────────────────────────────────────────────────────────
 *
 * 720px tall, which is not a round number picked for looking like one.
 * The largest the site renders one of these is the 160x213 CSS portrait
 * in the speaker page's header band, and 720 is that at device pixel
 * ratio 3 with nothing to spare and nothing wasted. Never upscaled:
 * kennedy-mfune's crop is 696px tall and is written at 696.
 *
 * Every file in public/ is precached (see src/app/serwist/[path]),
 * so a speaker photograph is bytes a phone on campground signal pays for
 * whether it opens that page or not. Seven files at this size are 328 KB.
 *
 * Usage: node tools/assets/speaker-photos.mjs <source-dir> [--preview <dir>]
 *
 * sharp is a devDependency, pinned. It used to be taken from next's own
 * tree on a comment saying it arrives with next; it does not hoist under
 * this pnpm config, so all four of these scripts were failing with
 * ERR_MODULE_NOT_FOUND. createRequire from the repo root is kept so the
 * resolution is explicit.
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
  console.error("usage: node tools/assets/speaker-photos.mjs <source-dir> [--preview <dir>]");
  process.exit(1);
}
const previewFlag = process.argv.indexOf("--preview");
const PREVIEW = previewFlag > -1 ? process.argv[previewFlag + 1] : null;

const OUT = join(ROOT, "public", "speakers");
mkdirSync(OUT, { recursive: true });
if (PREVIEW) mkdirSync(PREVIEW, { recursive: true });

/** 3x the 160x213 CSS portrait. Applied as a ceiling, never as a target. */
const MAX_H = 720;
/** Visually lossless for photographic content; the hero uses 90-92. */
const QUALITY = 90;

const SPEAKERS = [
  { id: "kennedy-mfune",    file: "kennedymfune.jpg",   bottom: 0.68, cx: 0.51,  posY: 0 },
  { id: "allan-okoth",      file: "allanokoth.jpg",     bottom: 0.69, cx: 0.515, posY: 19 },
  // `id` is the output filename and the speaker's id; `file` is the
  // supplied artwork's name and does not change when an id does. These
  // two were renamed after v3 and the biographies settled the spellings.
  { id: "preskilla-munda",  file: "preskillamunda.jpg", bottom: 0.76, cx: 0.51,  posY: 69 },
  { id: "janet-oyende-kariuki", file: "janetoyiende.jpg", bottom: 0.74, cx: 0.53, posY: 4 },
  { id: "john-clement",     file: "johnclement.jpg",    bottom: 0.72, cx: 0.535, posY: 24 },
  { id: "isaac-oenga",      file: "isaacoenga.jpg",     bottom: 0.71, cx: 0.48,  posY: 60 },
  { id: "barrack-bosire",   file: "Barrackbosire.jpg",  bottom: 0.70, cx: 0.525, posY: 0 },
];

const rows = [];

for (const s of SPEAKERS) {
  const src = join(SRC, s.file);
  const srcBytes = statSync(src).size;
  const meta = await sharp(src).metadata();
  const side = meta.width;

  const h = Math.round(s.bottom * side);
  const w = Math.round((h * 3) / 4);
  const left = Math.max(0, Math.min(side - w, Math.round(s.cx * side - w / 2)));

  let img = sharp(src).extract({ left, top: 0, width: w, height: h });
  let outW = w;
  let outH = h;
  if (h > MAX_H) {
    outH = MAX_H;
    outW = Math.round((MAX_H * 3) / 4);
    img = img.resize({ height: MAX_H });
  }

  const out = join(OUT, `${s.id}.webp`);
  await img.webp({ quality: QUALITY, effort: 6, smartSubsample: true }).toFile(out);
  const outBytes = statSync(out).size;

  if (PREVIEW) {
    /* What the round avatar actually shows, rendered rather than reasoned
       about: a square window keeping the full width of the 3:4 frame,
       offset by posY. This is the check that catches a face cut in half. */
    const keep = outW;
    const top = Math.round((s.posY / 100) * (outH - keep));
    await sharp(out)
      .extract({ left: 0, top, width: keep, height: keep })
      .resize(192, 192)
      .png()
      .toFile(join(PREVIEW, `${s.id}-avatar.png`));
  }

  rows.push({ ...s, meta, srcBytes, left, w, h, outW, outH, outBytes });
}

const pad = (v, n) => String(v).padEnd(n);
console.log(
  pad("id", 19) + pad("source", 22) + pad("source px", 12) + pad("source KB", 11) +
  pad("crop taken", 20) + pad("output px", 11) + pad("output KB", 11) + "object-position",
);
console.log("-".repeat(124));
for (const r of rows) {
  console.log(
    pad(r.id, 19) + pad(r.file, 22) +
    pad(`${r.meta.width}x${r.meta.height}`, 12) +
    pad((r.srcBytes / 1024).toFixed(1), 11) +
    pad(`${r.left},0 ${r.w}x${r.h}`, 20) +
    pad(`${r.outW}x${r.outH}`, 11) +
    pad((r.outBytes / 1024).toFixed(1), 11) +
    `50% ${r.posY}%`,
  );
}
console.log(
  `\ntotal written: ${(rows.reduce((a, r) => a + r.outBytes, 0) / 1024).toFixed(1)} KB ` +
  `into public/speakers/ (all of it precached)`,
);
