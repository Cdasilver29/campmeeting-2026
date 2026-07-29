import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { eventInfo } from "@/data";
import { TodayView } from "@/features/schedule/components/today-view";
import { eventDateRange } from "@/lib/event-dates";
import { campMeetingEvent } from "@/lib/structured-data";

/**
 * Title and description are inherited from the root layout: this is the
 * site's front page, so the site's own name is the right title. Only the
 * canonical is its own.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * The hero is a server component: the event name, dates and venue are
 * fixed at build time. Only the clock-dependent part below it ships as
 * client JavaScript.
 *
 * No theme line here on purpose. CLAUDE.md lists the August 2026 theme
 * as unconfirmed, and the wording on the parent site belongs to a
 * different pastor and a February programme.
 *
 * The date range moved to src/lib/event-dates.ts when the Open Graph
 * images started needing the same string.
 */
export default function Home() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-16">
      {/* The camp meeting itself, with one subEvent per programme day.
          Each day carries its own sessions on its own page. */}
      <JsonLd data={campMeetingEvent()} />

      <header className="flex flex-col gap-3">
        <p className="text-sm tracking-wide text-ink-muted uppercase">
          {eventInfo.church.name}
        </p>
        <h1 className="font-display text-hero text-balance">
          {eventInfo.edition}
        </h1>
        <p className="text-lg text-ink-muted">
          {eventDateRange()} at {eventInfo.church.address}. All times are
          East Africa Time.
        </p>
      </header>

      <TodayView />
    </div>
  );
}
