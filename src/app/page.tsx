import type { Metadata } from "next";
import { Band } from "@/components/band";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { SectionWave } from "@/components/section-wave";
import { Hero } from "@/features/home/components/hero";
import { HomeArchive } from "@/features/home/components/home-archive";
import { SeniorWelcome } from "@/features/home/components/senior-welcome";
import { BookmarksProvider } from "@/features/schedule/bookmarks";
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

      {/* The same divider the thirteen header bands carry, which is the
          whole point of it — the home page's hero and an interior page's
          band close the same way, so it reads as one system rather than
          as an effect on one screen.

          Written out here rather than emitted by Hero, because the hero
          is not a PageHeader and the two share no component. Outside the
          hero element for the same reason it is outside the bands: the
          hero's own scrim alpha was derived by measuring the brightest
          pixel behind its type (tools/perf/verify-hero.mjs), and nothing
          painted below it can reach that measurement. */}
      <SectionWave />

      {/* ── THE ARCHIVE ────────────────────────────────────────────────
          Directly under the hero, above the clock-dependent block, and
          phase-aware: the full showcase in the `after` phase, one line in
          `before`, nothing at all `during`. All of it is in the HTML with
          one attribute deciding, so no part of it appears or disappears
          after first paint — see the note in home-archive.tsx.

          Its own band on the page surface. Not `tone="muted"`, for the
          same reason SeniorWelcome below is not: the cards inside it are
          `bg-surface-muted`, and a muted band would paint them the same
          colour as their own ground and leave them edgeless.

          One Reveal for the section, which is the site's rule: sections
          only, never per item. */}
      <Band>
        <Reveal>
          <HomeArchive />
        </Reveal>
      </Band>

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
          {/* The saved sessions, so the Today view can say that something
              the reader chose is about to start. Mid camp meeting that is
              the most useful sentence this site has. The provider reads
              localStorage after mount and renders nothing of its own, so
              the page stays statically generated and the card is simply
              absent when nothing saved is still ahead. */}
          <BookmarksProvider>
            <TodayView />
          </BookmarksProvider>
        </Reveal>
      </Band>

      {/* ── THE SENIOR PASTOR'S WELCOME ────────────────────────────────
          Its own band, below the whole clock-driven block rather than
          inside it. TodayView paints a skeleton on first frame and
          reorders itself by event phase; a section inside it would join
          that mount and would have to be reserved for in the skeleton.
          Out here on a statically generated page it is in the first
          paint, cannot move the live card or Next Up, and adds nothing
          to this page's CLS.

          NOT `tone="muted"`, which was the first instinct and is wrong
          for one concrete reason: UPCOMING_CARD — the surface Next Up
          and On Duty share, and which this card takes to be their
          sibling — IS `bg-surface-muted`. A muted band under it would
          have painted the card the same colour as its own ground and
          left it edgeless. The band keeps the page surface, the card
          keeps its muted fill, and the family reads as one.

          One Reveal for the section, which is the site's rule: sections
          only, never per item. No new animation. */}
      <Band>
        <Reveal>
          <SeniorWelcome hostId="gerald-mochoge" />
        </Reveal>
      </Band>
    </>
  );
}
