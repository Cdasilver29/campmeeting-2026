/**
 * The clean cut-outs: source artwork with NO caption burnt into it.
 *
 * Third of the three converters in this folder, and the difference
 * between them is what the committee sent, not what the site does with
 * it. All three write `public/speakers/<id>.webp`.
 *
 *   speaker-photos.mjs  1:1 social poster cards with the person's role
 *                       and name burnt into the lower fifth. The crop's
 *                       first job is removing that caption.
 *   host-photos.mjs     studio cut-outs of the five hosts, no caption.
 *   portrait-photos.mjs THIS. Later cut-outs, no caption, arriving one
 *                       and two at a time rather than as a set.
 *
 * A fourth batch belongs here rather than in a fourth file. The reason
 * this is not simply a row added to host-photos.mjs is that two of the
 * three below are SPEAKERS — Pr. Kenneth Ayuo and Pr. Elkanah Mose, who
 * had rendered as initials monograms since they were first named — and
 * filing a speaker under a script called `hosts` is the kind of tidiness
 * that costs someone an hour later.
 *
 * ── WHAT IS BEING CROPPED ────────────────────────────────────────────
 *
 * Every source is the person cut out onto the poster's plum ground with
 * the SDA flame mark ghosted behind them. The window is 3:4, because that
 * is the shape `SpeakerPortrait` draws and the shape the round card
 * avatar takes its square out of.
 *
 * `posY` is the `imagePosition` written into event.ts and is NOT
 * decoration: the avatar shows 75% of the file's height and this is which
 * 75%. Run with `--preview <dir>` to render both the portrait and the
 * avatar circle and check the second one — that is what catches a face
 * cut in half.
 *
 * ── ONE OF THESE REPLACES A FILE ─────────────────────────────────────
 *
 * Eld. Omondi Oyoo had a portrait already, cut by host-photos.mjs from a
 * landscape source with his arms crossed. That file was the largest of
 * the five hosts at 82 KB because of the fine gingham check he was
 * wearing — see the note in host-photos.mjs. This replaces it with a
 * plain studio portrait, and the byte problem goes with the shirt.
 *
 * Usage: node tools/assets/portrait-photos.mjs <source-dir> [--preview <dir>]
 *
 * sharp is a devDependency. It used to be taken from next's own tree on
 * a comment saying so, which stopped resolving under this pnpm config.
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
  console.error(
    "usage: node tools/assets/portrait-photos.mjs <source-dir> [--preview <dir>]",
  );
  process.exit(1);
}
const previewFlag = process.argv.indexOf("--preview");
const PREVIEW = previewFlag > -1 ? process.argv[previewFlag + 1] : null;

const OUT = join(ROOT, "public", "speakers");
mkdirSync(OUT, { recursive: true });
if (PREVIEW) mkdirSync(PREVIEW, { recursive: true });

/** 3x the 160x213 CSS portrait. A ceiling, never a target. */
const MAX_H = 720;
/** Visually lossless for photographic content, as the other two use. */
const QUALITY = 90;

