import { DevThemeToggle } from "@/components/dev-theme-toggle";
import { allSessions, eventInfo, program, speakers } from "@/data";

/**
 * TEMPORARY Phase 0 page. It exists only to prove the data layer resolves
 * through the @/data barrel and that the brand tokens render in both themes.
 * Phase 3 replaces this with the real schedule.
 */

const blockCount = program.reduce((n, day) => n + day.blocks.length, 0);
const allBlockActivityCount = program.reduce(
  (n, day) => n + day.blocks.filter((b) => b.allBlockActivity).length,
  0,
);
const untimedSessionCount = allSessions.filter((s) => !s.start).length;

const stats = [
  { label: "Days", value: program.length },
  { label: "Blocks", value: blockCount },
  { label: "Timed sessions", value: allSessions.length - untimedSessionCount },
  { label: "Untimed sessions", value: untimedSessionCount },
  { label: "All-block activities", value: allBlockActivityCount },
  { label: "Speakers", value: speakers.length },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-10 bg-surface px-6 py-16 text-ink">
      <header className="flex flex-col gap-3">
        <p className="text-sm tracking-wide text-ink-muted uppercase">
          Phase 0 scaffold
        </p>
        <h1 className="font-display text-4xl leading-tight text-balance">
          {eventInfo.name}
        </h1>
        <p className="text-ink-muted">
          {eventInfo.edition} at {eventInfo.church.name},{" "}
          {eventInfo.church.address}. {eventInfo.startDate} to{" "}
          {eventInfo.endDate}, {eventInfo.timezone}.
        </p>
      </header>

      <section aria-labelledby="data-layer" className="flex flex-col gap-4">
        <h2 id="data-layer" className="font-display text-xl">
          Data layer
        </h2>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-1 bg-surface-muted p-4"
            >
              <dt className="text-sm text-ink-muted">{stat.label}</dt>
              <dd className="font-display text-2xl tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-ink-muted">
          Counts are derived from src/data at build time. Untimed entries and
          all-block activities are surfaced separately because the schedule UI
          has to handle them, per DATA-NOTES.md.
        </p>
      </section>

      <footer className="mt-auto flex flex-wrap items-center gap-4 border-t border-line pt-6">
        <DevThemeToggle />
        <span className="text-sm text-ink-muted">
          Temporary control, replaced in Phase 2.
        </span>
      </footer>
    </main>
  );
}
