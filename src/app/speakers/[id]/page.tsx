import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, Users } from "lucide-react";
import { Band } from "@/components/band";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { eventInfo, speakerById, speakers } from "@/data";
import { TimeRange } from "@/features/schedule/components/session-card";
import { speakerLabel } from "@/features/schedule/lib/presenters";
import { ministryLabels } from "@/features/schedule/lib/today";
import { SCHEDULE_PATH, scheduleHref } from "@/features/schedule/lib/url";
import { SpeakerPortrait } from "@/features/speakers/components/speaker-avatar";
import {
  speakerDayGroups,
  speakerTrack,
  trackAbsentSentence,
  trackLeadSentence,
  trackWhenSentence,
} from "@/features/speakers/lib";
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
  /* Only read when `total` is 0. A speaker with sessions of their own has
     them listed below, and a track sentence above that list would be
     describing the same week twice. */
  const track = speakerTrack(speaker);
  const trackWhen = track ? trackWhenSentence(track) : undefined;

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
          stated. Ten of the eleven profiles have a biography today; Eld.
          Ken Ochuka is the only one who does not. */}
      {speaker.bio ? (
        <Reveal>
          {/* `prose-column`, not the bare measure it used to carry. Both
              cap at --width-prose; the utility also sets margin-inline,
              which is the whole difference. Ranged left, a 686px column
              under a page header that is itself centred left 554px of
              empty page to its right at 1280 — the "layout that lost its
              right half" globals.css describes at the utility itself.

              The measure is UNCHANGED. Only the column's position moves,
              and the text inside it stays left-aligned.

              KNOWN AND ACCEPTED: on the seven speakers who have sessions,
              this column no longer shares a left edge with the day lists
              below it, which run the full shell. /livestream made the
              opposite call on the same shape for that reason — see the
              note in CatchUp. This page goes the other way deliberately:
              the biography is a document section rather than a heading
              for the programme under it, and on the four speakers with no
              sessions it now sits on the same axis as the EmptyState
              card's own centred contents. */}
          <section
            aria-labelledby="biography-heading"
            className="prose-column flex flex-col gap-4"
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
         * SIX SPEAKERS ARE IN THIS STATE TODAY and it is not an error —
         * but it is not ONE state either, which is what it used to be
         * rendered as.
         *
         * Every one of them got the same sentence: the sessions "have
         * not been published yet". For the three Family Life records
         * that threw away the fact the reader wanted, because the
         * programme HAS Family Life — five sessions, Sunday through
         * Thursday, at a known hour — and the only unknown is which
         * afternoon is whose. For Ambassadors and Teens it was worse
         * than useless: it promised sessions that no published document
         * mentions.
         *
         * So there are three states now, and which one a page gets is
         * read off `role` and out of program.ts. See `speakerTrack` in
         * features/speakers/lib.ts — the classification is there, with
         * no speaker id in it, and these three branches only choose the
         * wording.
         *
         * NOTHING HERE LINKS A PERSON TO A DATED SESSION. The first
         * branch links to the ministry filter, which is the whole track
         * and says so; program.ts is untouched by any of this.
         *
         * EmptyState in all three, because that is the component this
         * site uses when a view has nothing of its own in it, and a
         * second way of saying it is how a site stops having a voice. It
         * is deliberately NOT ErrorState.
         */
        <Reveal>
          {track && trackWhen ? (
            /* The track is in the programme: say what they lead, say
               when that track runs — days and hours from program.ts by
               way of `speakerTrack`, never written here — and open the
               filtered schedule so the reader can go and look. */
            <EmptyState
              icon={CalendarClock}
              title={track.label}
              description={`${trackLeadSentence(speaker, track)} ${trackWhen}`}
              action={
                <Link
                  href={scheduleHref({ ministry: track.ministry })}
                  className={ACTION_LINK}
                >
                  See the {track.label} sessions
                </Link>
              }
            />
          ) : track ? (
            /* The track is real and the programme does not carry it.
               Say what they lead and stop: no link, because there is
               nothing on the schedule to open, and no invented session
               to make the page look complete. */
            <EmptyState
              icon={Users}
              title={track.label}
              description={`${trackLeadSentence(speaker, track)} ${trackAbsentSentence(track)}`}
            />
          ) : (
            /* No role and no session: nothing is known, which is exactly
               what this wording says. Unchanged, and kept for that. */
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
          )}
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
