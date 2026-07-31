"use client";

import { useEffect, useState } from "react";
import { toInstant } from "./lib/time";

/**
 * Where the build opts in, `?now=2026-08-21T14:00` pins the clock so the
 * countdown, live and archive modes can be opened side by side without
 * touching the machine's system time. A bare date and time is read as
 * Africa/Nairobi wall-clock, which is the frame the whole schedule uses;
 * add an offset or Z to give an absolute instant instead.
 *
 * The gate is NEXT_PUBLIC_ENABLE_CLOCK_OVERRIDE, not NODE_ENV. A demo or a
 * preview deployment is a production build by definition, so gating on
 * NODE_ENV meant the only state a deployed site could ever show was the
 * pre-event countdown. This is opt-in and defaults to off: the comparison
 * is against the exact string "true", so an unset variable, an empty one,
 * or a stray "1" all leave the override disabled. Set it on previews only,
 * never on production, or any visitor can pin the clock to a schedule that
 * is not the real one. See DEPLOY.md.
 *
 * The value is fixed per build either way. Turbopack does not fold this
 * one to a literal the way it folds NODE_ENV — the built chunk reads
 * `process.env.NEXT_PUBLIC_ENABLE_CLOCK_OVERRIDE` from a shim populated at
 * build time, so the parsing below still ships, it just never runs. That
 * is checked, not assumed: on a production build without the flag, `?now=`
 * leaves the countdown in place.
 */
function clockOverride(): Date | undefined {
  if (process.env.NEXT_PUBLIC_ENABLE_CLOCK_OVERRIDE !== "true") return undefined;
  if (typeof window === "undefined") return undefined;

  const raw = new URLSearchParams(window.location.search).get("now");
  if (!raw) return undefined;

  const separator = raw.indexOf("T");
  if (separator !== -1) {
    const date = raw.slice(0, separator);
    const time = raw.slice(separator + 1);
    // No offset and no Z, so read it as event-local wall clock.
    if (!/[Z+]|-\d\d:?\d\d$/.test(time)) {
      return toInstant(date, time.slice(0, 5));
    }
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/**
 * The current instant, or undefined until the component has mounted.
 *
 * Undefined on the first render is deliberate. Every page here is
 * statically generated, so the server HTML is baked at build time and
 * cannot know the viewer's clock. Rendering a placeholder for one frame
 * and filling it in on mount keeps the markup identical on both sides;
 * callers reserve the space so nothing shifts when it arrives.
 */
export function useNow(intervalMs = 30_000): Date | undefined {
  const [now, setNow] = useState<Date>();

  useEffect(() => {
    const override = clockOverride();
    if (override) {
      setNow(override);
      return;
    }

    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
