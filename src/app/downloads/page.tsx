import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { eventInfo } from "@/data";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Downloads",
  description: `The printed programme PDF for ${eventInfo.edition}.`,
  path: "/downloads",
});

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
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-4xl text-balance">Downloads</h1>
        <p className="text-lg text-ink-muted">
          The printed programme for {eventInfo.edition}.
        </p>
      </header>

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
              className="inline-flex h-8 items-center rounded-control px-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
            >
              See the full programme online
            </Link>
          }
        />
      )}
    </div>
  );
}
