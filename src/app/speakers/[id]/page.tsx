import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { speakerById, speakers } from "@/data";
import { TimeRange } from "@/features/schedule/components/session-card";
import { speakerLabel } from "@/features/schedule/lib/presenters";
import { ministryLabels } from "@/features/schedule/lib/today";
import { SpeakerAvatar } from "@/features/speakers/components/speaker-avatar";
import { speakerDayGroups } from "@/features/speakers/lib";
import { pageMetadata } from "@/lib/metadata";
import { speakerPageDefinition } from "@/lib/page-identity";

/** One page per speaker in event.ts, and nothing else: an unknown id is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return speakers.map((speaker) => ({ id: speaker.id }));
}

/**
 * The speaker's own name and role, so a link shared in a WhatsApp thread
 * previews as that person rather than as the site.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const speaker = speakerById[(await params).id];
  if (!speaker) return {};

  return pageMetadata(speakerPageDefinition(speaker));
}

export default async function SpeakerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const speaker = speakerById[(await params).id];
  // Unreachable while dynamicParams is false, but the data lookup can
  // still fail and this is what makes that a 404 rather than a crash.
  if (!speaker) notFound();

  const groups = speakerDayGroups(speaker.id);
  const total = groups.reduce((count, group) => count + group.sessions.length, 0);

  return (
    <>
      {/* The portrait sits in the header's media slot, above the eyebrow,
          and the header band centres it. The role is in the eyebrow, where
          the share card already put it, so the name needs no subtitle. */}
      <PageHeader
        {...speakerPageDefinition(speaker)}
        media={<SpeakerAvatar speaker={speaker} size="lg" />}
      >
        <p className="text-ink-muted italic">
          {speaker.bio ?? "Biography to follow."}
        </p>
      </PageHeader>

      <Band>
      {total === 0 ? (
        <p className="text-ink-muted">
          No sessions are listed for {speakerLabel(speaker)} yet.
        </p>
      ) : (
        <div className="flex flex-col gap-(--space-section)">
          <p className="tabular-figures text-sm text-ink-muted">
            {total} {total === 1 ? "session" : "sessions"} across{" "}
            {groups.length} {groups.length === 1 ? "day" : "days"}.
          </p>

          {groups.map(({ day, sessions }) => (
            <section
              key={day.id}
              aria-labelledby={`day-${day.id}-heading`}
              className="flex flex-col gap-3"
            >
              <h2
                id={`day-${day.id}-heading`}
                className="font-display text-xl text-ink"
              >
                <Link
                  href={`/schedule/${day.id}`}
                  className="rounded-control hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
                >
                  {day.displayLabel}
                </Link>
              </h2>

              <ol className="flex flex-col divide-y divide-line rounded-card ring-1 ring-line">
                {sessions.map((session) => (
                  <li key={session.id}>
                    <Link
                      href={`/schedule/${day.id}`}
                      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 transition-colors duration-fast hover:bg-surface-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-500"
                    >
                      <TimeRange
                        start={session.start}
                        end={session.end}
                        className="w-28 shrink-0"
                      />
                      <span className="flex-1 text-sm font-medium text-ink">
                        {session.title}
                      </span>
                      <span className="text-xs text-ink-muted">
                        {session.blockLabel}
                        {session.ministry
                          ? ` · ${ministryLabels[session.ministry]}`
                          : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
      </Band>
    </>
  );
}
