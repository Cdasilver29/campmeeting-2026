import { Sunset } from "lucide-react";
import { sundownByDate, type ProgramDay } from "@/data";
import { cn } from "@/lib/utils";

/**
 * ── SUNDOWN ──────────────────────────────────────────────────────────
 *
 * Friday's sundown is when Sabbath begins, and for this congregation it
 * is the most meaningful hour of the week. It gets a card. Every other
 * day gets one line, because a marker that appears eight times in the
 * same size stops being a marker.
 *
 * Three tones, and which one a day gets is decided from the programme
 * data rather than from a list of dates, so a future year that swaps
 * src/data/ keeps the behaviour:
 *
 *   opens   the day before a Sabbath. Sabbath BEGINS at this time.
 *   closes  a Sabbath. Sabbath ENDS at this time, and on the closing
 *           Sabbath that is also when the camp meeting ends.
 *   quiet   everything else: a line of muted text, no card, no icon
 *           bigger than the text beside it.
 *
 * `dayLabel` is the programme's own printed word ("Sabbath", "Friday"),
 * which is what makes "the day before a Sabbath" answerable without a
 * calendar.
 */

export type SundownTone = "opens" | "closes" | "quiet";

/**
 * What this day's sundown means, from the programme rather than from the
 * date. `days` is the whole programme, in order, so "the day before a
 * Sabbath" can be asked without reaching for a weekday calculation — and
 * so Friday still opens the Sabbath if a future programme starts on a
 * different weekday.
 */
export function sundownTone(day: ProgramDay, days: ProgramDay[]): SundownTone {
  if (day.dayLabel === "Sabbath") return "closes";
  const index = days.findIndex((d) => d.id === day.id);
  const next = index >= 0 ? days[index + 1] : undefined;
  if (next?.dayLabel === "Sabbath") return "opens";
  return "quiet";
}

/** The time itself, or undefined if this date has none recorded. */
export function sundownFor(date: string): string | undefined {
  return sundownByDate[date];
}

/**
 * The quiet form: one muted line, wherever a day is being introduced.
 *
 * Rendered as `<time>` so the value is machine-readable, and with the
 * word "Sundown" spelled out rather than left to an icon: a sun dropping
 * behind a line is not a word, and this is a fact about the day rather
 * than a control.
 */
export function SundownLine({
  date,
  className,
}: {
  date: string;
  className?: string;
}) {
  const time = sundownFor(date);
  if (!time) return null;

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-sm text-ink-muted",
        className,
      )}
    >
      <Sunset aria-hidden className="size-4 shrink-0" />
      <span>
        Sundown <time dateTime={time} className="tabular-figures">{time}</time>
      </span>
    </p>
  );
}

/**
 * The card, for the two days where sundown is the event rather than a
 * detail.
 *
 * ── WHY IT IS NOT THE `NEXT_UP_CARD` FAMILY ─────────────────────────
 *
 * Those three cards are clock-driven answers on the home page and share
 * a surface for that reason. This is neither a session nor a rota; it is
 * a fixed fact about a day, and it is the one thing on Friday's page a
 * reader is looking for. It takes `surface-warm`, the palette's Earth
 * step, which is the only warm ground the site has and is otherwise
 * spent on the call-to-action band. A sundown is the warmest thing in the
 * week and this is the one place that ground is exactly right.
 *
 * Not colour alone: the heading says what happens, the time is set at
 * display size, and the icon repeats it. Read with no colour at all it
 * still says Sabbath begins at 18:38.
 */
export function SundownCard({
  date,
  tone,
  closesCamp = false,
  className,
}: {
  date: string;
  tone: "opens" | "closes";
  /** The last Sabbath: sundown is also the end of the camp meeting. */
  closesCamp?: boolean;
  className?: string;
}) {
  const time = sundownFor(date);
  if (!time) return null;

  const heading =
    tone === "opens" ? "Sabbath begins at sundown" : "Sabbath ends at sundown";

  return (
    <section
      aria-labelledby={`sundown-${date}`}
      className={cn(
        "flex items-start gap-3 rounded-card bg-surface-warm p-4 ring-1 ring-line sm:p-5",
        className,
      )}
    >
      <Sunset aria-hidden className="mt-1 size-5 shrink-0 text-ink" />
      <div className="flex flex-col gap-1">
        <h2
          id={`sundown-${date}`}
          className="text-sm font-medium tracking-wide text-ink-muted uppercase"
        >
          {heading}
        </h2>
        <p className="font-display text-3xl leading-none text-ink">
          <time dateTime={time} className="tabular-figures">
            {time}
          </time>
        </p>
        <p className="text-sm text-ink-muted">
          {tone === "opens"
            ? "The afternoon and evening are given to Sabbath preparation. East Africa Time."
            : closesCamp
              ? "Camp meeting ends here. East Africa Time."
              : "East Africa Time."}
        </p>
      </div>
    </section>
  );
}

/**
 * The whole decision for one day, so a caller places one element and
 * never repeats the branching. Used by the day pages; the home page uses
 * SundownCard directly, because there it is only ever drawn on the day
 * that opens the Sabbath.
 */
export function DaySundown({
  day,
  days,
  className,
}: {
  day: ProgramDay;
  days: ProgramDay[];
  className?: string;
}) {
  const tone = sundownTone(day, days);
  if (tone === "quiet") return <SundownLine date={day.date} className={className} />;

  return (
    <SundownCard
      date={day.date}
      tone={tone}
      closesCamp={tone === "closes" && days[days.length - 1]?.id === day.id}
      className={className}
    />
  );
}
