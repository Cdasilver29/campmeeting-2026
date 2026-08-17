import Link from "next/link";
import type { Speaker } from "@/data";
import { speakerLabel } from "@/features/schedule/lib/presenters";
import { speakerTrack, trackWhenSentence } from "../lib";
import {
  PERSON_CARD,
  PERSON_CARD_INTERACTIVE,
  PERSON_CARD_NAME,
  PERSON_CARD_ROLE,
} from "./person-card";
import { SpeakerAvatar } from "./speaker-avatar";

/**
 * Left-aligned, not centred. Centring a large monogram over a name makes
 * the absent photograph the subject of the card; ranging the card left
 * makes the name the subject and lets the avatar sit beside it as one
 * element among several. It also gives the cards a shared left edge,
 * which is what makes the rows read as a grid.
 *
 * The box, the link states and the two type sizes are in person-card.ts,
 * shared with HostCard so the two grids on /speakers cannot drift into
 * two different cards.
 */
/**
 * The bottom line of a card whose speaker has no dated session.
 *
 * Each of the three says only what is actually unknown:
 *
 *   track in the programme    the hour is known and the day is not, so
 *                             the DAY is what is outstanding
 *   track not in it           no session exists to be confirmed, and
 *                             saying one is coming would invent it
 *   no role at all            nothing is known, the original wording
 *
 * The role line directly above already names the track, so none of these
 * repeats it.
 */
function zeroSessionNote(speaker: Speaker): string {
  const track = speakerTrack(speaker);
  if (!track) return "Sessions to be confirmed";
  return trackWhenSentence(track)
    ? "Day to be confirmed"
    : "Not in the published programme";
}

export function SpeakerCard({
  speaker,
  sessionCount,
}: {
  speaker: Speaker;
  sessionCount: number;
}) {
  return (
    <Link
      href={`/speakers/${speaker.id}`}
      className={`${PERSON_CARD} ${PERSON_CARD_INTERACTIVE}`}
    >
      <SpeakerAvatar speaker={speaker} size="lg" />
      <div className="flex flex-col gap-1">
        <p className={PERSON_CARD_NAME}>{speakerLabel(speaker)}</p>
        {speaker.role ? (
          <p className={PERSON_CARD_ROLE}>{speaker.role}</p>
        ) : null}
      </div>
      {/* Pushed to the bottom edge so the line sits level across the row
          however long the names above it run.

          A zero count says something rather than rendering nothing. Six of
          the thirteen speakers are in that state today, and a card that
          simply stops after the role reads as a card that is still
          loading, or as a data slip. Sentence case rather than the
          uppercase the count takes, so the two are told apart at a glance.

          THREE ZERO STATES, NOT ONE, matching the profile page — see the
          note there and `speakerTrack`. "Sessions to be confirmed" on all
          of them said the same thing about two different facts: for the
          Family Life records the day is the only unknown, and for
          Ambassadors and Teens the programme carries no such session at
          all and none is promised. The line is derived from the role and
          the programme, with no speaker id in it.

          It stays text-xs at every width. It is the smallest thing on the
          card by design and 12px is the floor; the name and role step
          down around it on a phone and this does not. */}
      <p className="mt-auto pt-1 text-xs tracking-wide text-ink-muted">
        {sessionCount > 0 ? (
          <span className="uppercase">
            {sessionCount} {sessionCount === 1 ? "session" : "sessions"}
          </span>
        ) : (
          zeroSessionNote(speaker)
        )}
      </p>
    </Link>
  );
}
