/**
 * The gallery: `camp-gallery/` to `public/gallery/`, JPEG to WebP.
 *
 * ── IT OWNS ONE FILE, AND THAT FILE HOLDS PREVIOUS YEARS ONLY ────────
 *
 * This script rewrites src/data/gallery.ts from top to bottom on every
 * run. Anything typed into that file survives until the next run and then
 * disappears without an error, which is a bad way to lose photographs.
 *
 * So the 2026 set is NOT in it. It lives in src/data/gallery-2026.ts, is
 * hand-edited, and is not read, written or referenced anywhere below —
 * deliberately, because the guarantee wanted here is not "the script is
 * careful with it" but "the script cannot touch it". The two files are
 * joined into the year collections /gallery renders by
 * src/features/gallery/lib/collections.ts.
 *
 * The batch mode below is therefore the PREVIOUS-YEARS mode, and running
 * it is safe at any time. The `--one` mode is the 2026 path: it converts a
 * single photograph into public/gallery/2026/ and prints the line to paste
 * into src/data/gallery-2026.ts, with the real dimensions filled in. It
 * writes no data file at all.
 *
 * Sibling of speaker-photos.mjs and header-photos.mjs, and it does less
 * than either: no crop, no `object-position` to derive. These are
 * photographs of previous camp meetings, they are shown whole, and the
 * only decisions are how large and how lossy.
 *
 * ── SIZE ─────────────────────────────────────────────────────────────
 *
 * MAX 1600 on the long edge. The sources run to 2048, and the widest a
 * gallery image is ever painted is one column of a three-column grid
 * inside the 80rem shell — about 400px, so 800 physical pixels on a 2x
 * phone. 1600 is double that again, which leaves room for a full-screen
 * view later without another pass over the originals. Anything above it
 * is pixels no screen on this site can use.
 *
 * ── QUALITY ──────────────────────────────────────────────────────────
 *
 * q82, effort 6, and "visually lossless" is doing real work in that
 * choice rather than meaning q100. These are already lossy JPEGs, most of
 * them saved by Facebook, so the artefacts are in the source: re-encoding
 * at q95 spends bytes preserving JPEG ringing. Swept on the three
 * heaviest files, the knee is at 82 and the curve above it is flat in
 * appearance and steep in bytes. The header bands take q78 on the
 * argument that a scrim covers them; that argument does not reach here,
 * because a gallery photograph is shown unscrimmed and looked at, which
 * is why this is four points higher.
 *
 * ── THE NAMES ────────────────────────────────────────────────────────
 *
 * The sources are named `484110649_962700029397235_346005…_n.jpg`, which
 * is Facebook's id scheme. They are renamed `camp-01.webp` upward, in the
 * sources' own sort order, because a filename appears in the URL and in
 * the HTML and there is no reason to publish somebody's CDN ids. The map
 * from old name to new is printed on every run, so a re-run against the
 * same folder produces the same names.
 *
 * ── THESE ARE NOT PRECACHED ──────────────────────────────────────────
 *
 * Everything else in public/ is. See the manifestTransforms filter in
 * src/app/serwist/[path]/route.ts, and the note there for why the gallery
 * is the one exception on the site.
 *
 * Usage:
 *   node tools/assets/gallery-photos.mjs <source-dir>
 *     Previous years. Converts the folder, renames camp-01 upward, and
 *     REWRITES src/data/gallery.ts.
 *
 *   node tools/assets/gallery-photos.mjs --one <file> <day-id> [name]
 *     One photograph from this year. Converts it into
 *     public/gallery/2026/ and prints the line to paste into
 *     src/data/gallery-2026.ts. Writes no data file.
 */
