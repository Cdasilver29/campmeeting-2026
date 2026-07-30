"use client";

import Link from "next/link";
import { CalendarCheck, CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { eventInfo, getDayByDate, type FlatSession } from "@/data";
import { getTodayState, type TodayState } from "../lib/today";
import { useNow } from "../use-now";
import { Countdown } from "./countdown";
import { NowCard } from "./now-card";
import {
  ENTRY_GRID,
  MinistryChip,
  PresenterChips,
  SessionCard,
  TimeRange,
} from "./session-card";

const sectionHeading =
  "font-display text-2xl text-ink";

/** Shown in place of the now card when nothing is running but the day is not over. */
function BetweenCard({ next }: { next?: FlatSession }) {
  return (
    <section
      aria-labelledby="now-heading"
      className="flex flex-col gap-2 rounded-card border border-dashed border-line p-4"
    >
      <h2 id="now-heading" className={sectionHeading}>
        Nothing on right now
      </h2>
      <p className="text-sm text-ink-muted">
        {next
          ? "There is a break in the programme. The next session is below."
          : "The programme has finished for today."}
      </p>
    </section>
  );
}

function NextUpCard({ next, todayDate }: { next: FlatSession; todayDate: string }) {
  const day = getDayByDate(next.date);
  const isToday = next.date === todayDate;

  return (
    <section aria-labelledby="next-heading" className="flex flex-col gap-3">
      <h2 id="next-heading" className={sectionHeading}>
        Next up
      </h2>
      {/* Same grid as SessionCard, so "Next up" and the timeline under it
          share one time column rather than each inventing a layout. */}
      <article className={`${ENTRY_GRID} rounded-card bg-surface p-4 ring-1 ring-line`}>
        <span className="flex min-h-6 items-center sm:col-start-1 sm:row-start-1">
          <TimeRange start={next.start} end={next.end} />
        </span>
        <span className="text-xs tracking-wide text-ink-muted uppercase">
          {isToday ? next.blockLabel : (day?.displayLabel ?? next.date)}
        </span>
        <h3 className="text-base leading-6 font-semibold text-ink">
          {next.title}
        </h3>
        <PresenterChips session={next} />
        <MinistryChip session={next} />
      </article>
    </section>
  );
}

function RemainingTimeline({ state }: { state: TodayState }) {
  if (!state.day || state.remaining.length === 0) return null;

  return (
    <section aria-labelledby="timeline-heading" className="flex flex-col gap-3">
      <h2 id="timeline-heading" className={sectionHeading}>
        Rest of {state.day.displayLabel}
      </h2>
      <ol className="flex flex-col gap-3">
        {state.remaining.map((session) => (
          <li key={session.id}>
            <SessionCard session={session} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function BeforeEvent({ state }: { state: TodayState }) {
  return (
    <>
      <section aria-labelledby="countdown-heading" className="flex flex-col gap-3">
        <h2 id="countdown-heading" className={sectionHeading}>
          Counting down
        </h2>
        <Countdown />
      </section>
      {state.next ? (
        <NextUpCard next={state.next} todayDate={state.now.date} />
      ) : null}
    </>
  );
}

function AfterEvent() {
  return (
    <EmptyState
      icon={CalendarCheck}
      title={`${eventInfo.edition} has ended`}
      description={`The programme ran from ${eventInfo.startDate} to ${eventInfo.endDate}. Recordings and notices from the week stay available on the announcements and downloads pages.`}
      action={
        <Link
          href="/announcements"
          className="rounded-control text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          Read the announcements
        </Link>
      }
    />
  );
}

function DuringEvent({ state }: { state: TodayState }) {
  if (!state.dayHasContent) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Nothing scheduled today"
        description="No sessions or activities are published for today. Check the announcements page for changes."
      />
    );
  }

  return (
    <>
      {state.current ? (
        <NowCard current={state.current} />
      ) : (
        <BetweenCard next={state.next} />
      )}
      {state.next ? (
        <NextUpCard next={state.next} todayDate={state.now.date} />
      ) : null}
      <RemainingTimeline state={state} />
    </>
  );
}

/** Reserves the space the live sections will take, so mounting shifts nothing. */
function TodaySkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full rounded-card" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-28 w-full rounded-card" />
    </div>
  );
}

export function TodayView() {
  const now = useNow();

  // Statically generated markup cannot know the viewer's clock, so the
  // first paint is a placeholder and everything below resolves on mount.
  if (!now) return <TodaySkeleton />;

  const state = getTodayState(now);

  return (
    <div className="flex flex-col gap-10">
      {state.phase === "before" ? <BeforeEvent state={state} /> : null}
      {state.phase === "during" ? <DuringEvent state={state} /> : null}
      {state.phase === "after" ? <AfterEvent /> : null}
    </div>
  );
}
