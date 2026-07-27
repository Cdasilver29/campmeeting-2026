"use client";

import { useEffect, useState } from "react";
import { toInstant } from "./lib/time";

/**
 * In development only, `?now=2026-08-21T14:00` pins the clock so the
 * countdown, live and archive modes can be opened side by side without
 * touching the machine's system time. A bare date and time is read as
 * Africa/Nairobi wall-clock, which is the frame the whole schedule uses;
 * add an offset or Z to give an absolute instant instead.
 *
 * The production build strips this: process.env.NODE_ENV is inlined, so
 * the body folds away and the URL parameter does nothing on the live site.
 */
function devClockOverride(): Date | undefined {
  if (process.env.NODE_ENV === "production") return undefined;
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
    const override = devClockOverride();
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
