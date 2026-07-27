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
    segments: [
      { label: "Days", value: days },
      { label: "Hours", value: hours },
      { label: "Minutes", value: minutes },
      { label: "Seconds", value: seconds },
    ],
  };
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
  const { days, hours, segments } = parts(remaining);

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
          <>
            {days} days and {hours} hours until the programme opens.
          </>
        ) : (
          "Counting down to the opening session."
        )}
      </p>
    </div>
  );
}