const PORTRAITS = [
  {
    id: "kenneth-ayuo",
    file: "Pr. Kenneth Ayuo.png",
    // 1254x1254, square. Head 0.14-0.40; he holds a microphone at chest
    // height and is turned slightly to his right, so the face centre is
    // x 0.57 rather than the middle of the frame.
    //
    // 0.08-0.85 IS A ZOOM AND IS THE SECOND ATTEMPT. 0.02-0.98 was tried
    // first, on the reasoning that a square source should give up as
    // little height as possible: it put his head at the same 0.12-0.40 of
    // the window as the other two, and he still read smaller than either.
    // The register was right and the framing was not — he is shot at
    // three-quarter length where they are shot chest-up, so an equal head
    // position leaves a third of his window as empty plum down the left.
    // Cutting to 0.85 at the foot and 724px at the width takes the dead
    // ground out and puts him in the same picture as the rest of the row.
    top: 0.08,
    bottom: 0.85,
    cx: 0.57,
    // The head sits high in the window, so the avatar's square is taken
    // from the top. 0 keeps the whole face with air above it.
    posY: 0,
  },
  {
    id: "elkanah-mose",
    file: "Pr.Elkanah Mose.png",
    // 1122x1402, 0.8:1, taller than 3:4 — so the window is a crop of the
    // HEIGHT and the full width is kept. Head 0.19-0.45, and the raised
    // index finger above his left shoulder reaches y 0.27, so the top of
    // the window has to clear 0.10 or the gesture is cut at the knuckle.
    //
    // 0.10-0.90 is 1122 wide at 3:4 exactly, which is the whole width,
    // and keeps both the finger and the microphone.
    top: 0.1,
    bottom: 0.9,
    cx: 0.5,
    posY: 0,
  },
  {
    id: "omondi-oyoo",
    file: "Eld.Omondi Oyoo.png",
    // 1122x1402. REPLACES the landscape crop host-photos.mjs made; see
    // the note at the top of this file.
    //
    // A seated three-quarter studio portrait: head 0.12-0.33, and he
    // rests his arm on a chair back that fills the lower left. The head
    // is higher and smaller in frame than in the source it replaces, so
    // the window starts at the very top and takes the full width.
    top: 0.02,
    bottom: 0.82,
    cx: 0.52,
    posY: 0,
  },
];

const rows = [];

for (const p of PORTRAITS) {
  const src = join(SRC, p.file);
  const srcBytes = statSync(src).size;
  const meta = await sharp(src).metadata();

  // The window, in source pixels. Height from top/bottom, width at 3:4,
  // both clamped so a cx near an edge slides the window instead of
  // extracting out of bounds. Same arithmetic as host-photos.mjs.
  let winH = Math.round((p.bottom - p.top) * meta.height);
  let winW = Math.round((winH * 3) / 4);
  if (winW > meta.width) {
    winW = meta.width;
    winH = Math.round((winW * 4) / 3);
  }
  const top = Math.max(
    0,
    Math.min(meta.height - winH, Math.round(p.top * meta.height)),
  );
  const left = Math.max(
    0,
    Math.min(meta.width - winW, Math.round(p.cx * meta.width - winW / 2)),
  );

  let img = sharp(src).extract({ left, top, width: winW, height: winH });
  let outW = winW;
  let outH = winH;
  if (winH > MAX_H) {
    outH = MAX_H;
    outW = Math.round((MAX_H * 3) / 4);
    img = img.resize({ height: MAX_H });
  }

  const out = join(OUT, `${p.id}.webp`);
  await img.webp({ quality: QUALITY, effort: 6, smartSubsample: true }).toFile(out);
  const outBytes = statSync(out).size;

  if (PREVIEW) {
    /* Two previews, because these files are rendered two ways and only
       one of them is the whole file. `-portrait` is what the page header
       shows; `-avatar` is the square window the round card avatar keeps,
       offset by posY. The second is the one that catches a cut face. */
    await sharp(out).resize(240, 320).png().toFile(join(PREVIEW, `${p.id}-portrait.png`));
    const keep = outW;
    const aTop = Math.round((p.posY / 100) * (outH - keep));
    await sharp(out)
      .extract({ left: 0, top: aTop, width: keep, height: keep })
      .resize(192, 192)
      .png()
      .toFile(join(PREVIEW, `${p.id}-avatar.png`));
  }

  rows.push({ ...p, meta, srcBytes, left, top, winW, winH, outW, outH, outBytes });
}

const pad = (v, n) => String(v).padEnd(n);
console.log(
  pad("id", 16) +
    pad("source", 24) +
    pad("source px", 12) +
    pad("src KB", 9) +
    pad("crop taken", 24) +
    pad("output px", 11) +
    pad("out KB", 9) +
    "object-position",
);
console.log("-".repeat(118));
for (const r of rows) {
  console.log(
    pad(r.id, 16) +
      pad(r.file, 24) +
      pad(`${r.meta.width}x${r.meta.height}`, 12) +
      pad((r.srcBytes / 1024).toFixed(1), 9) +
      pad(`${r.left},${r.top} ${r.winW}x${r.winH}`, 24) +
      pad(`${r.outW}x${r.outH}`, 11) +
      pad((r.outBytes / 1024).toFixed(1), 9) +
      `50% ${r.posY}%`,
  );
}
