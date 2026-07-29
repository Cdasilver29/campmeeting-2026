import { eventInfo } from "@/data";

/**
 * "15 to 22 August 2026" — the run of the camp meeting, read from
 * eventInfo rather than typed out anywhere.
 *
 * Shared by the home page hero and the generated Open Graph images
 * (src/lib/og.tsx) so a preview card and the page it links to cannot
 * disagree about the dates. Formatted in UTC on purpose: the dates are
 * calendar dates, not instants, and formatting them in the viewer's zone
 * would move them by a day either side of the date line.
 */
export function eventDateRange(): string {
  const start = new Date(`${eventInfo.startDate}T00:00:00Z`);
  const end = new Date(`${eventInfo.endDate}T00:00:00Z`);
  const format = (date: Date, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...options }).format(
      date,
    );

  return `${format(start, { day: "numeric" })} to ${format(end, {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}
