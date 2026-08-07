import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { Band } from "@/components/band";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { eventInfo, speakerById, speakers } from "@/data";
import { TimeRange } from "@/features/schedule/components/session-card";
import { speakerLabel } from "@/features/schedule/lib/presenters";
import { ministryLabels } from "@/features/schedule/lib/today";
import { SCHEDULE_PATH } from "@/features/schedule/lib/url";
import { SpeakerPortrait } from "@/features/speakers/components/speaker-avatar";
import { speakerDayGroups } from "@/features/speakers/lib";
import { ACTION_LINK } from "@/lib/link-styles";
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
      {/* No `children`. The biography used to sit in the header's slot,
          which was right while it was one sentence and is wrong now that
          the supplied ones run to five paragraphs: that slot is centred
          inside a 55ch measure on a band whose height is its own type, so
          a long biography would centre 300 words and make the band taller
          than the screen. It has moved below, ranged left at prose
          measure, where a biography is read. */}
      <PageHeader
        {...speakerPageDefinition(speaker)}
        media={<SpeakerPortrait speaker={speaker} />}
      />

      {/* innerClassName, not className: the gap belongs to the shell the
          content sits on, not to the full-bleed band around it. */}
      <Band innerClassName="flex flex-col gap-(--space-section)">
      {/* Only when there is one. "Biography to follow." was a line of
          type saying nothing on all four pages that carried it. A page
          with a portrait, a role and a programme does not need a
          sentence apologising for what it has not got; see the
          no-sessions note below for the one absence that does have to be
          stated. Eight of the ten profiles have a biography today; Eld.
          Ken Ochuka and Allan Okoth do not. */}
      {speaker.bio ? (
        <Reveal>
          <section
            aria-labelledby="biography-heading"
            className="flex max-w-(--width-prose) flex-col gap-4"
          >
            {/* A heading rather than an unlabelled block of type, so the
                page's heading list reads "biography, then the days" and a
                reader arriving by heading navigation can skip it. */}
            <h2
              id="biography-heading"
              className="font-display text-xl text-ink"
            >
              About {speakerLabel(speaker)}
            </h2>
            {speaker.bio.map((paragraph) => (
              <p key={paragraph} className="text-ink-muted">
                {paragraph}
              </p>
            ))}
          </section>
        </Reveal>
      ) : null}

      {total === 0 ? (
        /*
         * THREE SPEAKERS ARE IN THIS STATE TODAY and it is not an error.
         * janet-oyende-kariuki, john-clement and barrack-bosire are
         * credited in no session, in v2 and again in v3. The wording has
         * to say that the sessions are coming, not that the page is
         * broken or that the person has nothing to do: "No sessions are
         * listed" reads as the latter.
         *
         * EmptyState rather than a bare paragraph, because that is the
         * component this site uses whenever a view has nothing in it, and
         * a fifth different way of saying "not yet" is how a site stops
         * having a voice. It is deliberately NOT ErrorState.
         */
        <Reveal>
          <EmptyState
            icon={CalendarClock}
            title="Sessions to be confirmed"
            description={`${speakerLabel(speaker)} is on the ${eventInfo.edition} programme, but the sessions have not been published yet. They will appear here, and on the full programme, as soon as the committee confirms them.`}
            action={
              <Link href={SCHEDULE_PATH} className={ACTION_LINK}>
                See the full programme
              </Link>
            }
          />
        </Reveal>
      ) : (
        /* The count line and one item per day the speaker appears on. A
           day is a major section and there are at most eight of them, so
           this is the size of set the stagger is for. The session rows
           inside each day are not touched: they are programme content and
           the group moves as one. */
        <RevealGroup className="flex flex-col gap-(--space-section)">
          <RevealItem>
            <p className="tabular-figures text-sm text-ink-muted">
              {total} {total === 1 ? "session" : "sessions"} across{" "}
              {groups.length} {groups.length === 1 ? "day" : "days"}.
            </p>
          </RevealItem>

          {groups.map(({ day, sessions }) => (
            /* The <section> stays inside RevealItem rather than being
               replaced by its div: the landmark and its aria-labelledby
               are the page's structure, and a wrapper must not swallow
               them. */
            <RevealItem key={day.id}>
            <section
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
            </RevealItem>
          ))}
        </RevealGroup>
      )}
      </Band>
    </>
  );
}
