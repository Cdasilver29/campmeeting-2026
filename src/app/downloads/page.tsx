import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { DailyProgrammeList } from "@/features/downloads/components/daily-programme-list";
import { pageMetadata } from "@/lib/metadata";
import { downloadsPage } from "@/lib/page-identity";

export const metadata = pageMetadata(downloadsPage);

/**
 * The daily sheets are the whole page.
 *
 * There used to be a full-programme booklet entry above them, which never
 * shipped a file and so always rendered as "coming soon". Once day 1's
 * sheet was live that card was telling a reader the page was unfinished
 * directly above eight rows that were doing the job — and the daily sheets
 * ARE the printed programme, published a day at a time. The seven days
 * still to come carry their own pending state, which is the honest one.
 */
export default function DownloadsPage() {
  return (
    <>
      <PageHeader {...downloadsPage} />

      <Band>
        <Reveal className="prose-column">
          <section
            aria-labelledby="daily-programmes"
            className="flex flex-col gap-(--space-item)"
          >
            <div className="flex flex-col gap-2">
              <h2
                id="daily-programmes"
                className="text-2xl font-semibold text-ink"
              >
                Daily programmes
              </h2>
              <p className="text-ink-muted">
                One sheet per day, published as each day is finalised. Days
                still to come are listed so you can see the shape of the week.
              </p>
            </div>
            <DailyProgrammeList />
          </section>
        </Reveal>
      </Band>
    </>
  );
}
