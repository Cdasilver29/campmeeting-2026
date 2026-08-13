/**
 * The supplied hosts-and-elders artwork -> public/speakers/<id>.webp.
 *
 * A fourth converter beside speaker-photos.mjs, header-photos.mjs and
 * hero-photos.mjs, checked in for the reason all three of those are: the
 * crop windows and the `object-position` values below are decisions, and
 * a decision that lives only in a shell history is one the next person
 * has to re-make by eye.
 *
 * ── WHY IT IS NOT A FEW MORE ROWS IN speaker-photos.mjs ──────────────
 *
 * That script's crop model does not fit these files, and the reason is
 * what the two sets of artwork are.
 *
 * The seven speaker files are 1:1 SOCIAL POSTER cards with the person's
 * role and name burnt into the lower fifth in someone else's typeface. Its
 * whole crop model is one number, `bottom`, meaning "where this poster's
 * caption begins" — the window always starts at the top edge because the
 * only thing being escaped is the text at the foot.
 *
 * These five are not posters. They are cut-out studio portraits on the
 * camp's plum ground with NO type on them at all, and they arrive in three
 * different shapes: 1.333:1 landscape, 1:1 square and one that is already
 * exactly 3:4. There is no caption to avoid and the window has to be
 * placed rather than merely stopped, so the model here is `top`, `bottom`
 * and `cx` — a window positioned in both axes. Bolting a second, mutually
 * exclusive crop model into the other file as a branch would make both
 * harder to read than two short scripts that each do one thing.
 *
 * ── WHY THE OUTPUT GOES TO public/speakers/ ALL THE SAME ─────────────
 *
 * Because one of the five is a speaker. Eld. Ken Ochuka chairs the camp
 * meeting AND has a profile at /speakers/ken-ochuka, and event.ts says in
 * as many words that his photograph is "owed once, not twice". Writing his
 * file to a hosts directory and the other seven profiles to a speakers one
 * would put the same person's portrait in two places the moment anybody
 * added a second dual-role name.
 *
 * The two scripts write disjoint sets of ids and neither can clobber the
 * other's output: speaker-photos.mjs owns the seven profiled presenters,
 * this one owns the five hosts.
 *
 * ── THE CROP ─────────────────────────────────────────────────────────
 *
 * A 3:4 portrait window, which is the shape every other portrait on the
 * site is, because SpeakerPortrait reserves its box at 3:4 and the round
 * avatar takes a square out of the top of it. A file that were square or
 * landscape would be re-cropped by CSS at render time with no
 * `object-position` able to save it.
 *
 * `top` and `bottom` are fractions of the SOURCE height and give the
 * window its height; the width follows at 3:4. `cx` is the horizontal
 * centre of the subject, which is not 0.5 on four of the five — these are
 * three-quarter poses and every one of them stands off-centre.
 *
 * The window is clamped to stay inside the file, so a `cx` near an edge
 * slides the window rather than extracting out of bounds.
 *
 * `posY` is the vertical `object-position` the ROUND avatar needs, and it
 * is the only value here that is about rendering rather than about the
 * file. A 1:1 window onto a 3:4 frame keeps the full width and 75% of the
 * height, so `posY` decides which 75%. Run with `--preview` to render
 * exactly that circle and look at it; that is the check that catches a
 * face cut through the forehead, and it is how every value below was
 * settled.
 *
 * Both numbers are mirrored in src/data/event.ts (`image`,
 * `imagePosition`). This script writes the file; that data tells the
 * components how to frame it.
 *
 * ── SIZE, AND THE ONE INSTRUCTION THIS DOES NOT TAKE LITERALLY ───────
 *
 * 720px tall, the same ceiling speaker-photos.mjs uses and for the same
 * reason: the largest any of these is ever painted is the 160x213 CSS
 * portrait in a speaker page's header band, which is 480x640 at device
 * pixel ratio 3. 720 clears that with room and is never upscaled to reach
 * it.
 *
 * This pass was asked not to resize down. It is worth being exact about
 * what was and was not done with that, because the two halves of it pull
 * apart here. The quality half is taken in full — q90 rather than the q82
 * the bands use, no smaller for any file, nothing traded away to make a
 * number look better. The dimension half is not, and these are the figures
 * it was declined on. Encoded both ways, q90 effort 6:
 *
 *   id                native            720-tall
 *   gerald-mochoge    941x1254  99.2    540x720  34.1 KB
 *   ken-ochuka        941x1254 131.4    540x720  44.7 KB
 *   polycarp-nyangau 1086x1448 129.2    540x720  35.3 KB
 *
 * About 350 KB across the five, for pixels the site has no way to paint:
 * native is 2.3x the largest render in each direction. Every file in
 * public/ is precached (src/app/serwist/[path]), so that is 350 KB every
 * phone on campground signal pays for whether or not it opens /speakers,
 * against the offline requirement the whole PWA phase exists for.
 *
 * Change MAX_H and re-run if the committee would rather have the bytes.
 *
 * ── ONE FILE WAS TWICE THE SIZE OF THE OTHERS. IT HAS BEEN REPLACED ──
 *
 * SUPERSEDED, and kept because the finding still holds for any future
 * subject in a patterned shirt. The omondi-oyoo entry below no longer
 * writes the file the site uses: the committee has since sent a plain
 * studio portrait of him and tools/assets/portrait-photos.mjs cuts it,
 * at 25.6 KB. What follows is why the old one cost 82.3.
 *
 * omondi-oyoo is 82.3 KB where the other four are 35 to 48. That is not a
 * setting that drifted and it is not fixed by turning the quality down;
 * it is the SUBJECT. He is photographed in a fine blue gingham check that
 * fills the lower two thirds of the frame, and a regular high-frequency
 * pattern is the most expensive thing a DCT codec can be handed. The
 * other four are wearing plain worsted suits, which cost almost nothing.
 *
 * Swept, same crop, effort 6:
 *
 *   q82 54.5   q86 64.8   q88 73.1   q90 82.3   q92 94.1   q95 116.7 KB
 *
 * A smooth curve with no knee in it, which is what confirms there is no
 * cheaper setting hiding in there — there is only detail, and detail
 * costs bytes at every quality. The header bands take q78-82 on the
 * argument that a 0.62-alpha scrim covers every pixel of them; that
 * argument does not reach here, because a speaker portrait is shown
 * unscrimmed at 160x213 and the check is exactly what would go mushy.
 * So it is reported rather than hidden.
 *
 * Usage: node tools/assets/host-photos.mjs <source-dir> [--preview <dir>]
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
  console.error("usage: node tools/assets/host-photos.mjs <source-dir> [--preview <dir>]");
  process.exit(1);
}
const previewFlag = process.argv.indexOf("--preview");
const PREVIEW = previewFlag > -1 ? process.argv[previewFlag + 1] : null;

const OUT = join(ROOT, "public", "speakers");
mkdirSync(OUT, { recursive: true });
if (PREVIEW) mkdirSync(PREVIEW, { recursive: true });

/** 3x the 160x213 CSS portrait. Applied as a ceiling, never as a target. */
const MAX_H = 720;
/** Visually lossless for photographic content. */
const QUALITY = 90;

