import Link from "next/link";
import type { Speaker } from "@/data";
import { speakerLabel } from "@/features/schedule/lib/presenters";
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

          A zero count says "to be confirmed" rather than rendering
          nothing. Four of the eleven speakers are in that state today — the
          committee owes their sessions, see DATA-NOTES — and a card that
          simply stops after the role reads as a card that is still
          loading, or as a data slip. The whole point of saying it is that
          it is neither. Sentence case rather than the uppercase the count
          takes, so the two are told apart at a glance.

          It stays text-xs at every width. It is the smallest thing on the
          card by design and 12px is the floor; the name and role step
          down around it on a phone and this does not. */}
      <p className="mt-auto pt-1 text-xs tracking-wide text-ink-muted">
        {sessionCount > 0 ? (
          <span className="uppercase">
            {sessionCount} {sessionCount === 1 ? "session" : "sessions"}
          </span>
        ) : (
          "Sessions to be confirmed"
        )}
      </p>
    </Link>
  );
}
