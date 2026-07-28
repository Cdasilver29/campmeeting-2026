const UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 365 * 24 * 3_600_000 },
  { unit: "month", ms: 30 * 24 * 3_600_000 },
  { unit: "week", ms: 7 * 24 * 3_600_000 },
  { unit: "day", ms: 24 * 3_600_000 },
  { unit: "hour", ms: 3_600_000 },
];
const MINUTE_MS = 60_000;

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/**
 * Elapsed-duration relative time ("3 hours ago"), never a calendar-day
 * comparison. A notice published at 23:50 and read at 00:10 is "20
 * minutes ago" — crossing midnight does not make it "yesterday".
 */
export function relativeTime(iso: string, now: Date): string {
  const diffMs = new Date(iso).getTime() - now.getTime();
  const abs = Math.abs(diffMs);

  if (abs < MINUTE_MS) return "just now";

  const bucket = UNITS.find((u) => abs >= u.ms);
  if (!bucket) return formatter.format(Math.round(diffMs / MINUTE_MS), "minute");
  return formatter.format(Math.round(diffMs / bucket.ms), bucket.unit);
}
