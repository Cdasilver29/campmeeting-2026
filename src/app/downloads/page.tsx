import Link from "next/link";
import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { ProgrammeDownload } from "@/features/downloads/components/programme-download";
import { pageMetadata } from "@/lib/metadata";
import { downloadsPage } from "@/lib/page-identity";

export const metadata = pageMetadata(downloadsPage);

/**
 * One download, and that is the whole page.
 *
 * It has been three things. A full-programme booklet entry that never had
 * a file and always read "coming soon"; then eight daily sheets published
 * a day at a time, seven of them pending at any moment; and now the
 * committee's single complete programme, which is what the first version
 * was waiting for. So the per-day machinery is gone rather than left
 * standing with one row in it — see src/data/downloads.ts.
 *
 * The line under the download is not filler. The PDF is 3.1 MB and this
 * page is precached while the file deliberately is not, so a reader on
 * campground signal needs to know the same programme is already on the
 * site and already works offline.
 */
export default function DownloadsPage() {
  return (
    <>
      <PageHeader {...downloadsPage} />

      <Band>
        <Reveal className="prose-column">
          <section
            aria-labelledby="printed-programme"
            className="flex flex-col gap-(--space-item)"
          >
            <h2
              id="printed-programme"
              className="text-2xl font-semibold text-ink"
            >
              The printed programme
            </h2>
            <ProgrammeDownload />
            <p className="text-ink-muted">
              The same programme is on this site day by day, and it works
              offline once you have opened it.{" "}
              <Link
                href="/schedule"
                className="underline underline-offset-4 transition-colors duration-fast hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
              >
                Read it online
              </Link>
              .
            </p>
          </section>
        </Reveal>
      </Band>
    </>
  );
}
