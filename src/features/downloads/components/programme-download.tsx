import { Download, FileText } from "lucide-react";
import { program, programmePdfPath } from "@/data";
import { formatSize, probePdf } from "../pdf-file";

/**
 * One download: the printed programme, the whole week in one PDF.
 *
 * ── ONE ROW, AND NO PENDING STATE ────────────────────────────────────
 *
 * This replaced a list of eight day rows, seven of which were usually
 * dashed "Not yet available" frames waiting for a sheet the committee had
 * not printed yet. There is one file now and it exists, so the pending
 * state has nothing left to represent and is gone rather than kept for a
 * case that cannot occur.
 *
 * ── IF THE FILE IS NOT THERE, NOTHING IS DRAWN ───────────────────────
 *
 * `probePdf` returns undefined when `public/downloads/` does not have it,
 * and this returns null. Not a pending row: the old one was honest
 * because a day sheet genuinely was expected later that week, and this
 * one would be reporting a broken deploy to a reader who can do nothing
 * about it. The rest of the page still tells them the programme is on the
 * site. See src/app/downloads/page.tsx, which renders the online-reading
 * line whether or not the PDF probes.
 *
 * The day count comes from `program` rather than the word "eight", so it
 * cannot drift from the schedule the file is a copy of.
 */
export function ProgrammeDownload() {
  const pdf = probePdf(programmePdfPath);
  if (!pdf) return null;

  return (
    <a
      href={pdf.href}
      download
      className="flex items-center gap-4 rounded-card bg-surface p-4 ring-1 ring-line transition-colors duration-fast hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
    >
      <FileText aria-hidden className="size-8 shrink-0 text-ink-muted" />
      <span className="flex-1">
        <span className="block font-medium text-ink">
          Camp Meeting 2026 programme
        </span>
        <span className="block text-sm text-ink-muted">
          {/* The size is read off disk at build time and shown because a
              lot of this week's readers are on mobile data standing in
              the churchyard. */}
          PDF, {formatSize(pdf.size)} · the complete{" "}
          <span className="tabular-figures">{program.length}</span>-day
          programme
        </span>
      </span>
      <Download aria-hidden className="size-5 shrink-0 text-ink-muted" />
    </a>
  );
}
