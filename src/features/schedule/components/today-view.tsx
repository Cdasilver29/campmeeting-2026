"use client";

import Link from "next/link";
import { Bookmark, CalendarCheck, CalendarClock } from "lucide-react";
import { LIVESTREAM_PATH } from "@/features/livestream/lib/stream-link";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { eventInfo, getDayByDate, program, type FlatSession } from "@/data";
import { eventDateRange } from "@/lib/event-dates";
import { useBookmarks } from "../bookmarks";
import { getDutyPanel } from "../lib/duty";
import { getTodayState, nextSavedSession, type TodayState } from "../lib/today";
import { useNow } from "../use-now";
import {
  NEXT_UP_CARD,
  NEXT_UP_TITLE,
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
import { SessionNotices } from "./session-notices";
import { SundownCard, sundownTone } from "./sundown";

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
  prominent = false,
}: {
  session: FlatSession;
  todayDate: string;
  headingId: string;
  heading: string;
  /** Draws the bookmark beside the time, for a session this device saved. */
  saved?: boolean;
  /**
   * One size up. True for "Next up" and false for "Next saved session":
   * the two are the same card, and only one of them is the question a
   * reader arriving mid camp meeting is actually asking. See
   * NEXT_UP_CARD in card-styles.ts.
   */
  prominent?: boolean;
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
      <article
        className={`${ENTRY_GRID} ${UPCOMING_CARD} ${prominent ? NEXT_UP_CARD : ""}`}
      >
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
        <h3 className={prominent ? NEXT_UP_TITLE : UPCOMING_TITLE}>
          {session.title}
        </h3>
        {/* A session that has been moved or cancelled is exactly the
            session somebody standing in the churchyard is about to walk
            to, so the notice belongs on the card that sent them rather
            than only in the timeline below it. The live card gets this
            already, because it renders a real SessionCard. */}
        <SessionNotices sessionId={session.id} />
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
          prominent
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
 * Sundown, on the home page, on the two days it is an event.
 *
 * ── WHY IT IS HERE AND NOT AT THE TOP ────────────────────────────────
 *
 * Friday's sundown is the most meaningful marker of this week and it is
 * still not what somebody opens this page to find. The question the home
 * page answers is what is on now and what is next, and a card above
 * "Next up" would push the answer down to buy emphasis it does not need:
 * the card is warm, carries the time at display size and is the only
 * thing on the page that is not a session or a rota, so it is found
 * whether it is second or fourth.
 *
 * ── AND NOTHING AT ALL ON THE OTHER SIX DAYS ─────────────────────────
 *
 * No quiet line here, unlike the day pages. This page is a live view of a
 * single day and every line on it earns its place by being actionable
 * within the hour; "Sundown 18:38" on a Tuesday morning is neither. The
 * day pages are where the whole week's sundowns are readable.
 */
function Sundown({ state }: { state: TodayState }) {
  if (!state.day) return null;
  const tone = sundownTone(state.day, program);
  if (tone === "quiet") return null;

  return (
    <SundownCard
      date={state.day.date}
      tone={tone}
      closesCamp={program[program.length - 1]?.id === state.day.id}
    />
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
        description={`The programme ran ${eventDateRange()}. Recordings and notices from the week stay available on the announcements and downloads pages.`}
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
        /*
         * ── THE CARD IS THE LINK WHENEVER A REAL SESSION IS ON ────────
         *
         * This used to be a separate "Watch this live" button under the
         * card, rendered whatever was on. On a Sunday morning that put it
         * under the Medical Camp, which is an untimed all-block activity
         * nobody is broadcasting — a control promising a stream that did
         * not exist.
         *
         * Between those two states there was a third: the href was also
         * conditioned on a per-day video id being present in config, so
         * the card went dead during real, broadcast sessions whenever
         * nobody had typed that day's ids in. That whole id table is gone
         * — see livestream/config.ts — and with it the idea that this
         * page can know which video is live. It cannot, and it does not
         * need to: /livestream asks YouTube at the moment of the press.
         *
         * So the only question left is whether the thing on now is a real
         * timed session, and NowCard answers it from `current.kind`, the
         * same discriminant it already uses to choose which card to draw.
         */
        <NowCard current={state.current} watchHref={LIVESTREAM_PATH} />
      ) : (
        <BetweenCard next={state.next} />
      )}
      <Upcoming next={state.next} saved={saved} todayDate={state.now.date} />
      <Sundown state={state} />
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
