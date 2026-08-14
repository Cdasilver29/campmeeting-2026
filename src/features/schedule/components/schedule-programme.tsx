import { Suspense } from "react";
import type { ProgramDay } from "@/data";
import { BookmarksProvider } from "../bookmarks";
import { scheduleScope } from "../lib/entries";
import { emptyFilters } from "../lib/url";
import { ScheduleBrowser } from "./schedule-browser";
import { ScheduleShell } from "./schedule-shell";

/**
 * The programme itself, for one day or for the whole week. Shared by
 * /schedule and /schedule/{day} so the two cannot drift apart.
 *
 * A server component, and the programme renders on the server too, as
 * the Suspense fallback below: the browser reads the query string with
 * useSearchParams, which forces its own subtree out of the static
 * render, so the fallback is what ends up in the prerendered HTML.
 * Making that fallback the real, unfiltered programme rather than a
 * skeleton means the static page carries every session in scope, the day
 * links work before hydration, and hydrating swaps like for like instead
 * of replacing placeholder boxes with content.
 */
export function ScheduleProgramme({ day }: { day?: ProgramDay }) {
  const scope = scheduleScope(day?.id);

  return (
    // Outside the boundary so the browser and the prerendered fallback
    // read the same saved set, and so the provider is not torn down and
    // remounted when the boundary resolves.
    <BookmarksProvider>
      <Suspense
        fallback={
          <ScheduleShell
            filters={{ ...emptyFilters, day: day?.id }}
            groups={scope.groups}
            count={scope.total}
            total={scope.total}
            share={Boolean(day)}
          />
        }
      >
        <ScheduleBrowser day={day?.id} />
      </Suspense>
    </BookmarksProvider>
  );
}
