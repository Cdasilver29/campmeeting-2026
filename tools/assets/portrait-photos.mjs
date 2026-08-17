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
  {
    id: "matthew-marion-barake",
    file: "Mr&Mrs Mathew Barake.PNG",
    // ── THE ONLY TWO-PERSON SOURCE IN ANY OF THESE SCRIPTS ───────────
    //
    // 1023x1537, 0.67:1, so taller than 3:4 and the window is a crop of
    // the HEIGHT with the full width kept. That is not a preference
    // here, it is the constraint: he stands at x 0.05 and her dress
    // reaches x 0.98, so ANY narrowing of the window cuts one of them
    // out of the picture. cx is therefore clamped and only `top` is a
    // real choice — 173px of vertical slack, and nothing else.
    //
    // Two faces, both of which have to survive TWICE: once in the 3:4
    // portrait, and again in the square the round card avatar takes out
    // of it. His hat crown is at y 0.156 and her chin at y 0.453 of the
    // source, so the pair of faces occupies a band 0.30 of the height
    // tall and sits high. 0.02 puts that band at 0.153-0.490 of the
    // window, which is the same register the other three sit in.
    top: 0.02,
    bottom: 0.907,
    cx: 0.5,
    // The avatar keeps a 1023-square out of a 1364-tall window, so posY
    // chooses among 341px of travel. 0 puts the square at 0-0.75 of the
    // window with the faces at 209-669px inside it: 209px of clearance
    // above his hat and 354 below her chin, BOTH heads whole. Anything
    // higher than about 35 starts closing on the hat brim, and the pair
    // sits high enough that no positive value improves the balance.
    posY: 0,
  },
  {
    id: "andrew-diane-owino",
    file: "Mr&Mrs Andrew Okwany.PNG",
    // ── THE SECOND TWO-PERSON SOURCE, AND THE FIRST LANDSCAPE ONE ────
    //
    // The file name is the one it was received under. It says Okwany and
    // the id says Owino, deliberately: the biography inside the text file
    // of the same name spells them Owino, that was confirmed, and the
    // source keeps its original name so the conflict stays visible. See
    // event.ts and DATA-NOTES.
    //
    // 1537x1023 — the Barakes' 1023x1537 TRANSPOSED, same pipeline, this
    // time landscape. That makes it the exact inverse of their crop and
    // the constraint flips with it. Theirs was 0.67:1, taller than 3:4,
    // so the window kept the full WIDTH and only `top` was a real choice.
    // This is 1.50:1, wider than 3:4, so the window keeps the full HEIGHT
    // and only `cx` is a real choice.
    //
    // FULL HEIGHT IS FORCED, and this is the whole reason. At 3:4 the
    // window is 767px wide, which is 49.9% of the frame — half the width
    // is discarded no matter what. Giving up any height narrows that 767
    // further, and the two of them measure 880px across (x 248..1128 by
    // pixel scan). They ALREADY do not fit: 113px has to go. So top 0 /
    // bottom 1 is not a preference about headroom, it is the setting that
    // loses the least of them. The 144px of empty plum above his head
    // comes along with it and is the price.
    //
    // WHAT THE 113px IS. Their measured midpoint is x 688, so cx 0.448
    // puts the window at 305..1072 and splits the loss almost evenly: 57px
    // off the outside of his left shoulder, 56px off the right edge of her
    // dress. Both are cloth at the frame's edge, not faces and not hands
    // — their heads sit at x 520..980 and their linked hands at x 640..1070,
    // all of it well inside. cx is measured rather than 0.5 because the
    // right 26% of the source (x 1128..1537) is empty plum: centring the
    // window on the FRAME would spend 100px of it on backdrop and take
    // that 100px out of his shoulder instead.
    top: 0,
    bottom: 1,
    cx: 0.448,
    // Verified in --preview, which is what the note at the top of this
    // file says to do and what this pose needs: the avatar keeps a 540
    // square out of the 720-tall output, so posY chooses among 180px of
    // travel, and their faces are stacked DIAGONALLY rather than side by
    // side — he leans down to her, so his crown is high and her chin is
    // the lowest point of the pair. 0 keeps both heads whole with air
    // above his and her chin clear of the bottom edge; any positive value
    // starts closing on his crown while gaining nothing below.
    posY: 0,
  },
  {
    id: "resper-gogo",
    file: "Resper Gogo.PNG",
    // ── THE FIRST CLOSE-UP IN THIS FOLDER ────────────────────────────
    //
    // 1023x1537, the Barakes' shape exactly — 0.67:1, taller than 3:4 —
    // so the window keeps the FULL WIDTH and only `top` is a real
    // choice, with 173px of vertical slack and nothing else. cx is 0.5
    // because there is no other value: any narrowing is a crop of a
    // frame that is already only her head and shoulders.
    //
    // What is different is the register. Every other source here is shot
    // chest-up or three-quarter length with the head in the top third;
    // this one is a head-and-shoulders portrait where the head alone
    // runs y 290..1090, 52% of the frame. There is no crop that makes it
    // sit like the others, and zooming out is not available — the
    // photograph ends at her shoulders. So the crop's job is only to
    // keep the whole head comfortably inside both renderings.
    //
    // top 0 rather than the 173 the slack allows: it leaves 290px of air
    // above the headwrap instead of 117, and the bottom edge lands
    // mid-sweater either way. The tighter setting reads as a frame
    // pressing on the top of her head for nothing gained below.
    top: 0,
    bottom: 0.888,
    cx: 0.5,
    // MEASURED, not the 0 every row above uses, and this is the row that
    // needed the --preview render. The output is 540x720, so the avatar
    // square has 180px of travel; her head lands at y 153..575 of it.
    // The square must start at or above 153 to keep the headwrap crown
    // and at or below... at least 35 to keep the chin, so the whole legal
    // range is 35..153 and 94 is its middle: 59px of clearance above the
    // wrap and 59px below the chin, which is the balance 0 would not
    // have given — 0 would have put the chin 35px from the edge with all
    // the air above it. 94/180 is 52%.
    posY: 52,
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
