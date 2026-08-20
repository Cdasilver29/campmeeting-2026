import {
  eventInfo,
  gallery2026Images,
  previousGalleryImages,
  program,
  type GalleryImage,
} from "@/data";

/**
 * ── THE GALLERY, BY YEAR AND THEN BY DAY ─────────────────────────────
 *
 * Two data files go in and a list of year collections comes out. Nothing
 * on the page knows how either file is shaped.
 *
 *   src/data/gallery.ts        GENERATED, previous camp meetings, flat.
 *   src/data/gallery-2026.ts   HAND-EDITED, this week, one dayId a line.
 *
 * They are separate files because one of them is overwritten wholesale
 * every time tools/assets/gallery-photos.mjs runs and the other is typed
 * by a person during the week. Merging them into one file would mean a
 * regeneration silently deleting this year's photographs, which is the
 * exact failure this arrangement exists to make impossible. The generator
 * has no reference to gallery-2026.ts anywhere in it.
 *
 * ── 2026 LEADS ───────────────────────────────────────────────────────
 *
 * First in the list and selected by default. It is this week's event, not
 * an archive: somebody opening /gallery on the Thursday of camp meeting is
 * looking for Wednesday night, not for a photograph from a year nobody
 * here can date.
 *
 * ── AND THE PREVIOUS SET IS ONE COLLECTION, NOT SEVERAL ──────────────
 *
 * The 31 photographs came from the committee as a folder with no years
 * attached, and nothing in the files says which meeting each is from. So
 * they are one group under one honest label. Splitting them into invented
 * years would be a caption presented as a fact, which is the same reason
 * none of them carries alt text — see the note on GalleryImage in
 * src/data/types.ts.
 *
 * ── DAY GROUPING COMES FROM THE PROGRAMME ────────────────────────────
 *
 * The order of the days and the words in each heading are `program`'s, via
 * `displayLabel` — the same string the schedule, the archive and the day
 * pages set. No day name is written here or in the components, so a
 * committee edit to program.ts moves this page with it and a future year
 * needs no change at all.
 *
 * A day with no photographs yet produces NO GROUP, so the page draws no
 * empty heading. That is a filter here rather than a check in the markup,
 * because "which days have pictures" is a fact about the data.
 *
 * ── AN UNKNOWN dayId FAILS THE BUILD ─────────────────────────────────
 *
 * Same trade, and for the same reason, as the recording ids in
 * src/features/livestream/lib/recordings.ts: /gallery is statically
 * generated, so throwing at module scope surfaces during `next build` as a
 * prerender failure and the deploy stops. A typo in a dayId would
 * otherwise file a photograph under no heading at all and drop it from the
 * page without a word.
 */

export interface GalleryGroup {
  /** Stable key. The dayId, or the collection id for an ungrouped set. */
  id: string;
  /**
   * The heading above this group, where the group is one of several.
   * Absent on a collection that is a single undivided set — there is
   * nothing to distinguish it FROM, so a heading would be decoration.
   */
  label?: string;
  images: GalleryImage[];
}

export interface GalleryCollection {
  /** Stable key, and the tab's value. */
  id: string;
  /** What the tab says. */
  label: string;
  /** The accessible name of the panel, where the tab alone is too short. */
  description: string;
  /**
   * What the panel says when it holds nothing.
   *
   * Per collection rather than one generic sentence, because the two say
   * different things: 2026 is a week in progress and the answer is "not
   * yet, and they will be filed by day"; the previous set is finished and
   * an empty one would mean the generator has not been run.
   */
  emptyMessage: string;
  groups: GalleryGroup[];
  /**
   * Every image in the collection, flattened in render order.
   *
   * This is the lightbox's index space and it is why the flattening
   * happens here rather than in the component: paging with the arrow keys
   * has to run through a day's last photograph into the next day's first,
   * so "photograph 12 of 40" has to count the collection and not the
   * group. A per-group index would restart at each heading and the counter
   * would lie.
   */
  images: GalleryImage[];
}

/* The year comes from the event, not from a literal, so the tab is right
   in 2027 without an edit here. */
const CURRENT_ID = String(eventInfo.year);
const PREVIOUS_ID = "previous";

const validDayIds = new Set(program.map((day) => day.id));

for (const image of gallery2026Images) {
  if (!validDayIds.has(image.dayId)) {
    throw new Error(
      `Gallery photograph "${image.src}" has dayId "${image.dayId}", which is not a day in src/data/program.ts. ` +
        `Valid ids: ${program.map((d) => d.id).join(", ")}. See src/data/gallery-2026.ts.`,
    );
  }
}

/**
 * The id the grid and the lightbox key on.
 *
 * Derived from `src` rather than typed, because `src` is a path and a path
 * is already unique — and requiring a hand-written id would be one more
 * field on a line somebody adds from a phone at the end of a long day, and
 * one more thing that can silently collide.
 */
const idFromSrc = (src: string) => src.replace(/^\/gallery\//, "").replace(/\.[a-z0-9]+$/i, "");

const currentGroups: GalleryGroup[] = program
  .map((day) => ({
    id: day.id,
    label: day.displayLabel,
    images: gallery2026Images
      .filter((image) => image.dayId === day.id)
      // Rebuilt field by field rather than spread-minus-dayId, so a new
      // field on DayGalleryImage has to be handled here on purpose rather
      // than leaking into the grid's props by accident.
      .map((image) => ({
        id: idFromSrc(image.src),
        src: image.src,
        width: image.width,
        height: image.height,
      })),
  }))
  // Days with nothing yet draw no heading at all.
  .filter((group) => group.images.length > 0);

const collection = (
  entry: Omit<GalleryCollection, "images">,
): GalleryCollection => ({
  ...entry,
  images: entry.groups.flatMap((group) => group.images),
});

export const galleryCollections: GalleryCollection[] = [
  collection({
    id: CURRENT_ID,
    label: CURRENT_ID,
    description: `Photographs from ${eventInfo.edition}`,
    emptyMessage: `Photographs from ${eventInfo.edition} are still being collected. They will appear here, grouped by day, as they come in.`,
    groups: currentGroups,
  }),
  collection({
    id: PREVIOUS_ID,
    label: "Previous camp meetings",
    description: "Photographs from previous camp meetings",
    emptyMessage:
      "No photographs from previous camp meetings are published yet.",
    // One group, no label: there is nothing here to distinguish it from.
    groups:
      previousGalleryImages.length > 0
        ? [{ id: PREVIOUS_ID, images: previousGalleryImages }]
        : [],
  }),
];

/** 2026 leads — see the note above. */
export const defaultCollectionId = CURRENT_ID;
