import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { Band } from "@/components/band";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { DailyProgrammeList } from "@/features/downloads/components/daily-programme-list";
import { formatSize, probePdf } from "@/features/downloads/pdf-file";
import { pageMetadata } from "@/lib/metadata";
import { downloadsPage } from "@/lib/page-identity";
import { ACTION_LINK } from "@/lib/link-styles";

export const metadata = pageMetadata(downloadsPage);

/** Where the committee's signed-off programme PDF is expected to land. */
const PROGRAM_PDF_PATH = "/downloads/camp-meeting-2026-programme.pdf";

/**
 * Two lists, deliberately kept apart.
 *
 * The full programme is the whole week in one booklet, signed off once.
 * The daily sheets are eight separate documents that arrive one a day and
 * carry the detail the booklet leaves out. They are different things with
 * different lifecycles, so folding the booklet into the daily list as a
 * ninth row would have made the list read as "nine days".
 *
 * Both use the same build-time probe in ../../features/downloads/pdf-file.
 */
export default function DownloadsPage() {
  const pdf = probePdf(PROGRAM_PDF_PATH);

  return (
    <>
      <PageHeader {...downloadsPage} />

      <Band>
      <Reveal className="prose-column">
      {pdf ? (
        <a
          href={pdf.href}
          download
          className="flex items-center gap-4 rounded-card bg-surface p-4 ring-1 ring-line transition-colors duration-fast hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          <FileText aria-hidden className="size-8 shrink-0 text-ink-muted" />
          <span className="flex-1">
            <span className="block font-medium text-ink">
              Camp Meeting 2026 programme (PDF)
            </span>
            <span className="block text-sm text-ink-muted">
              {formatSize(pdf.size)}
            </span>
          </span>
          <Download aria-hidden className="size-5 shrink-0 text-ink-muted" />
        </a>
      ) : (
        <EmptyState
          icon={FileText}
          title="Coming soon"
          description="The printed programme PDF has not been published yet. It will appear here once the organising committee signs off on the final draft."
          action={
            <Link
              href="/schedule"
              className={ACTION_LINK}
            >
              See the full programme online
            </Link>
          }
        />
      )}
      </Reveal>
      </Band>

      <Band tone="muted">
        <Reveal className="prose-column">
          <section aria-labelledby="daily-programmes" className="flex flex-col gap-(--space-item)">
            <div className="flex flex-col gap-2">
              <h2 id="daily-programmes" className="text-2xl font-semibold text-ink">
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
