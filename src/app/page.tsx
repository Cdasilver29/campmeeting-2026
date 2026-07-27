import { eventInfo } from "@/data";
import { TodayView } from "@/features/schedule/components/today-view";

/**
 * The hero is a server component: the event name, dates and venue are
 * fixed at build time. Only the clock-dependent part below it ships as
 * client JavaScript.
 *
 * No theme line here on purpose. CLAUDE.md lists the August 2026 theme
 * as unconfirmed, and the wording on the parent site belongs to a
 * different pastor and a February programme.
 */
function formatDateRange() {
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

export default function Home() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="text-sm tracking-wide text-ink-muted uppercase">
          {eventInfo.church.name}
        </p>
        <h1 className="font-display text-hero text-balance">
          {eventInfo.edition}
        </h1>
        <p className="text-lg text-ink-muted">
          {formatDateRange()} at {eventInfo.church.address}. All times are
          East Africa Time.
        </p>
      </header>

      <TodayView />
    </div>
  );
}
