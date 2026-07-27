import Link from "next/link";
import { CalendarX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { eventInfo, program } from "@/data";
import { SCHEDULE_PATH } from "@/features/schedule/lib/url";

const linkClasses =
  "inline-flex h-8 items-center rounded-control px-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";

/**
 * A /schedule/{day} URL for a day the programme does not have. Worth its
 * own page rather than the site-wide 404: the reader was after the
 * programme, and the whole programme is one link away.
 */
export default function ScheduleDayNotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
      <h1 className="font-display text-4xl text-balance">Day not found</h1>
      <EmptyState
        icon={CalendarX}
        title="That day is not in this programme"
        description={`${eventInfo.edition} runs for ${program.length} days, ${eventInfo.startDate} to ${eventInfo.endDate}. The link you followed points at a day outside it, or at one that has been renamed.`}
        action={
          <Link href={SCHEDULE_PATH} className={linkClasses}>
            See the full programme
          </Link>
        }
      />
    </div>
  );
}