const HOSTS = [
  {
    id: "gerald-mochoge",
    file: "Mochoge.PNG",
    // 1254x1254. Head 0.06-0.38, and he is turned to his right with the
    // near shoulder filling the lower right of the frame, so the face
    // centre is at x 0.57 rather than the middle. 0.86 of the height
    // stops just below the clasped hands, which is where this pose ends;
    // the full frame would add 170px of plum below them.
    top: 0,
    bottom: 0.86,
    cx: 0.57,
    posY: 0,
  },
  {
    id: "elvis-onyango",
    file: "Elvis.PNG",
    // 1254x1254. The Bible he is holding is the reason this window is
    // nearly the full height: it sits at y 0.55-0.90 and cutting it in
    // half would leave an unidentifiable dark rectangle at the foot of
    // the card. Head 0.09-0.44, face centre x 0.60.
    top: 0,
    bottom: 0.95,
    cx: 0.58,
    posY: 0,
  },
  {
    id: "polycarp-nyangau",
    file: "Polycarp.PNG",
    // 1086x1448, the one source that is ALREADY exactly 3:4 — so this is
    // the only row where the window is a choice to zoom rather than a
    // shape to reach, and it is taken.
    //
    // Left uncut it is much the widest-framed of the five: a standing
    // three-quarter shot with the head at y 0.14-0.37, so the face is a
    // fifth of the height where every other host's is a third. Rendered
    // at 56px beside four head-and-shoulders portraits he read as a
    // different kind of picture, not as a smaller one.
    //
    // 0.05-0.76 is chest-up, which puts his head at 0.12-0.45 of the
    // window and in the same register as the rest of the row. The bottom
    // edge is 0.76 and not lower because his hands are at y 0.77-0.87:
    // stopping just above them cuts at nothing, where 0.80 would have
    // taken the tops of the fingers off.
    //
    // It costs no sharpness. The window is 771x1028, so it still
    // downsamples to the 540x720 output rather than being stretched to it.
    top: 0.05,
    bottom: 0.76,
    cx: 0.52,
    posY: 0,
  },
  {
    id: "ken-ochuka",
    file: "Ken-ochuka.PNG",
    // 1254x1254. The one host who is also a profiled speaker, so this
    // file is the one that has to survive at 160x213 on his own page as
    // well as at 56px on a card. Head 0.08-0.50, the largest of the five
    // in frame, and he is turned to his right: face centre x 0.60.
    top: 0,
    bottom: 0.92,
    cx: 0.58,
    posY: 0,
  },
  {
    id: "omondi-oyoo",
    // The SOURCE file keeps the name the committee sent it under. The id
    // and the written file are omondi-oyoo; this is the key that finds
    // their artwork on disk, and renaming it here would only stop the
    // script finding it.
    file: "George.PNG",
    // 1448x1086, the only landscape source. Full height, so the window is
    // 814 of 1448 wide and the horizontal placement is the whole decision.
    // Arms crossed at y 0.5-0.95 spanning x 0.17-0.85, wider than any 3:4
    // window can hold, so the outer elbows go either way; 0.515 centres on
    // the face and loses them evenly rather than cutting one arm off at
    // the shoulder.
    top: 0,
    bottom: 1,
    cx: 0.515,
    posY: 0,
  },
];

