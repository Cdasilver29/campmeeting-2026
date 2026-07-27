"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useBookmarks } from "../bookmarks";
import { scheduleHref, type ScheduleFilters } from "../lib/url";

const chipClasses =
  "inline-flex h-8 items-center rounded-control border px-3 text-sm font-medium whitespace-nowrap transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";

/**
 * Switch between the whole programme and the sessions this device has
 * saved. Links rather than buttons, so the view is part of the URL like
 * every other filter and the back button leaves it the way it found it.
 *
 * The count slot keeps its width whether or not there is a number in it,
 * so the chip does not resize when the saved count arrives after mount.
 */
export function ViewSwitch({ filters }: { filters: ScheduleFilters }) {
  const { count, ready, persistent } = useBookmarks();

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
          <span className="tabular-figures ml-1.5 inline-block min-w-4 text-center">
            {ready && count > 0 ? count : ""}
          </span>
        </Link>
      </div>

      {ready && !persistent ? (
        <p className="text-xs text-ink-muted">
          This browser is not allowing saved data, so your schedule will be
          forgotten when you close the tab.
        </p>
      ) : null}
    </div>
  );
}
