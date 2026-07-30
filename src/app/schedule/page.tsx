import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { ScheduleProgramme } from "@/features/schedule/components/schedule-programme";
import { pageMetadata } from "@/lib/metadata";
import { schedulePage } from "@/lib/page-identity";

export const metadata = pageMetadata(schedulePage);

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
    <>
      {/* The header is its own band so the programme below starts on the
          page surface the sticky day rail is painted in. Two bands, not
          three: the programme is one thing, 27,000px of it, and striping
          it would be the decoration this site does not do. */}
      <Band tone="muted">
        <PageHeader {...schedulePage} />
      </Band>

      <Band>
        <ScheduleProgramme />
      </Band>
    </>
  );
}