const rows = [];

for (const h of HOSTS) {
  const src = join(SRC, h.file);
  const srcBytes = statSync(src).size;
  const meta = await sharp(src).metadata();

  // The window, in source pixels. Height from top/bottom, width at 3:4,
  // both clamped so a cx near an edge slides the window instead of
  // extracting out of bounds.
  let winH = Math.round((h.bottom - h.top) * meta.height);
  let winW = Math.round((winH * 3) / 4);
  if (winW > meta.width) {
    winW = meta.width;
    winH = Math.round((winW * 4) / 3);
  }
  const top = Math.max(0, Math.min(meta.height - winH, Math.round(h.top * meta.height)));
  const left = Math.max(
    0,
    Math.min(meta.width - winW, Math.round(h.cx * meta.width - winW / 2)),
  );

  let img = sharp(src).extract({ left, top, width: winW, height: winH });
  let outW = winW;
  let outH = winH;
  if (winH > MAX_H) {
    outH = MAX_H;
    outW = Math.round((MAX_H * 3) / 4);
    img = img.resize({ height: MAX_H });
  }

  const out = join(OUT, `${h.id}.webp`);
  await img.webp({ quality: QUALITY, effort: 6, smartSubsample: true }).toFile(out);
  const outBytes = statSync(out).size;

  if (PREVIEW) {
    /* Two previews, because these files are rendered two ways and only
       one of them is the whole file. `-portrait` is what a speaker page's
       header band shows; `-avatar` is the square window the round avatar
       on a card actually keeps, offset by posY. The second is the check
       that catches a face cut in half. */
    await sharp(out).resize(240, 320).png().toFile(join(PREVIEW, `${h.id}-portrait.png`));
    const keep = outW;
    const aTop = Math.round((h.posY / 100) * (outH - keep));
    await sharp(out)
      .extract({ left: 0, top: aTop, width: keep, height: keep })
      .resize(192, 192)
      .png()
      .toFile(join(PREVIEW, `${h.id}-avatar.png`));
  }

  rows.push({ ...h, meta, srcBytes, left, top, winW, winH, outW, outH, outBytes });
}

const pad = (v, n) => String(v).padEnd(n);
console.log(
  pad("id", 19) + pad("source", 17) + pad("source px", 12) + pad("source KB", 11) +
  pad("crop taken", 22) + pad("output px", 11) + pad("output KB", 11) + "object-position",
);
console.log("-".repeat(120));
for (const r of rows) {
  console.log(
    pad(r.id, 19) + pad(r.file, 17) +
    pad(`${r.meta.width}x${r.meta.height}`, 12) +
    pad((r.srcBytes / 1024).toFixed(1), 11) +
    pad(`${r.left},${r.top} ${r.winW}x${r.winH}`, 22) +
    pad(`${r.outW}x${r.outH}`, 11) +
    pad((r.outBytes / 1024).toFixed(1), 11) +
    `50% ${r.posY}%`,
  );
}
console.log(
  `\ntotal written: ${(rows.reduce((a, r) => a + r.outBytes, 0) / 1024).toFixed(1)} KB ` +
  `into public/speakers/ (all of it precached)`,
);
