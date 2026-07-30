import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { Band } from "@/components/band";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { pageMetadata } from "@/lib/metadata";
import { downloadsPage } from "@/lib/page-identity";
import { ACTION_LINK } from "@/lib/link-styles";

export const metadata = pageMetadata(downloadsPage);

/** Where the committee's signed-off programme PDF is expected to land. */
const PROGRAM_PDF_PATH = "/downloads/camp-meeting-2026-programme.pdf";

function formatSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Checked at build time, since the whole site is statically generated:
 * the file either shipped in public/ before `pnpm build` ran, or it
 * didn't. Dropping the PDF into public/downloads/ and rebuilding is all
 * that is needed to turn this into a real download, no code change.
 */
function programPdf(): { size: number } | undefined {
  const filePath = path.join(process.cwd(), "public", PROGRAM_PDF_PATH);
  try {
    const stats = fs.statSync(filePath);
    return { size: stats.size };
  } catch {
    return undefined;
  }
}

export default function DownloadsPage() {
  const pdf = programPdf();

  return (
    <>
      <Band>
        <PageHeader {...downloadsPage} />
      </Band>

      <Band tone="muted">
      <Reveal className="prose-column">
      {pdf ? (
        <a
          href={PROGRAM_PDF_PATH}
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
    </>
  );
}
