import Link from "next/link";
import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { childrenProgram, eventInfo, type FlatSession } from "@/data";
import { ClassBands } from "@/features/children/components/class-list";
import { SessionCard } from "@/features/schedule/components/session-card";
import { pageMetadata } from "@/lib/metadata";
import { childrenPage } from "@/lib/page-identity";
import { DOC_HEADING, DOC_SECTION, MEASURE } from "@/lib/typography";

export const metadata = pageMetadata(childrenPage);

/**
 * The children's ministry, top level rather than under /ministries.
 *
 * It earned the move by having content no other ministry has: its own
 * timetable, its own eleven classes with named teachers and venues, and
 * its own coordinators, none of which is in program.ts. A page like that
 * two levels down behind a grid of four cards was the wrong shape for it.
 *
 * The ministry TAG is untouched — the Children's Corner is still tagged
 * `children` on all seven days that have one, `?ministry=children` on the
 * programme still works, and this page links to it. What moved is the
 * destination, and /ministries/children redirects here (next.config.ts).
 */

/**
 * The timetable is a schedule, so it uses the schedule's own card.
 *
 * `SessionCard` takes a `FlatSession` — a `Session` plus the day and
 * block it came from — and the children's sheet has neither: it is one
 * day repeated Monday to Friday, with no blocks and no dates. So the two
 * are supplied here rather than invented in the data, which is what keeps
 * these thirteen entries out of `allSessions`, out of the search index
 * and out of every day count on the site.
 *
 * `blockLabel` is what the card prints as its eyebrow, and "Monday to
 * Friday" is the true answer for every row of this timetable.
 */
const timetable: FlatSession[] = childrenProgram.timetable.map((session) => ({
  ...session,
  dayId: "children",
  date: eventInfo.startDate,
  blockId: "morning-service",
  blockLabel: "Monday to Friday",
}));

export default function ChildrenPage() {
  return (
    <>
      <PageHeader {...childrenPage}>
        <p>
          The children&rsquo;s own programme runs Monday to Friday, from
          arrival at 07:30 to the evening service. Children join the church
          for the Children&rsquo;s Corner at the mid-morning and evening
          services, and stay with their class for everything else.
        </p>
      </PageHeader>

      <Band>
        <Reveal>
          <section aria-labelledby="day-heading" className={DOC_SECTION}>
            <h1 id="day-heading" className={DOC_HEADING}>
              The day, Monday to Friday
            </h1>
            <p className={MEASURE}>
              One shape for all five weekdays. The two Sabbaths and Sunday are
              not on the children&rsquo;s sheet: on those days the
              Children&rsquo;s Corner and the Children Sermon run inside the
              church, and they are on the{" "}
              <Link
                href="/schedule?ministry=children"
                className="rounded-control font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
              >
                main programme
              </Link>
              .
            </p>

            {/* The same rail the programme draws down a block, for the
                same reason: these thirteen entries are one sequence and
                the rail is what says so. No bookmark control — a bookmark
                keys off a programme session id and these are not in the
                programme. */}
            <ol className="flex flex-col gap-3 border-l-2 border-line pl-4 sm:pl-6">
              {timetable.map((session) => (
                <li key={session.id}>
                  <SessionCard
                    session={session}
                    headingLevel="h3"
                    showBlockLabel={false}
                  />
                </li>
              ))}
            </ol>
          </section>
        </Reveal>
      </Band>

      <Band tone="muted">
        <Reveal>
          <section aria-labelledby="classes-heading" className={DOC_SECTION}>
            <h2 id="classes-heading" className={DOC_HEADING}>
              Classes and teachers
            </h2>
            <p className={MEASURE}>
              Every class, where it meets, and who teaches each session.
              Children are grouped by age from the nursery to fourteen.
            </p>
            <ClassBands bands={childrenProgram.bands} />
          </section>
        </Reveal>
      </Band>

      <Band>
        <Reveal>
          <section aria-labelledby="coordinators-heading" className={DOC_SECTION}>
            <h2 id="coordinators-heading" className={DOC_HEADING}>
              Coordinators
            </h2>
            {/* Four rows of role and people. A description list rather
                than a table: two columns where one is a label and the
                other is a sentence is a definition, not a grid. Stacked
                on a phone, side by side from sm. */}
            <dl className="flex flex-col gap-3">
              {childrenProgram.coordinators.map((entry) => (
                <div
                  key={entry.role}
                  className="sm:grid sm:grid-cols-[11rem_1fr] sm:gap-4"
                >
                  <dt className="text-sm font-semibold text-ink">
                    {entry.role}
                  </dt>
                  <dd className="text-sm text-ink-muted">{entry.people}</dd>
                </div>
              ))}
            </dl>
          </section>
        </Reveal>
      </Band>
    </>
  );
}
