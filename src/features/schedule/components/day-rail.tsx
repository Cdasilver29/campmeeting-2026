import Link from "next/link";
import { program } from "@/data";
import { cn } from "@/lib/utils";
import { scheduleHref, type ScheduleFilters } from "../lib/url";

/** "Sabbath 15" — the day of the month disambiguates the two Sabbaths. */
function shortLabel(dayLabel: string, date: string): string {
  return `${dayLabel} ${Number(date.slice(8, 10))}`;
}

/**
 * Day selector for the full programme. Real links rather than buttons:
 * every day is a shareable URL, they work with JavaScript still loading,
 * and they can be opened in a new tab. Every other active filter rides
 * along, so picking a day narrows a filtered view instead of resetting it.
 */
export function DayRail({ filters }: { filters: ScheduleFilters }) {
  const options = [
    { id: undefined, label: "All days" },
    ...program.map((day) => ({
      id: day.id,
      label: shortLabel(day.dayLabel, day.date),
    })),
  ];

  return (
    <nav
      aria-label="Programme days"
      // Bleeds to the viewport edge so the last chip is reachable by
      // swipe on a phone without a cramped inset scroll area.
      className="-mx-6 overflow-x-auto px-6 pb-1"
    >
      <ul className="flex w-max gap-2">
        {options.map((option) => {
          const active = filters.day === option.id;
          return (
            <li key={option.id ?? "all"}>
              <Link
                href={scheduleHref({ ...filters, day: option.id })}
                scroll={false}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "inline-flex h-8 items-center rounded-control border px-3 text-sm font-medium whitespace-nowrap transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-line text-ink-muted hover:bg-surface-muted hover:text-ink",
                )}
              >
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
