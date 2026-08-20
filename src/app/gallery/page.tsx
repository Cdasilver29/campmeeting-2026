import { Band } from "@/components/band";
import { Reveal } from "@/components/reveal";
import { GalleryView } from "@/features/gallery/components/gallery-view";
import { pageMetadata } from "@/lib/metadata";
import { galleryPage } from "@/lib/page-identity";
import { DOC_HEADING } from "@/lib/typography";

export const metadata = pageMetadata(galleryPage);

/**
 * ── GALLERY ──────────────────────────────────────────────────────────
 *
 * Two collections behind a year selector: Camp Meeting 2026, grouped by
 * the day each photograph was taken on, and one undivided set from
 * previous years.
 *
 * The 2026 set ships empty and fills in during the week — see
 * src/data/gallery-2026.ts for the one line that adds a photograph. The
 * previous set is 31 photographs converted to WebP by
 * tools/assets/gallery-photos.mjs, which also generates src/data/gallery.ts
 * with each file's real dimensions in it. The two are separate files
 * because the generator rewrites its own from top to bottom on every run;
 * src/features/gallery/lib/collections.ts is what joins them.
 *
 * ── THE HEADING IS "GALLERY" ─────────────────────────────────────────
 *
 * It was "Previous Camp Meetings", which stopped being true the moment
 * this page gained a 2026 tab — and which named, as the title of the whole
 * page, the one collection that is NOT the default. The title of a page
 * with a year selector on it is the page, not one of its years.
 *
 * The <title> and the share card moved with it — `galleryPage` in
 * page-identity.ts is the one place either is written.
 *
 * ── THE ONLY PAGE ON THE SITE WITH NO PAGE HEADER ────────────────────
 *
 * Every other route opens with a PageHeader band: eyebrow, display-face
 * title, rule, meta line. This one opens with its h1 and then the
 * pictures, on the committee's instruction, and the instruction is right
 * for what this page is. A gallery is looked at, not read. The band and
 * its three lines of type were 400px of chrome above the first
 * photograph, and every one of those lines said something the pictures
 * say better or the reader did not need.
 *
 * ── NOT PRECACHED ────────────────────────────────────────────────────
 *
 * Everything else in public/ is, because everything else in public/ is
 * something a page needs on campground signal. These are 3.2 MB of
 * previous years' pictures, and the 2026 ones are more of the same. The
 * exclusion is a manifestTransforms filter in
 * src/app/serwist/[path]/route.ts and it matches the whole `/gallery/`
 * directory, so photographs added under `/gallery/2026/` are covered by it
 * the day they land. The /gallery PAGE is still precached, so it opens
 * offline with its heading and without its photographs.
 */
export default function GalleryPage() {
  return (
    <Band innerClassName="flex flex-col gap-(--space-item)">
      <Reveal className="flex flex-col gap-(--space-section)">
        {/* The page's whole heading. No eyebrow above it and no meta line
            under it: the title is the answer to what this page is. */}
        <h1 className={DOC_HEADING}>{galleryPage.title}</h1>
        <GalleryView />
      </Reveal>
    </Band>
  );
}
