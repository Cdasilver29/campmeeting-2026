import { Band } from "@/components/band";
import { Reveal } from "@/components/reveal";
import { galleryImages } from "@/data";
import { GalleryGrid } from "@/features/gallery/components/gallery-grid";
import { pageMetadata } from "@/lib/metadata";
import { galleryPage } from "@/lib/page-identity";
import { DOC_HEADING } from "@/lib/typography";

export const metadata = pageMetadata(galleryPage);

/**
 * ── PREVIOUS CAMP MEETINGS ───────────────────────────────────────────
 *
 * 31 photographs from earlier years, converted to WebP by
 * tools/assets/gallery-photos.mjs, which also generates
 * src/data/gallery.ts with each file's real dimensions in it.
 *
 * ── THE ONLY PAGE ON THE SITE WITH NO PAGE HEADER ────────────────────
 *
 * Every other route opens with a PageHeader band: eyebrow, display-face
 * title, rule, meta line. This one opens with its h1 and then the
 * pictures, on the committee's instruction, and the instruction is right
 * for what this page is. A gallery is looked at, not read. The band and
 * its three lines of type were 400px of chrome above the first
 * photograph, and every one of those lines said something the pictures
 * say better or the reader did not need — the count, an explanation that
 * they load as you scroll, and an eyebrow naming an event these are
 * deliberately NOT from.
 *
 * `galleryPage` still carries all four strings, and that is not an
 * oversight: pageMetadata reads the title and description off it for the
 * <title> and the share card. So a link to /gallery still previews as
 * "Previous Camp Meetings" with a sentence under it — the strings were
 * removed from the BAND, not from the definition. Same arrangement
 * /speakers uses for its lockup; see the note in page-identity.ts.
 *
 * ── NOT PRECACHED ────────────────────────────────────────────────────
 *
 * Everything else in public/ is, because everything else in public/ is
 * something a page needs on campground signal. These are 3.2 MB of last
 * year's pictures. The exclusion is a manifestTransforms filter in
 * src/app/serwist/[path]/route.ts, where the note explains why; the
 * /gallery PAGE is still precached, so it opens offline with its heading
 * and without its photographs.
 */
export default function GalleryPage() {
  return (
    <Band innerClassName="flex flex-col gap-(--space-item)">
      <Reveal className="flex flex-col gap-(--space-item)">
        {/* The page's whole heading. No eyebrow above it and no meta line
            under it: the title is the answer to what this page is. */}
        <h1 className={DOC_HEADING}>{galleryPage.title}</h1>

        <section aria-label="Photographs from previous camp meetings">
          <GalleryGrid images={galleryImages} />
        </section>
      </Reveal>
    </Band>
  );
}
