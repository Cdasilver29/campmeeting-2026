"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useBookmarks } from "../bookmarks";
import { scheduleHref, type ScheduleFilters } from "../lib/url";
import { ShareSchedule } from "./share-schedule";

const chipClasses =
  "inline-flex min-h-11 items-center rounded-control border px-3 lg:h-8 lg:min-h-0 text-sm font-medium whitespace-nowrap transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";

/**
 * Switch between the whole programme and the sessions this device has
 * saved. Links rather than buttons, so the view is part of the URL like
 * every other filter and the back button leaves it the way it found it.
 *
 * The count slot keeps its width whether or not there is a number in it,
 * so the chip does not resize when the saved count arrives after mount.
 * 1.5rem holds "(9)" in tabular figures; past that the chip grows, which
 * is the same tolerance the bare digit already had at two digits.
 *
 * This row is also where the two things that can be said about the saved
 * set live: that a shared link just added to it, and that this browser
 * will not keep it past the tab.
 */
export function ViewSwitch({ filters }: { filters: ScheduleFilters }) {
  const { count, ready, persistent, importedCount } = useBookmarks();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={scheduleHref({ ...filters, mine: false })}
          scroll={false}
          aria-current={filters.mine ? undefined : "true"}
          className={cn(
            chipClasses,
            filters.mine
              ? "border-line text-ink-muted hover:bg-surface-muted hover:text-ink"
              : "border-primary bg-primary text-primary-foreground",
          )}
        >
          Whole programme
        </Link>
        <Link
          href={scheduleHref({ ...filters, mine: true })}
          scroll={false}
          aria-current={filters.mine ? "true" : undefined}
          className={cn(
            chipClasses,
            filters.mine
              ? "border-primary bg-primary text-primary-foreground"
              : "border-line text-ink-muted hover:bg-surface-muted hover:text-ink",
          )}
        >
          My schedule
          {/*
            The count is the cheapest explanation the feature has: it says
            the thing exists, it says how big it is, and after a save it is
            the confirmation that the save landed. Parenthesised, because
            "My schedule 6" reads as a label with a stray number in it.

            aria-hidden with a written equivalent beside it, so a screen
            reader hears "My schedule, 6 saved sessions" rather than the
            bare digit, which carries no unit.
          */}
          <span
            aria-hidden
            className="tabular-figures ml-1.5 inline-block min-w-6 text-center"
          >
            {ready && count > 0 ? `(${count})` : ""}
          </span>
          {ready && count > 0 ? (
            <span className="sr-only">
              , {count} saved {count === 1 ? "session" : "sessions"}
            </span>
          ) : null}
        </Link>

        {/* Only on the view it acts on, and gated on the URL rather than
            on the saved count, so it is in the static HTML and cannot
            push the programme down by wrapping onto a new line after
            mount. See share-schedule.tsx for why it is disabled rather
            than absent at zero. */}
        {filters.mine ? <ShareSchedule /> : null}
      </div>

      {ready && importedCount > 0 ? (
        <p role="status" className="text-xs text-ink-muted">
          Added{" "}
          {importedCount === 1
            ? "1 session"
            : `${importedCount} sessions`}{" "}
          from a shared link. Nothing you had already saved was removed.
        </p>
      ) : null}

      {ready && !persistent ? (
        <p className="text-xs text-ink-muted">
          This browser is not allowing saved data, so your schedule will be
          forgotten when you close the tab.
        </p>
      ) : null}
    </div>
  );
}
