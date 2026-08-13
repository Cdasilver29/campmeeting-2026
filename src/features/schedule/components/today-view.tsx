"use client";

import Link from "next/link";
import { Bookmark, CalendarCheck, CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { eventInfo, getDayByDate, type FlatSession } from "@/data";
import { useBookmarks } from "../bookmarks";
import { getDutyPanel } from "../lib/duty";
import { getTodayState, nextSavedSession, type TodayState } from "../lib/today";
import { useNow } from "../use-now";
import {
  SECTION_HEADING,
  UPCOMING_CARD,
  UPCOMING_EYEBROW,
  UPCOMING_TITLE,
} from "./card-styles";
import { Countdown } from "./countdown";
import { NowCard } from "./now-card";
import { OnDutyCard } from "./on-duty-card";
import {
  ENTRY_GRID,
  MinistryChip,
  PresenterChips,
  SessionCard,
  TimeRange,
} from "./session-card";

const sectionHeading = SECTION_HEADING;

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

/**
 * An upcoming session, headed by whatever the caller is claiming about
 * it. One component for "Next up" and for "Next saved session" so the two
 * cards cannot drift into two different shapes on the same page.
 */
function UpcomingCard({
  session,
  todayDate,
  headingId,
  heading,
  saved = false,
}: {
  session: FlatSession;
  todayDate: string;
  headingId: string;
  heading: string;
  /** Draws the bookmark beside the time, for a session this device saved. */
  saved?: boolean;
}) {
  const day = getDayByDate(session.date);
  const isToday = session.date === todayDate;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2 id={headingId} className={sectionHeading}>
        {heading}
      </h2>
      {/* Same grid as SessionCard, so these cards and the timeline under
          them share one time column rather than each inventing a layout.
          The surface comes from card-styles, which On Duty below shares —
          see the note there. */}
      <article className={`${ENTRY_GRID} ${UPCOMING_CARD}`}>
        <span className="flex min-h-6 items-center gap-2 sm:col-start-1 sm:row-start-1">
          <TimeRange start={session.start} end={session.end} />
          {saved ? (
            <>
              <Bookmark
                aria-hidden
                className="size-3.5 shrink-0 fill-bookmark text-bookmark"
              />
              <span className="sr-only">Saved to my schedule</span>
            </>
          ) : null}
        </span>
        <span className={UPCOMING_EYEBROW}>
          {isToday ? session.blockLabel : (day?.displayLabel ?? session.date)}
        </span>
        <h3 className={UPCOMING_TITLE}>{session.title}</h3>
        <PresenterChips session={session} />
        <MinistryChip session={session} />
      </article>
    </section>
  );
}

/**
 * The two forward-looking cards, in one place because whether there are
 * one or two of them is a single decision.
 *
 * Mid camp meeting the most useful thing this page can say is that
 * something the reader chose is about to start, so the saved card sits
 * with the live card and "Next up" rather than down the timeline.
 *
 * AFTER "Next up", not before it, and that is a correction rather than a
 * preference. The next saved session cannot be earlier than the next
 * session, since one is the earliest thing ahead and the other is an
 * upcoming thing; putting it first printed 14:10 above 11:50 and read as
 * a programme out of order. Below it, the three cards always run
 * forwards.
 *
 * When the two name the same session there is one card, carrying the
 * bookmark. Printing the same session twice under two headings is not
 * two facts, and this is the case that matters most: something saved is
 * about to start, and the card that already says what is next says it.
 *
 * Nothing at all when nothing saved is still ahead. No empty prompt, no
 * "you have not saved anything" advert: the bookmark cannot be pressed
 * from this page and there would be nothing here to act on.
 */
function Upcoming({
  next,
  saved,
  todayDate,
}: {
  next?: FlatSession;
  saved?: FlatSession;
  todayDate: string;
}) {
  const sameSession = Boolean(saved && next && saved.id === next.id);

  return (
    <>
      {next ? (
        <UpcomingCard
          session={next}
          todayDate={todayDate}
          headingId="next-heading"
          heading="Next up"
          saved={sameSession}
        />
      ) : null}
      {saved && !sameSession ? (
        <UpcomingCard
          session={saved}
          todayDate={todayDate}
          headingId="next-saved-heading"
          heading="Next saved session"
          saved
        />
      ) : null}
    </>
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

/**
 * On Duty, directly below Next Up.
 *
 * In all three phases, and never blank: before the event it shows the
 * opening Sabbath's rota, after it the closing Sabbath's, both labelled
 * so nobody mistakes them for today. See lib/duty.ts, which makes that
 * choice; this only places the card.
 */
function OnDuty({ state }: { state: TodayState }) {
  const panel = getDutyPanel(state.phase, state.now);
  return panel ? <OnDutyCard panel={panel} /> : null;
}

function BeforeEvent({ state, saved }: { state: TodayState; saved?: FlatSession }) {
  return (
    <>
      <section aria-labelledby="countdown-heading" className="flex flex-col gap-3">
        <h2 id="countdown-heading" className={sectionHeading}>
          Counting down
        </h2>
        <Countdown />
      </section>
      <Upcoming next={state.next} saved={saved} todayDate={state.now.date} />
      <OnDuty state={state} />
    </>
  );
}

function AfterEvent({ state }: { state: TodayState }) {
  return (
    <>
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
      {/* There is no Next Up after the event, so this is the first card
          rather than the second. It reads as the record of the last day
          rather than as an instruction. */}
      <OnDuty state={state} />
    </>
  );
}

function DuringEvent({ state, saved }: { state: TodayState; saved?: FlatSession }) {
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
      <Upcoming next={state.next} saved={saved} todayDate={state.now.date} />
      <OnDuty state={state} />
      <RemainingTimeline state={state} />
    </>
  );
}

/**
 * Reserves the space the live sections will take, so mounting shifts
 * nothing. Three headings and three cards: the live card, Next Up, and On
 * Duty, which is the tallest of the three because it carries two shifts
 * of four teams.
 */
function TodaySkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full rounded-card" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-28 w-full rounded-card" />
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-72 w-full rounded-card" />
    </div>
  );
}

export function TodayView() {
  const now = useNow();
  // Same context the schedule uses, from a provider on this page. Without
  // one it reads as "nothing saved" and the saved card simply never
  // appears, which is the correct degradation rather than a crash.
  const { ids, ready } = useBookmarks();

  // Statically generated markup cannot know the viewer's clock, so the
  // first paint is a placeholder and everything below resolves on mount.
  if (!now) return <TodaySkeleton />;

  const state = getTodayState(now);
  // Recomputed on every 30s tick, off the same instant the live card
  // uses, so the moment a saved session starts it stops being "next" in
  // both places at once. A find over ~230 sorted sessions twice a minute.
  const saved = ready
    ? nextSavedSession(state.now, (id) => ids.has(id))
    : undefined;

  return (
    <div className="flex flex-col gap-10">
      {state.phase === "before" ? (
        <BeforeEvent state={state} saved={saved} />
      ) : null}
      {state.phase === "during" ? (
        <DuringEvent state={state} saved={saved} />
      ) : null}
      {state.phase === "after" ? <AfterEvent state={state} /> : null}
    </div>
  );
}
