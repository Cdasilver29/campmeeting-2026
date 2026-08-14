"use client";

import { eventStartInstant } from "../lib/time";
import { useNow } from "../use-now";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function parts(remainingMs: number) {
  const ms = Math.max(0, remainingMs);
  const days = Math.floor(ms / DAY);
  const hours = Math.floor((ms % DAY) / HOUR);
  const minutes = Math.floor((ms % HOUR) / MINUTE);
  const seconds = Math.floor((ms % MINUTE) / 1000);

  return {
    days,
    hours,
    minutes,
    segments: [
      { label: "Days", value: days },
      { label: "Hours", value: hours },
      { label: "Minutes", value: minutes },
      { label: "Seconds", value: seconds },
    ],
  };
}

/** "1 day", "2 days" — the unit agrees with the number in front of it. */
function count(value: number, noun: string) {
  return `${value} ${noun}${value === 1 ? "" : "s"}`;
}

/**
 * The sentence under the digits, and the only form of the countdown
 * assistive technology is given — the digits above are aria-hidden.
 *
 * It names the two largest units that are still non-zero rather than
 * always saying days and hours. On the last day "0 days and 12 hours"
 * announced a zero that carried no information, and in the final hour
 * both leading units were zero, so the sentence said nothing was left
 * while the clock was still running.
 */
function remainingSentence(days: number, hours: number, minutes: number) {
  if (days > 0) return `${count(days, "day")} and ${count(hours, "hour")}`;
  if (hours > 0) return `${count(hours, "hour")} and ${count(minutes, "minute")}`;
  return count(minutes, "minute");
}

/**
 * Counts down to the first timed session of the programme, derived from
 * the data rather than a literal date. Ticks every second, which is why
 * it holds its own clock instead of sharing the 30s one the live
 * indicator uses.
 *
 * The digits are hidden from assistive technology and summarised in a
 * single sentence below: a per-second live region would be unusable.
 */
export function Countdown() {
  const now = useNow(1000);
  const remaining = now ? eventStartInstant.getTime() - now.getTime() : 0;
  const { days, hours, minutes, segments } = parts(remaining);

  return (
    <div className="flex flex-col gap-3">
      <ul
        aria-hidden
        className="grid grid-cols-4 gap-px overflow-hidden rounded-card bg-line"
      >
        {segments.map((segment) => (
          <li
            key={segment.label}
            className="flex flex-col items-center gap-1 bg-surface-muted px-2 py-4"
          >
            <span className="tabular-figures font-display text-3xl text-ink sm:text-4xl">
              {now ? String(segment.value).padStart(2, "0") : "--"}
            </span>
            <span className="text-xs tracking-wide text-ink-muted uppercase">
              {segment.label}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-sm text-ink-muted">
        {now ? (
          <>{remainingSentence(days, hours, minutes)} until the programme opens.</>
        ) : (
          "Counting down to the opening session."
        )}
      </p>
    </div>
  );
}
