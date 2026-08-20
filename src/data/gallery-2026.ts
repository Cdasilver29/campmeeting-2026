/**
 * ── PHOTOGRAPHS FROM CAMP MEETING 2026 ───────────────────────────────
 *
 * HAND-EDITED. This file is not generated and no tool writes to it.
 *
 * That is the whole reason it is a file of its own. Its sibling,
 * src/data/gallery.ts, is written from top to bottom by
 * tools/assets/gallery-photos.mjs on every run — so a 2026 photograph
 * typed in there would survive exactly until the next time somebody
 * regenerated the previous-years set, and then vanish without an error.
 * The generator does not know this file exists.
 *
 * ── ADDING A PHOTOGRAPH ──────────────────────────────────────────────
 *
 * Two steps, and the second one is one line.
 *
 *   1. Put the file in `public/gallery/2026/`. WebP, long edge 1600, the
 *      same treatment the previous-years set gets — see the note on SIZE
 *      and QUALITY in tools/assets/gallery-photos.mjs. To convert one by
 *      hand with the same settings the generator uses:
 *
 *        node tools/assets/gallery-photos.mjs --one <file> <day-id>
 *
 *      which writes the file AND prints the finished line to paste below,
 *      dimensions already filled in.
 *
 *   2. Append a line to the array:
 *
 *        { dayId: "wednesday-19", src: "/gallery/2026/choir-night.webp", width: 1600, height: 1066 },
 *
 * `dayId` is a day id from src/data/program.ts — sabbath-15, sunday-16,
 * monday-17, tuesday-18, wednesday-19, thursday-20, friday-21,
 * sabbath-22. Anything else FAILS THE BUILD rather than filing the
 * picture under a heading that does not exist; the check and the message
 * are in src/features/gallery/lib/collections.ts, and it is the same
 * trade src/features/livestream/lib/recordings.ts makes with its dayIds.
 *
 * `width` and `height` are the file's REAL dimensions. They are what the
 * grid reserves each cell's space with before anything downloads, so a
 * guess here is a layout shift. The `--one` mode above exists so nobody
 * has to read them off a file inspector at eleven at night.
 *
 * ORDER DOES NOT MATTER. The page groups by day in programme order and
 * keeps each day's photographs in the order they are written here, so a
 * line appended at the bottom lands under the right heading wherever it
 * was typed.
 *
 * ── EMPTY IS A REAL STATE, NOT A MISSING ONE ─────────────────────────
 *
 * It ships empty on purpose. /gallery draws the 2026 tab either way and
 * says the photographs are still being collected; a day with nothing in
 * it draws no heading at all rather than an empty one. See
 * src/features/gallery/components/gallery-view.tsx.
 */
import type { DayGalleryImage } from "./types";

export const gallery2026Images: DayGalleryImage[] = [];
