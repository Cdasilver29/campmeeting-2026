import Image from "next/image";
import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { galleryImages } from "@/data";
import { pageMetadata } from "@/lib/metadata";
import { galleryPage } from "@/lib/page-identity";
import { MEASURE } from "@/lib/typography";

export const metadata = pageMetadata(galleryPage);

/**
 * ── PREVIOUS CAMP MEETINGS ───────────────────────────────────────────
 *
 * 31 photographs from earlier years, converted to WebP by
 * tools/assets/gallery-photos.mjs, which also generates src/data/gallery.ts
 * with each file's real dimensions in it.
 *
 * ── NOT PRECACHED, AND THIS IS THE PAGE THAT PROVES IT ───────────────
 *
 * Everything else in public/ is precached, because everything else in
 * public/ is something a page needs on campground signal. These are 3.2 MB
 * of last year's pictures. The exclusion is a manifestTransforms filter in
 * src/app/serwist/[path]/route.ts; the note there says why, and the /gallery
 * PAGE is still precached, so it opens offline with its text and without
 * its photographs.
 *
 * ── NO LAYOUT SHIFT ──────────────────────────────────────────────────
 *
 * Every cell reserves its own space before anything decodes, from the
 * `aspect-ratio` set on the wrapper out of the file's real width and
 * height. That is why the data file is generated rather than typed: a
 * wrong number here is a reflow, and 31 hand-copied pairs of numbers go
 * wrong quietly.
 *
 * A masonry column layout, not a fixed grid. These are 4:3, 16:9, 2.1:1
 * and one portrait, and a uniform grid would either crop them or leave
 * different amounts of air under each. `columns` lets each keep its own
 * shape, and `break-inside-avoid` keeps one from splitting across a
 * column break.
 *
 * ── ALT TEXT ─────────────────────────────────────────────────────────
 *
 * There is none, and empty `alt` is the correct value rather than a gap.
 * The committee supplied photographs and no captions, so nothing here
 * knows who is in them or what is happening. A generated description
 * would be a guess read out to a screen reader as fact. The set is given
 * one accessible name — the section it sits in — and the images
 * themselves are marked decorative, which is what an unlabelled
 * photograph honestly is. Captions would change that in one edit: add a
 * field to GalleryImage and pass it here.
 */
export default function GalleryPage() {
  return (
    <>
      <PageHeader {...galleryPage}>
        <p>
          Photographs from earlier years at Newlife. This year&rsquo;s are
          published as camp meeting goes on.
        </p>
      </PageHeader>

      <Band>
        <Reveal>
          <section
            aria-label="Photographs from previous camp meetings"
            className="flex flex-col gap-(--space-item)"
          >
            <p className={MEASURE}>
              {galleryImages.length} photographs. They load as you scroll, so
              the page opens on mobile data without fetching all of them.
            </p>

            <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
              {galleryImages.map((image, index) => (
                <div
                  key={image.id}
                  className="mb-3 overflow-hidden rounded-card bg-surface-muted break-inside-avoid ring-1 ring-line"
                  // The cell's shape, before anything is downloaded.
                  style={{ aspectRatio: `${image.width} / ${image.height}` }}
                >
                  <Image
                    src={image.src}
                    alt=""
                    width={image.width}
                    height={image.height}
                    // The first three are the only ones that can be above
                    // the fold at any width this site supports, so they
                    // are eager and everything after them is lazy. `lazy`
                    // on all 31 would delay the ones already on screen;
                    // eager on all 31 is 3.2 MB on open, which is the
                    // whole thing this page is trying not to do.
                    loading={index < 3 ? "eager" : "lazy"}
                    // One column below sm, two to lg, three above, inside
                    // the 80rem shell.
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      </Band>
    </>
  );
}
