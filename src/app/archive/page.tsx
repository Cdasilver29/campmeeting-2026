import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { ArchiveView } from "@/features/archive/components/archive-view";
import { pageMetadata } from "@/lib/metadata";
import { archivePage } from "@/lib/page-identity";

export const metadata = pageMetadata(archivePage);

/**
 * Every camp meeting the church has published, by year.
 *
 * ── STATICALLY GENERATED, AND INDEPENDENT OF THE PROGRAMME ───────────
 *
 * Nothing on this route reads src/data/program.ts, and nothing under
 * src/features/archive or src/data/archive may start to. Next year's
 * programme swap replaces program.ts wholesale; this page must not
 * notice. See the note at the top of src/data/archive/types.ts.
 *
 * ── NO PHOTOGRAPH BEHIND THE HEADER ──────────────────────────────────
 *
 * `archivePage` carries no `image`, so the band is the plain muted one.
 * The eleven pages with a photograph each have a picture OF that page's
 * subject; the archive's subject is seven years of video, and the
 * thumbnails below are that. A header photograph from one of those years
 * would be picking a year to stand for the rest.
 *
 * The view runs to the full shell rather than the prose measure — it is a
 * four-column grid of thumbnails, and capping it would leave a ribbon
 * down the middle of a 1440px page. The paragraphs inside it take the
 * measure individually, which is the arrangement /livestream arrived at
 * for the same reason.
 */
export default function ArchivePage() {
  return (
    <>
      <PageHeader {...archivePage} />

      <Band>
        <Reveal>
          <ArchiveView />
        </Reveal>
      </Band>
    </>
  );
}
