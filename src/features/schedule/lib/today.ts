import {
  allSessions,
  getCurrentSession,
  getDayByDate,
  type FlatSession,
  type MinistryTag,
  type ProgramBlock,
  type ProgramDay,
} from "@/data";
import { eventPhase, wallClock, type EventPhase, type WallClock } from "./time";

export const ministryLabels: Record<MinistryTag, string> = {
  worship: "Worship",
  music: "Music",
  "bible-study": "Bible Study",
  "spirit-of-prophecy": "Spirit of Prophecy",
  prophecy: "Prophecy",
  "possibility-ministry": "Possibility Ministry",
  evangelism: "Evangelism",
  discipleship: "Discipleship",
  publishing: "Publishing",
  stewardship: "Stewardship",
  health: "Health",
  "family-life": "Family Life",
  children: "Children",
  "christian-education": "Christian Education",
  prayer: "Prayer",
  medical: "Medical",
  fellowship: "Fellowship",
};

/** A session the programme gives a clock time to. */
export type TimedSession = FlatSession & { start: string; end: string };

function isTimed<T extends { start?: string; end?: string }>(
  session: T,
): session is T & { start: string; end: string } {
  return Boolean(session.start && session.end);
}

/** Every timed session in the programme, in chronological order. */
const timedSessions: TimedSession[] = allSessions
  .filter(isTimed)
  .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));

interface Bounds {
  start: string;
  end: string;
}

function timedBounds(block: ProgramBlock): Bounds | undefined {
  const times = block.sessions.filter(isTimed);
  const start = times.map((s) => s.start).sort()[0];
  const end = times
    .map((s) => s.end)
    .sort()
    .at(-1);
  if (!start || !end) return undefined;
  return { start, end };
}

export interface BlockWindow {
  block: ProgramBlock;
  start: string;
  end: string;
}

/**
 * The stretch of the day each block occupies.
 *
 * Blocks with timed sessions bound themselves. A block that is nothing
 * but an `allBlockActivity` (Sunday's Medical Camp, Friday's Sabbath
 * Preparation) has no times of its own, so it inherits the gap between
 * its neighbours: from the previous timed block's end to the next timed
 * block's start, opened out to the edges of the day when it is first or
 * last. Friday's is the last block, so Sabbath Preparation runs from
 * 12:30 to end of day, which is what makes the 14:00 fallback work.
 */
export function blockWindows(day: ProgramDay): BlockWindow[] {
  const bounds = day.blocks.map(timedBounds);

  return day.blocks.map((block, index) => {
    const own = bounds[index];
    if (own) return { block, ...own };

    let start = "00:00";
    for (let i = index - 1; i >= 0; i--) {
      const previous = bounds[i];
      if (previous) {
        start = previous.end;
        break;
      }
    }

    let end = "23:59";
    for (let i = index + 1; i < bounds.length; i++) {
      const following = bounds[i];
      if (following) {
        end = following.start;
        break;
      }
    }

    return { block, start, end };
  });
}

export type CurrentEntry =
  | { kind: "session"; session: FlatSession }
  | {
      kind: "all-block";
      block: ProgramBlock;
      activity: NonNullable<ProgramBlock["allBlockActivity"]>;
    };

/**
 * What is happening right now, in priority order:
 *
 *   1. a timed session, via getCurrentSession
 *   2. failing that, the all-block activity whose window contains now
 *   3. failing that, nothing — the day is between sessions or finished
 *
 * Step 2 is one rule covering both Friday afternoon and evening and
 * Sunday morning's Medical Camp. Step 3 is not an error state: Sabbath
 * 22nd has a real 15:00 to 16:00 gap, and every day ends.
 */
function resolveCurrent(
  instant: Date,
  now: WallClock,
  day: ProgramDay | undefined,
): CurrentEntry | undefined {
  const session = getCurrentSession(instant);
  if (session) return { kind: "session", session };
  if (!day) return undefined;

  const window = blockWindows(day).find(
    (w) =>
      w.block.allBlockActivity && w.start <= now.time && now.time < w.end,
  );
  if (!window?.block.allBlockActivity) return undefined;

  return {
    kind: "all-block",
    block: window.block,
    activity: window.block.allBlockActivity,
  };
}

export interface TodayState {
  phase: EventPhase;
  now: WallClock;
  /** The programme day matching today, if today falls inside the event. */
  day?: ProgramDay;
  current?: CurrentEntry;
  /**
   * The next timed session anywhere in the programme. Crosses midnight
   * deliberately, so the card still has something to say once a day has
   * finished and before the event opens.
   */
  next?: TimedSession;
  /** Today's timed sessions that have not started yet. */
  remaining: TimedSession[];
  /** False only when the day carries neither sessions nor an activity. */
  dayHasContent: boolean;
}

/**
 * The next timed session this device has saved, anywhere ahead in the
 * programme.
 *
 * Same "after now" rule and the same list as `next` below, so the two
 * cannot disagree about what "upcoming" means, and it crosses midnight
 * for the same reason: on Tuesday evening the useful answer is
 * Wednesday's 08:00, not nothing.
 *
 * Returns undefined when nothing is saved and when everything saved has
 * already run. Both are the same answer to the caller, which renders
 * nothing rather than a prompt: a card that says "you have saved no
 * sessions" is an advert, and the home page is not where the bookmark
 * can be pressed anyway.
 */
export function nextSavedSession(
  now: WallClock,
  isSaved: (sessionId: string) => boolean,
): TimedSession | undefined {
  return timedSessions.find(
    (session) =>
      (session.date > now.date ||
        (session.date === now.date && session.start > now.time)) &&
      isSaved(session.id),
  );
}

export function getTodayState(instant: Date): TodayState {
  const now = wallClock(instant);
  const day = getDayByDate(now.date);

  return {
    phase: eventPhase(instant),
    now,
    day,
    current: resolveCurrent(instant, now, day),
    next: timedSessions.find(
      (s) => s.date > now.date || (s.date === now.date && s.start > now.time),
    ),
    remaining: day
      ? timedSessions.filter((s) => s.date === now.date && s.start > now.time)
      : [],
    dayHasContent: day
      ? day.blocks.some((b) => b.sessions.length > 0 || b.allBlockActivity)
      : false,
  };
}
