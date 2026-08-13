import type { ChildrenClass, ChildrenClassBand } from "@/data";

/**
 * ── THE CLASSES, AND WHY THIS IS NOT THE SHEET'S TABLE ───────────────
 *
 * The committee's sheet draws this as a six-column table: class and time,
 * Bible, Craft/Q&A, Stewardship, Application Q&A, and class venue. Eleven
 * rows of it. On a printed page that is the right shape; on a phone it is
 * not, and the two ways of forcing it onto one are both bad. Sideways
 * scrolling hides half the columns behind a gesture nobody performs on a
 * page they are reading. Stacking the table with a `::before` label per
 * cell keeps the column headings but loses the table semantics that make
 * it navigable, because a browser drops the table role the moment
 * `display` changes.
 *
 * So it is not a table here. A class is a RECORD — an age band, a room,
 * and two or three teaching slots with named teachers — and eleven
 * records are a list of cards. Read down a card and you have everything
 * about one class; read across the grid and you have the age bands. That
 * is what a parent standing in the churchyard is actually doing: finding
 * one class, not comparing eleven.
 *
 * Two things the cards do that the sheet cannot. Each slot carries its
 * own time, instead of the time living in a column heading three
 * fingers-widths away at the top of the page. And a merged cell reads as
 * one longer slot — "Bible, Craft and Q&A, 09:20 to 10:30" on the oldest
 * class and the nursery — rather than as a rectangle spanning two columns
 * that the reader has to interpret.
 *
 * The On Duty panel on the home page IS a table, and the difference is
 * the data: four teams by two shifts is small, dense and genuinely
 * two-dimensional. Eleven classes by five varying attributes is not.
 */
export function ClassBands({ bands }: { bands: ChildrenClassBand[] }) {
  return (
    <div className="flex flex-col gap-8">
      {bands.map((band) => (
        <section
          key={band.label}
          aria-labelledby={`band-${band.label.replaceAll(" ", "-")}`}
          className="flex flex-col gap-3"
        >
          <h3
            id={`band-${band.label.replaceAll(" ", "-")}`}
            className="border-b border-line pb-1.5 font-display text-xl text-ink"
          >
            {band.label}
          </h3>
          {/* One column on a phone, two from sm, three from lg. Never
              four: the widest thing in a card is a pair of teacher names
              on one line, and a quarter of the 80rem shell is narrower
              than that. */}
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {band.classes.map((klass) => (
              <li key={klass.id} className="h-full">
                <ClassCard klass={klass} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ClassCard({ klass }: { klass: ChildrenClass }) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-card bg-surface p-4 ring-1 ring-line">
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="text-base leading-6 font-semibold text-ink">
          {klass.ages}
        </h4>
        {/* The room, as a chip. It is the one thing on the card somebody
            reads at a glance while walking, so it is not a line of grey
            text at the bottom. */}
        <span className="rounded-control bg-surface-muted px-2 py-0.5 text-xs font-medium whitespace-nowrap text-ink ring-1 ring-line">
          {klass.venue}
        </span>
      </header>

      <dl className="flex flex-col gap-2">
        {klass.slots.map((slot) => (
          <div key={slot.session}>
            <dt className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm font-medium text-ink">
                {slot.session}
              </span>
              <span className="tabular-figures text-xs text-ink-muted">
                {slot.time}
              </span>
            </dt>
            {/* Names one per line rather than comma-joined: a comma that
                wraps to the start of a line reads as leading punctuation,
                and half these cells hold two names. */}
            <dd>
              <ul className="text-sm text-ink-muted">
                {slot.teachers.map((teacher) => (
                  <li key={teacher}>{teacher}</li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
