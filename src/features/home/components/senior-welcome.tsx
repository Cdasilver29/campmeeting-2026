import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { hostById, hostLetter, type LetterBlock } from "@/data";
import { SpeakerAvatar } from "@/features/speakers/components/speaker-avatar";
import { ACTION_LINK } from "@/lib/link-styles";
import {
  PERSON_CARD_NAME,
  PERSON_CARD_ROLE,
} from "@/features/speakers/components/person-card";
import {
  SECTION_HEADING,
  UPCOMING_CARD,
} from "@/features/schedule/components/card-styles";

/**
 * ── THE SENIOR PASTOR'S WELCOME, ON THE HOME PAGE ────────────────────
 *
 * An excerpt from Dr. Gerald Mochoge's letter, his portrait, and two ways
 * through to the rest of it.
 *
 * ── THE TEXT HAS ONE SOURCE AND IT IS NOT HERE ───────────────────────
 *
 * Every word rendered below is read out of src/data/host-letters.ts at
 * build time. Nothing is retyped, nothing is paraphrased and no new
 * sentence is written for this card. That is not tidiness: the letters
 * are SIGNED, DATA-NOTES.md carries a line-by-line record of the nine
 * words that were ever changed across the five of them, and a second copy
 * of any of it on the home page would be a copy that can drift out from
 * under that record.
 *
 * ── WHERE THE EXCERPT ENDS, AND WHY IT IS COMPUTED ───────────────────
 *
 * `letterOpening` takes paragraphs from the START of the letter and stops
 * at the first list. Then it drops a trailing paragraph that introduces
 * that list — one ending in a colon — because ending an excerpt on "I
 * suggest we come to Him with:" is ending it mid-thought, with the five
 * things he suggests missing.
 *
 * On his letter that resolves to the first two paragraphs: "Praise God
 * Newlife fraternity" and the one that ends "...by God's grace and mercy
 * we have come this far?" — about 65 words, ending on his own question
 * mark, which is a full stop in a way a colon is not.
 *
 * Computed from the blocks rather than sliced by a hardcoded index, so a
 * letter that is re-transcribed, or a future year's senior pastor, still
 * ends somewhere a sentence ends.
 */
export function letterOpening(blocks: LetterBlock[]): string[] {
  const opening: string[] = [];

  for (const block of blocks) {
    if (block.kind === "list") break;
    if (block.kind === "heading") break;
    opening.push(block.text);
  }

  // A paragraph whose last character is a colon is introducing something
  // that is not in the excerpt.
  while (opening.length > 1 && opening[opening.length - 1]?.endsWith(":")) {
    opening.pop();
  }

  return opening;
}

/**
 * ── A SIBLING OF NEXT UP AND ON DUTY, NOT A NEW PATTERN ──────────────
 *
 * UPCOMING_CARD is the surface those two share, imported rather than
 * re-typed, so a change to that family reaches this card too. The heading
 * is SECTION_HEADING, the same h2 the three clock-driven cards carry. The
 * portrait, name and role are the host card's own components and type
 * scale, so the man on the home page and the man on /speakers are
 * presented as the same person rather than in two house styles.
 *
 * Nothing new was introduced: no colour, no surface, no size.
 *
 * ── IT IS BELOW THE WHOLE CLOCK-DRIVEN BLOCK, NOT INSIDE IT ──────────
 *
 * TodayView is a client component that paints a skeleton on first frame,
 * and its internal order changes with the event phase. A section placed
 * INSIDE it would be part of that mount and would have to be reserved for
 * in the skeleton. Placed after it, in its own band on a server-rendered
 * page, it cannot move the live card, cannot move Next Up, and cannot
 * contribute to CLS on the one page whose first paint is a skeleton.
 *
 * The cost of that decision, stated rather than hidden: during the event
 * it therefore sits below "Rest of today" as well as below On Duty. The
 * brief asked for below On Duty and for the live card not to be pushed
 * down, and where those two pull against each other the live card wins —
 * which is what the brief itself says to do.
 */
export function SeniorWelcome({ hostId }: { hostId: string }) {
  const host = hostById[hostId];
  const letter = hostLetter(hostId);
  // Both are data lookups, and a home page that throws because a letter
  // was withdrawn would be a bad trade for a section that is a welcome.
  if (!host || !letter) return null;

  const opening = letterOpening(letter.blocks);
  if (opening.length === 0) return null;

  const label = host.title ? `${host.title} ${host.name}` : host.name;

  return (
    <section aria-labelledby="welcome-heading" className="flex flex-col gap-3">
      <h2 id="welcome-heading" className={SECTION_HEADING}>
        A welcome from our senior pastor
      </h2>

      <article className={`${UPCOMING_CARD} flex flex-col gap-4`}>
        {/* The same row the host cards on /speakers open with: portrait,
            name in the display face, office beneath it. */}
        <div className="flex items-center gap-3">
          {/* `speaker` is the shape SpeakerAvatar takes — name, image and
              imagePosition — and a Host carries all three. The senior
              pastor's portrait is on his own host record; see the note in
              host-card.tsx about the one host whose photograph lives on a
              speaker record instead. */}
          <SpeakerAvatar speaker={host} size="lg" />
          <div className="flex flex-col">
            <p className={PERSON_CARD_NAME}>{label}</p>
            <p className={PERSON_CARD_ROLE}>{host.role}</p>
          </div>
        </div>

        {/* ── PROSE, SO IT TAKES THE PROSE MEASURE ──────────────────
            The card is as wide as Next Up and On Duty because it is
            their sibling; the TEXT inside it is not, because a
            paragraph set across 80rem is not a paragraph anybody
            finishes. `prose-column` is the site's own utility for
            --width-prose, so this measure and every body column on the
            site are one value rather than two that agree today. */}
        <div className="prose-column flex flex-col gap-3">
          {opening.map((paragraph) => (
            <p key={paragraph} className="text-base leading-7 text-ink">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Two destinations, and they answer different questions: this
            letter in full, and who else is hosting the week. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link href={`/hosts/${host.id}`} className={ACTION_LINK}>
            Read the full welcome
            <ArrowRight aria-hidden className="ml-1 size-4" />
          </Link>
          {/* The section's own heading id, which is what /speakers
              already labels that section by. No new anchor was added
              there for this link to aim at. */}
          <Link href="/speakers#hosts-heading" className={ACTION_LINK}>
            Hosts and elders
          </Link>
        </div>
      </article>
    </section>
  );
}
