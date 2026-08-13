import Link from "next/link";
import { hostLetter, speakerById, type Host } from "@/data";
import {
  PERSON_CARD,
  PERSON_CARD_INTERACTIVE,
  PERSON_CARD_NAME,
  PERSON_CARD_ROLE,
} from "./person-card";
import { SpeakerAvatar } from "./speaker-avatar";

/**
 * A host, in the same card shape as a presenter.
 *
 * Deliberately the same silhouette as SpeakerCard — avatar, name in the
 * display face, role under it, one shared left edge — because these are
 * the same kind of thing seen from a different angle, and two card
 * designs on one page would say they are not. What differs is the third
 * line: a presenter card ends in a session count, a host card ends in a
 * biography or in nothing.
 *
 * ── WHY THIS IS NOT SpeakerCard WITH A FLAG ──────────────────────────
 *
 * Three of the four differences are structural rather than cosmetic.
 * Most hosts are not links, so the outer element is an <article> rather
 * than an <a> and the whole hover, active and focus contract goes with
 * it. There is no session count, and no "Sessions to be confirmed"
 * either — a host is not on the programme as a host, so a line saying
 * their sessions are coming would be untrue rather than merely absent.
 * And the biography sits inside the card here, where on a presenter it
 * has a page of its own to live on.
 *
 * ── WHAT THE THIRD LINE HOLDS NOW ────────────────────────────────────
 *
 * A PULL-QUOTE from the host's welcome letter, and the card is a link to
 * the letter in full at /hosts/{id}.
 *
 * All five wrote, and none of them wrote a biography: what arrived were
 * letters to the congregation, 120 words to nearly a thousand. The
 * longest cannot go on a card at all, and the shortest would still be
 * four times the height of the presenter cards beside it. One sentence
 * of it can, and one sentence is also what a card is for — enough to
 * decide whether to open the letter.
 *
 * The quote is ALWAYS the writer's own words, lifted verbatim from the
 * letter. Nothing here summarises anybody: a card that puts words in a
 * named person's mouth is worse than a card with no quote at all.
 *
 * `bio` still renders if one ever arrives, and is still empty on all
 * five. Where both exist the quote wins the card, because the card's job
 * is to send the reader to the letter.
 */
function HostBody({ host }: { host: Host }) {
  const label = host.title ? `${host.title} ${host.name}` : host.name;
  const letter = hostLetter(host.id);

  /* Eld. Ken Ochuka is on both lists, so his portrait is on his SPEAKER
     record and not on his host record — one photograph for one person,
     rather than the same file named in two arrays that then drift apart
     the first time one of them is re-cropped. This is the read side of
     that: where a host has a `speakerId`, the profile is what sits for
     the avatar. `?? host` covers a speakerId pointing at a profile that
     does not exist, which falls back to the monogram rather than
     throwing. The four hosts with no profile are unaffected.

     Only the PORTRAIT is resolved this way. The name and the role below
     stay the host's own, because those are the office he holds on this
     list and the speaker record does not carry it. */
  const sitter = (host.speakerId ? speakerById[host.speakerId] : undefined) ?? host;

  return (
    <>
      <SpeakerAvatar speaker={sitter} size="lg" />
      <div className="flex flex-col gap-1">
        <p className={PERSON_CARD_NAME}>{label}</p>
        {/* Not optional the way a speaker's role is. The office IS what
            puts someone on this list, so a host without one would be a
            data error rather than a card with a line missing, and the
            type makes it required. */}
        <p className={PERSON_CARD_ROLE}>{host.role}</p>
      </div>
      {letter ? (
        <div className="flex flex-col gap-1.5">
          {/* A real <blockquote>, not a styled paragraph. It is a
              quotation from a named person and the markup should say so.
              The opening and closing marks are drawn in the content so
              they cannot be selected or read out as words. */}
          <blockquote className="text-xs leading-5 text-ink-muted before:content-['“'] after:content-['”'] sm:text-sm sm:leading-6">
            {letter.pullQuote}
          </blockquote>
          <span className="text-xs font-medium text-primary">
            Read the welcome
          </span>
        </div>
      ) : host.bio && host.bio.length > 0 ? (
        <div className="flex flex-col gap-2">
          {host.bio.map((paragraph) => (
            <p key={paragraph} className="text-xs leading-5 text-ink-muted sm:text-sm sm:leading-6">
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}
    </>
  );
}

export function HostCard({ host }: { host: Host }) {
  /* Where the card goes, in priority order.
​
     THE LETTER WINS over the speaker page, and for the one host who has
     both that is a real choice. This is the hosts and elders section: it
     answers "who is running this week", and the letter is what the
     person on the card wrote for it. Eld. Ken Ochuka's speaker page is
     what he PRESENTS, and his letter page links to it.

     A host with neither is an <article> rather than a link — a card that
     looks clickable and is not is worse than a row where some cards are
     links. All five have a letter today, so all five are links; the
     fallback stays because a future year's host list will start empty
     again. The link states are copied from SpeakerCard rather than
     reinvented. */
  const href = hostLetter(host.id)
    ? `/hosts/${host.id}`
    : host.speakerId
      ? `/speakers/${host.speakerId}`
      : undefined;

  if (href) {
    return (
      <Link href={href} className={`${PERSON_CARD} ${PERSON_CARD_INTERACTIVE}`}>
        <HostBody host={host} />
      </Link>
    );
  }

  return (
    <article className={PERSON_CARD}>
      <HostBody host={host} />
    </article>
  );
}
