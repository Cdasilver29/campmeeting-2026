import Link from "next/link";
import { program } from "@/data";
import { cn } from "@/lib/utils";
import { scheduleHref, type ScheduleFilters } from "../lib/url";
import { DayRailBehaviour, RAIL_ID, RAIL_SCROLLER_ID } from "./day-rail-behaviour";

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
 * the week it is, which date that is, and where it falls in the week.
 *
 * TWO LAYOUTS, AND WHY
 *
 * Below md the rail scrolls, and that is now a deliberate design rather
 * than an overflow: scroll-snap per tile, a mask that fades whichever edge
 * has more content behind it, and the selected day scrolled into view on
 * load. A phone cannot show nine tiles and pretending otherwise would mean
 * shrinking them below a 44px target.
 *
 * From md it is a nine-column grid and nothing scrolls. It used to be
 * `flex gap-2 overflow-x-auto` at every width inside a 768px column, so on
 * a 1920px screen the rail still scrolled and the closing Sabbath was
 * clipped off the right-hand end — a navigation control hiding the day
 * most readers were looking for.
 *
 * Nine equal columns at md means 704px / 9, about 72px a tile, and
 * "Wednesday" does not fit in that at 14px semibold. So the weekday is
 * abbreviated between md and lg and written out again from lg, where the
 * column is 944px and there is room. Two spans per tile, eighteen elements
 * in total — this is navigation, not the 237-entry programme, and the
 * per-row rules do not apply to it.
 */
export function DayRail({ filters }: { filters: ScheduleFilters }) {
  return (
    <nav
      id={RAIL_ID}
      aria-label="Programme days"
      // Sticky under the site header. The offset is --rail-top, which
      // DayRailBehaviour sets from the header's measured height and which
      // falls back to the --spacing-header token the header declares
      // itself from, so the two cannot drift apart and nothing depends on
      // a number written twice.
      //
      // shell-bleed rather than a hardcoded -mx-6/px-6 pair: the gutter is
      // one variable that steps at md and lg now.
      className="shell-bleed sticky top-[var(--rail-top,var(--spacing-header))] z-30 border-b border-line bg-surface py-2"
    >
      <ul
        id={RAIL_SCROLLER_ID}
        // Below md: a snapping scroller with an edge mask driven by
        // data-overflow, which DayRailBehaviour keeps in step with the
        // scroll position so the fade only appears on a side that has
        // something behind it. From md: nine equal columns, no scrolling,
        // no mask.
        data-overflow="none"
        className={cn(
          "flex gap-2 overflow-x-auto pb-1",
          "snap-x snap-mandatory scroll-px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "rail-fade",
          "md:grid md:grid-cols-9 md:gap-1.5 md:overflow-visible md:pb-0 md:[mask-image:none]",
          "lg:gap-2",
        )}
      >
        <li className="snap-start">
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
            <li key={day.id} className="snap-start">
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
                {/* The full weekday everywhere there is room for it, and a
                    three-letter form only in the md-to-lg window where
                    there is not. Both are in the DOM; a screen reader
                    reads the visible one, and aria-current says which day
                    is selected independently of either. */}
                <span className="text-sm font-semibold">
                  <span className="md:hidden lg:inline">{day.dayLabel}</span>
                  <span
                    aria-hidden
                    className="hidden md:inline lg:hidden"
                  >
                    {day.dayLabel.slice(0, 3)}
                  </span>
                </span>
                <span className="tabular-figures text-xs">
                  {dayOfMonth(day.date)} Aug
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <DayRailBehaviour />
    </nav>
  );
}

/*
 * Colour, a 1px lift on hover and a pressed state, all on the shared
 * --duration-fast / --ease-out-soft pair. Deliberately CSS, not JS: this
 * rail sits on /schedule, where the motion budget goes to nothing but the
 * essentials.
 *
 * min-h-11 is 44px, the tap-target floor, and it is what stops the tiles
 * being shrunk to fit at md. w-full so a grid cell's tile fills its
 * column rather than sitting left in it.
 */
const TILE =
  "flex min-h-11 w-full min-w-16 flex-col items-start justify-center gap-0.5 rounded-control border px-2.5 py-1.5 whitespace-nowrap transition-[color,background-color,border-color,translate] duration-fast ease-out-soft hover:-translate-y-px active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 md:min-w-0 md:items-center md:px-1.5 lg:items-start lg:px-2.5";

/* The current day is distinguished by fill, weight and border together,
   never by colour alone: aria-current="page" says the same thing to a
   screen reader, and the filled tile is legible in greyscale. */
const TILE_ON = "border-primary bg-primary text-primary-foreground";

/* data-in-view is written by day-rail-behaviour.tsx as the reader scrolls
   the whole programme. It is a quieter mark than the selected state and
   made of three things at once — border, fill and weight — so it does not
   depend on telling one blue from another. On a single day's page there is
   only one section and the attribute is never set. */
const TILE_OFF =
  "border-line text-ink-muted hover:border-ink-muted/40 hover:bg-surface-muted hover:text-ink data-[in-view=true]:border-primary/50 data-[in-view=true]:bg-primary/10 data-[in-view=true]:font-medium data-[in-view=true]:text-ink";
