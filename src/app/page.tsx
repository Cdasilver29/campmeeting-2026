import type { Metadata } from "next";
import { Band } from "@/components/band";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { Hero } from "@/features/home/components/hero";
import { TodayView } from "@/features/schedule/components/today-view";
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
 * The hero (src/features/home/components/hero.tsx) is a server component:
 * the event name, dates and venue are fixed at build time. Only the
 * clock-dependent part below it, TodayView, ships as client JavaScript,
 * and the hero does not touch it — the countdown / live / archive states
 * are exactly as they were.
 *
 * No theme line in the hero on purpose. CLAUDE.md lists the August 2026
 * theme as unconfirmed, and the wording on the parent site belongs to a
 * different pastor and a February programme.
 *
 * The date range moved to src/lib/event-dates.ts when the Open Graph
 * images started needing the same string.
 */
export default function Home() {
  return (
    <>
      {/* The camp meeting itself, with one subEvent per programme day.
          Each day carries its own sessions on its own page. */}
      <JsonLd data={campMeetingEvent()} />

      {/* Full-bleed, so it sits outside the content column. */}
      <Hero />

      {/* One reveal for the whole clock-dependent block, not one per
          session inside it. */}
      {/*
        One band below the hero, not two or three.

        The photograph is already a full-bleed band, and it is the strongest
        surface change on the site — so the page has a boundary without
        needing one manufactured. Everything under it is TodayView, which is
        a single clock-dependent block whose internal sections change with
        the event phase and are painted client-side. Banding those would put
        a surface change on markup that is a skeleton on first paint, which
        is exactly the layout shift the hero's phase attribute exists to
        avoid.

        A second band here would have meant inventing content for it. It was
        not invented.
      */}
      <Band innerClassName="flex flex-col gap-(--space-item)">
        <Reveal className="flex flex-col gap-(--space-item)">
          <p className="text-sm text-ink-muted">
            All times are East Africa Time.
          </p>
          <TodayView />
        </Reveal>
      </Band>
    </>
  );
}
