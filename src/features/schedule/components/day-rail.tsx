import Link from "next/link";
import { program } from "@/data";
import { cn } from "@/lib/utils";
import { scheduleHref, type ScheduleFilters } from "../lib/url";

/** "15" — the day of the month, which is what disambiguates the two Sabbaths. */
function dayOfMonth(date: string): number {
  return Number(date.slice(8, 10));
}

/**
 * Day selector for the programme.
 *
 * Each day is its own page, so these are plain links: they work with
 * JavaScript still loading, open in a new tab, and carry the day's own
 * title into anything they are pasted into. Every active filter rides
 * along in the query string, so picking a day narrows a filtered view
 * instead of resetting it.
 *
 * Each tile says three things, in the order they are useful: which day of
 * the week it is, which date that is, and where it falls in the week. The
 * old rail said "Sabbath 15" on one line and left the reader to work out
 * that it was the first of eight.
 */
export function DayRail({ filters }: { filters: ScheduleFilters }) {
  return (
    <nav
      aria-label="Programme days"
      // Sticky under the site header, so the day you are reading is always
      // one tap from any other day rather than a scroll back to the top of
      // a 34,000px page. top-header is the same token the header sets its
      // own height from, so the two cannot drift apart. The background is
      // opaque because the programme scrolls underneath it.
      // shell-bleed rather than a hardcoded -mx-6/px-6 pair: the gutter is
      // now one variable that steps at md and lg, so a literal 6 here
      // would leave the rail's bar out of step with its own page from the
      // first breakpoint onward.
      className="shell-bleed sticky top-header z-30 border-b border-line bg-surface py-2"
    >
      <ul className="flex gap-2 overflow-x-auto pb-1">
        <li>
          <Link
            href={scheduleHref({ ...filters, day: undefined })}
            aria-current={filters.day === undefined ? "page" : undefined}
            className={cn(TILE, filters.day === undefined ? TILE_ON : TILE_OFF)}
          >
            <span className="text-xs tracking-wide uppercase">All</span>
            <span className="text-sm font-semibold">days</span>
          </Link>
        </li>

        {program.map((day, index) => {
          const active = filters.day === day.id;
          return (
            <li key={day.id}>
              <Link
                href={scheduleHref({ ...filters, day: day.id })}
                aria-current={active ? "page" : undefined}
                className={cn(TILE, active ? TILE_ON : TILE_OFF)}
              >
                {/* Day number first and quietest: it orients, it is not
                    what anyone is looking for. */}
                <span className="text-xs tracking-wide uppercase">
                  Day {index + 1}
                </span>
                <span className="text-sm font-semibold">{day.dayLabel}</span>
                <span className="tabular-figures text-xs">
                  {dayOfMonth(day.date)} Aug
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/*
 * Colour and a 1px lift on hover, both on the shared --duration-fast /
 * --ease-out-soft pair. Deliberately CSS, not JS: this rail sits on
 * /schedule, where the motion budget goes to nothing but the essentials.
 */
const TILE =
  "flex min-w-16 flex-col items-start gap-0.5 rounded-control border px-2.5 py-2 whitespace-nowrap transition-[color,background-color,border-color,translate] duration-fast ease-out-soft hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";

/* The current day is distinguished by fill, weight and border together,
   never by colour alone: aria-current="page" says the same thing to a
   screen reader, and the filled tile is legible in greyscale. */
const TILE_ON = "border-primary bg-primary text-primary-foreground";
const TILE_OFF =
  "border-line text-ink-muted hover:bg-surface-muted hover:text-ink";
