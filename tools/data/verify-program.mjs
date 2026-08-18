/**
 * Prints the programme as data, one line per session, so it can be read
 * side by side with the printed PDF.
 *
 * The gate on every programme change is that the number of rows on a PDF
 * page equals the number of sessions in that day's blocks, and that each
 * row's credit matches. The first half of that is arithmetic and belongs
 * in a script; the second half is reading, and this is what you read.
 *
 * Usage:
 *   node tools/data/verify-program.mjs            # counts only
 *   node tools/data/verify-program.mjs --full     # every session
 *   node tools/data/verify-program.mjs --day sabbath-15
 *
 * Reads program.ts through esbuild, which is already a devDependency for
 * the service worker build. No new dependency, and no duplicate of the
 * data in a fixture that would then drift.
 */
import { build } from "esbuild";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");

const args = process.argv.slice(2);
const full = args.includes("--full");
const dayIdx = args.indexOf("--day");
const onlyDay = dayIdx !== -1 ? args[dayIdx + 1] : undefined;

const out = mkdtempSync(join(tmpdir(), "cm-verify-"));
const bundle = join(out, "program.mjs");
await build({
  entryPoints: [join(ROOT, "src/data/program.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: bundle,
  logLevel: "silent",
});
const { program } = await import(pathToFileURL(bundle).href);
rmSync(out, { recursive: true, force: true });

const credits = (s) => [...(s.presenterIds ?? []), ...(s.presentedBy ?? [])];

let grand = 0;
for (const day of program) {
  if (onlyDay && day.id !== onlyDay) continue;
  const dayTotal = day.blocks.reduce((n, b) => n + b.sessions.length, 0);
  grand += dayTotal;
  const allBlock = day.blocks.filter((b) => b.allBlockActivity);
  console.log(
    `\n${day.displayLabel.padEnd(24)} ${String(dayTotal).padStart(3)} timed` +
      (allBlock.length ? ` + ${allBlock.length} all-block` : ""),
  );
  for (const block of day.blocks) {
    console.log(
      `  ${block.label.padEnd(22)} ${String(block.sessions.length).padStart(3)}` +
        (block.allBlockActivity ? `  [${block.allBlockActivity.title}]` : ""),
    );
    if (!full && !onlyDay) continue;
    for (const s of block.sessions) {
      const time = s.start ? `${s.start}-${s.end}` : "untimed";
      const title = s.subtitle ? `${s.title} / ${s.subtitle}` : s.title;
      console.log(
        `      ${time.padEnd(12)} ${title.padEnd(46)} ${credits(s).join(", ")}`,
      );
    }
  }
}
console.log(`\nTOTAL timed sessions: ${grand}`);

// Ids must be unique: they are localStorage bookmark keys.
const ids = program.flatMap((d) => d.blocks.flatMap((b) => b.sessions.map((s) => s.id)));
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupes.length) {
  console.error(`\nDUPLICATE IDS: ${[...new Set(dupes)].join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(`Unique ids: ${ids.length}/${ids.length}`);
}
