import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { DOWNLOADS_DIR, dailyProgrammeFor, program } from "@/data";
import { dayPath } from "@/features/schedule/lib/url";
import { formatSize, probePdf } from "../pdf-file";

/**
 * Eight rows, always — one per day of the programme, in programme order.
 *
 * ── WHY THE WHOLE WEEK IS RENDERED AND NOT ONLY WHAT EXISTS ──────────
 *
 * The daily sheets arrive one at a time across the week. A list that
 * showed only the days already printed would grow from one row to eight
 * with no indication that the other seven were coming, so the first
 * visitor would reasonably conclude that one sheet is all there is. The
 * livestream archive settled this question already — it lays out its
 * sixteen slots whether or not the recordings are posted — and this is the
 * same shape of problem, so it gets the same answer rather than a second
 * convention.
 *
 * The week comes from `program`, not from a list kept here, so a day
 * cannot go missing from the downloads page while existing in the
 * schedule. src/data/downloads.ts names only the files that have shipped;
 * everything else on the row is derived from the programme day itself.
 *
 * The pending row is deliberately NOT a link and NOT a disabled button.
 * There is nothing to go to, and a control that looks operable and does
 * nothing is worse than plain text — a keyboard user tabs onto it and
 * finds it inert. So it is a paragraph in a dashed frame, out of the tab
 * order, which is what "not yet available" actually means.
 */
export function DailyProgrammeList() {
  return (
    <ol className="flex flex-col gap-3">
      {program.map((day, index) => {
        const dayNumber = index + 1;
        const entry = dailyProgrammeFor(day.id);
        // Two conditions, not one: the day has to be listed in the data
        // AND the file has to be on disk. Listing a day whose PDF was not
        // committed would otherwise ship a link to a 404.
        const pdf = entry
          ? probePdf(`${DOWNLOADS_DIR}/${entry.file}`)
          : undefined;

        return (
          <li key={day.id}>
            {pdf ? (
              <a
                href={pdf.href}
                download
                className="flex items-center gap-4 rounded-card bg-surface p-4 ring-1 ring-line transition-colors duration-fast hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
              >
                <FileText
                  aria-hidden
                  className="size-8 shrink-0 text-ink-muted"
                />
                <span className="flex-1">
                  <span className="block font-medium text-ink">
                    <span className="tabular-figures text-ink-muted">
                      Day {dayNumber}
                    </span>
                    {" · "}
                    {day.displayLabel}
                  </span>
                  <span className="block text-sm text-ink-muted">
                    PDF, {formatSize(pdf.size)}
                  </span>
                </span>
                <Download
                  aria-hidden
                  className="size-5 shrink-0 text-ink-muted"
                />
              </a>
            ) : (
              <div className="flex items-center gap-4 rounded-card border border-dashed border-line bg-surface-muted/60 p-4">
                <FileText
                  aria-hidden
                  className="size-8 shrink-0 text-ink-muted/50"
                />
                <p className="flex-1 text-ink-muted">
                  <span className="block font-medium">
                    <span className="tabular-figures">Day {dayNumber}</span>
                    {" · "}
                    {day.displayLabel}
                  </span>
                  <span className="block text-sm text-ink-muted/80">
                    Not yet available
                  </span>
                </p>
                {/* The day's programme is readable on the site whether or
                    not its sheet has been printed, so the row that cannot
                    offer a download offers the thing the download is a
                    copy of. */}
                <Link
                  href={dayPath(day.id)}
                  className="shrink-0 text-sm text-ink-muted underline underline-offset-4 transition-colors duration-fast hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
                >
                  Read it online
                  <span className="sr-only">, {day.displayLabel}</span>
                </Link>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
