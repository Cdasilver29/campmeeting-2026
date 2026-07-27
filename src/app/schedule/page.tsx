import { Suspense } from "react";
import type { Metadata } from "next";
import { eventInfo, program } from "@/data";
import { BookmarksProvider } from "@/features/schedule/bookmarks";
import { ScheduleBrowser } from "@/features/schedule/components/schedule-browser";
import { ScheduleHero } from "@/features/schedule/components/schedule-hero";
import { ScheduleShell } from "@/features/schedule/components/schedule-shell";
import { allDayGroups, totalEntryCount } from "@/features/schedule/lib/entries";
import { emptyFilters } from "@/features/schedule/lib/url";

export const metadata: Metadata = {
  title: `Full programme | ${eventInfo.edition}`,
  description: `Every session of ${eventInfo.edition} across all ${program.length} days, ${eventInfo.startDate} to ${eventInfo.endDate} at ${eventInfo.church.address}.`,
};

/**
 * The full programme.
 *
 * The page shell is a server component and the programme itself renders
 * on the server too, as the Suspense fallback below: the browser reads
 * the query string with useSearchParams, which forces its own subtree
 * out of the static render, so the fallback is what ends up in the
 * prerendered HTML. Making that fallback the real, unfiltered programme
 * rather than a skeleton means the static page carries every session,
 * the day links work before hydration, and hydrating swaps like for
 * like instead of replacing placeholder boxes with content.
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

      <ScheduleHero />

      {/* Outside the boundary so the browser and the prerendered
          fallback read the same saved set, and so the provider is not
          torn down and remounted when the boundary resolves. */}
      <BookmarksProvider>
        <Suspense fallback={<StaticProgramme />}>
          <ScheduleBrowser />
        </Suspense>
      </BookmarksProvider>
    </div>
  );
}

function StaticProgramme() {
  return (
    <ScheduleShell
      filters={emptyFilters}
      groups={allDayGroups}
      count={totalEntryCount}
    />
  );
}