import { createRequire } from "node:module";
import { mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const require = createRequire(join(ROOT, "package.json"));
const sharp = require("sharp");

const OUT_DIR = join(ROOT, "public", "gallery");
const CURRENT_DIR = join(OUT_DIR, "2026");
const DATA_FILE = join(ROOT, "src", "data", "gallery.ts");
const MAX_EDGE = 1600;
const QUALITY = 82;

/** Resize to the long edge and encode, returning the finished dimensions. */
async function convert(from, to) {
  const input = sharp(from);
  const meta = await input.metadata();
  const longest = Math.max(meta.width, meta.height);
  const scale = longest > MAX_EDGE ? MAX_EDGE / longest : 1;
  const width = Math.round(meta.width * scale);
  const height = Math.round(meta.height * scale);
  await input
    .resize(width, height, { withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(to);
  return { width, height, sourceWidth: meta.width, sourceHeight: meta.height };
}

/*
 * ── --one: THE 2026 PATH ─────────────────────────────────────────────
 *
 * Same size and same quality as the batch above, because a photograph
 * from this week and a photograph from four years ago sit in the same
 * grid and should not be two different encodings.
 *
 * It PRINTS the data line rather than writing it. Editing
 * src/data/gallery-2026.ts from here would make this script an owner of
 * that file, which is the one thing the split exists to prevent: a script
 * that can write a file is a script that can lose it. The line is
 * complete, dimensions and all, so pasting it is the whole job.
 *
 * The day id is not validated here. It is validated at BUILD time by
 * src/features/gallery/lib/collections.ts, which is the place that knows
 * the programme, and a typo there stops the deploy with the list of valid
 * ids in the message.
 */
if (process.argv[2] === "--one") {
  const [, , , file, dayId, name] = process.argv;
  if (!file || !dayId) {
    console.error(
      "usage: node tools/assets/gallery-photos.mjs --one <file> <day-id> [name]",
    );
    process.exit(1);
  }

  mkdirSync(CURRENT_DIR, { recursive: true });
  const slug = (name ?? basename(file, extname(file)))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const to = join(CURRENT_DIR, `${slug}.webp`);
  const { width, height, sourceWidth, sourceHeight } = await convert(file, to);

  console.log(
    `${sourceWidth}x${sourceHeight} -> ${width}x${height}   ${to}  ` +
      `(${Math.round(statSync(to).size / 1024)} KB)`,
  );
  console.log("\nPaste this line into src/data/gallery-2026.ts:\n");
  console.log(
    `  { dayId: "${dayId}", src: "/gallery/2026/${slug}.webp", width: ${width}, height: ${height} },\n`,
  );
  process.exit(0);
}

const SOURCE = process.argv[2];
if (!SOURCE) {
  console.error(
    "usage: node tools/assets/gallery-photos.mjs <source-dir>\n" +
      "       node tools/assets/gallery-photos.mjs --one <file> <day-id> [name]",
  );
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const sources = readdirSync(SOURCE)
  .filter((name) => [".jpg", ".jpeg", ".png"].includes(extname(name).toLowerCase()))
  .sort();

const rows = [];
let sourceBytes = 0;
let outBytes = 0;

for (const [index, name] of sources.entries()) {
  const from = join(SOURCE, name);
  const id = `camp-${String(index + 1).padStart(2, "0")}`;
  const to = join(OUT_DIR, `${id}.webp`);

  const { width, height, sourceWidth, sourceHeight } = await convert(from, to);

  const inSize = statSync(from).size;
  const outSize = statSync(to).size;
  sourceBytes += inSize;
  outBytes += outSize;

  rows.push({ id, width, height, name, inSize, outSize });
  console.log(
    `${id}  ${String(sourceWidth).padStart(4)}x${String(sourceHeight).padEnd(4)} -> ` +
      `${String(width).padStart(4)}x${String(height).padEnd(4)}  ` +
      `${String(Math.round(inSize / 1024)).padStart(4)} -> ${String(Math.round(outSize / 1024)).padStart(4)} KB   ${name}`,
  );
}

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
console.log(
  `\n${rows.length} images   ${kb(sourceBytes)} JPEG -> ${kb(outBytes)} WebP   ` +
    `(${Math.round((1 - outBytes / sourceBytes) * 100)}% smaller)`,
);

/*
 * The data file is GENERATED, and that is why the dimensions in it can be
 * trusted. Every image needs its intrinsic width and height in the markup
 * or the grid reflows as each one decodes, and a hand-kept list of 31
 * pairs of numbers is a list that is wrong by the third edit.
 *
 * It holds PREVIOUS YEARS ONLY, and the header it is given says so, because
 * this write is unconditional: whatever was in the file is gone. The 2026
 * set is in src/data/gallery-2026.ts and nothing here opens it.
 */
const generated = `// GENERATED by tools/assets/gallery-photos.mjs. Do not edit by hand.
//
// Re-run it against the source folder to regenerate:
//   node tools/assets/gallery-photos.mjs <source-dir>
//
// PREVIOUS CAMP MEETINGS ONLY. This file is rewritten from top to bottom
// on every run, so anything typed into it is gone the next time the
// previous-years set is regenerated. Photographs from CAMP MEETING 2026
// go in src/data/gallery-2026.ts, which is hand-edited and which the
// generator does not open. The two are joined into the year collections
// the page renders by src/features/gallery/lib/collections.ts.
//
// The width and height are the file's real dimensions and are what the
// grid reserves space with, so nothing reflows as the images decode.
import type { GalleryImage } from "./types";

export const previousGalleryImages: GalleryImage[] = [
${rows
  .map(
    (r) =>
      `  { id: "${r.id}", src: "/gallery/${r.id}.webp", width: ${r.width}, height: ${r.height} },`,
  )
  .join("\n")}
];
`;
writeFileSync(DATA_FILE, generated, "utf8");
console.log(`wrote ${DATA_FILE}`);
