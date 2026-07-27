"use client";

import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { eventInfo, program } from "@/data";
import { getTodayState, type TodayState } from "../lib/today";
import { scheduleHref } from "../lib/url";
import { useNow } from "../use-now";
import { Countdown } from "./countdown";
import { LiveDot } from "./live-dot";
import { presenterNames } from "../lib/presenters";

const heroClasses =
  "flex flex-col gap-4 rounded-card bg-surface-muted p-6 ring-1 ring-line";

const eyebrowClasses =
  "flex items-center gap-2 text-xs font-medium tracking-wide text-ink-muted uppercase";

const actionClasses =
  "w-fit rounded-control text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";

/**
 * Holds the hero's height before the clock resolves. Sized to the
 * countdown, which is the tallest of the three states and the one this
 * page will be in for every visit before 15 August.
 */
function HeroSkeleton() {
  return (
    <div className={heroClasses}>
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-24 w-full rounded-card" />
      <Skeleton className="h-4 w-72" />
    </div>
  );
}

function BeforeHero() {
  const first = program[0];

  return (
    <div className={heroClasses}>
      <p className={eyebrowClasses}>
        {first ? `Programme opens ${first.displayLabel}` : "Programme opens soon"}
      </p>
      <Countdown />
      {first ? (
        <Link
          href={scheduleHref({ day: first.id })}
          scroll={false}
          className={actionClasses}
        >
          See the opening day
        </Link>
      ) : null}
    </div>
  );
}

/** One line saying what is on, what is next, or that the day is done. */
function CurrentLine({ state }: { state: TodayState }) {
  if (state.current?.kind === "session") {
    const { session } = state.current;
    const presenters = presenterNames(session);
    return (
      <p className="text-sm text-ink-muted">
        On now: <span className="text-ink">{session.title}</span>
        {session.start && session.end ? (
          <span className="tabular-figures">
            , {session.start} to {session.end}
          </span>
        ) : null}
        {presenters.length > 0 ? `, with ${presenters.join(", ")}` : null}
      </p>
    );
  }

  if (state.current?.kind === "all-block") {
    return (
      <p className="text-sm text-ink-muted">
        On now: <span className="text-ink">{state.current.activity.title}</span>,
        running through {state.current.block.label}.
      </p>
    );
  }

  if (state.next) {
    return (
      <p className="text-sm text-ink-muted">
        Next: <span className="text-ink">{state.next.title}</span>
        <span className="tabular-figures"> at {state.next.start}</span>.
      </p>
    );
  }

  return (
    <p className="text-sm text-ink-muted">
      The programme has finished for today.
    </p>
  );
}

function DuringHero({ state }: { state: TodayState }) {
  const index = program.findIndex((day) => day.id === state.day?.id);
  const dayNumber = index >= 0 ? index + 1 : undefined;

  return (
    <div className={heroClasses}>
      <p className={eyebrowClasses}>
        <LiveDot />
        Live now
      </p>
      <p className="font-display text-2xl text-ink">
        {state.day?.displayLabel ?? eventInfo.edition}
        {dayNumber ? (
          <span className="text-ink-muted">
            , day {dayNumber} of {program.length}
          </span>
        ) : null}
      </p>
      <CurrentLine state={state} />
      {state.day ? (
        <Link
          href={scheduleHref({ day: state.day.id })}
          scroll={false}
          className={actionClasses}
        >
          See today in the programme
        </Link>
      ) : null}
    </div>
  );
}

function AfterHero() {
  return (
    <div className={heroClasses}>
      <p className={eyebrowClasses}>
        <CalendarCheck aria-hidden className="size-3.5" />
        Archive
      </p>
      <p className="font-display text-2xl text-ink">
        {eventInfo.edition} has ended
      </p>
      <p className="text-sm text-ink-muted">
        The programme below is the one that ran, kept as a record. Recordings
        and notices from the week stay on the announcements page.
      </p>
      <Link href="/announcements" className={actionClasses}>
        Read the announcements
      </Link>
    </div>
  );
}

/**
 * The hero at the top of the programme: counting down before 15 August,
 * live during the week, an archive note afterwards.
 *
 * Clock-dependent, so it cannot be part of the static render. The page
 * around it is prerendered and this one block resolves on mount, holding
 * its height with a skeleton so nothing below it moves. Phase and
 * current session come from getTodayState, which reads Africa/Nairobi
 * wall-clock, so a viewer in another country sees the campground's day
 * rather than their own.
 */
export function ScheduleHero() {
  const now = useNow();
  if (!now) return <HeroSkeleton />;

  const state = getTodayState(now);
  if (state.phase === "before") return <BeforeHero />;
  if (state.phase === "after") return <AfterHero />;
  return <DuringHero state={state} />;
}
