import { eventInfo, program } from "@/data";
import { ScheduleProgramme } from "@/features/schedule/components/schedule-programme";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Full programme",
  description: `Every session of ${eventInfo.edition} across all ${program.length} days, ${eventInfo.startDate} to ${eventInfo.endDate} at ${eventInfo.church.address}. Times are East Africa Time.`,
  path: "/schedule",
});

/**
 * The full programme, all days at once. Individual days are pages of
 * their own at /schedule/{day}.
 *
 * Deliberately clock-free. The countdown, live and archive states live on
 * the Today view at "/", which is the page a reader opens to ask what is
 * happening now; repeating them here would make an otherwise entirely
 * static reference page depend on the clock, push the programme itself
 * below the fold on a phone, and shift the layout on mount during the
 * event, since the live and archive states are shorter than the countdown
 * the placeholder has to be sized for.
 */
export default function SchedulePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-4xl text-balance">Full programme</h1>
        <p className="text-lg text-ink-muted">
          All {program.length} days of {eventInfo.edition}, as printed. Times
          are East Africa Time.
        </p>
      </header>

      <ScheduleProgramme />
    </div>
  );
}
