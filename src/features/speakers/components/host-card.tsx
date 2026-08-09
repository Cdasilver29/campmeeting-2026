import Link from "next/link";
import { speakerById, type Host } from "@/data";
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
 * ── THE PHOTOGRAPHS ARRIVED AND NOTHING HERE HAD TO CHANGE ───────────
 *
 * As predicted, almost. All five hosts now carry a portrait and the
 * avatar needed no edit at all: it is the same SpeakerAvatar the
 * presenter cards use and it already preferred `image` over the monogram.
 * The biography block still renders when `bio` is a non-empty array and
 * renders NOTHING otherwise, which is the state all five are in — no
 * placeholder, no "biography to follow", because a line of type
 * apologising for itself is worse than a card that stops after the role.
 *
 * The one thing that did change is the line below, and it is a data
 * question rather than a layout one. See it.
 */
function HostBody({ host }: { host: Host }) {
  const label = host.title ? `${host.title} ${host.name}` : host.name;

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
      {host.bio && host.bio.length > 0 ? (
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
  /* Only Eld. Ken Ochuka has a speaker page today. Linking the card that
     has somewhere to go and not the four that do not is the honest
     arrangement: a card that looks clickable and is not is worse than a
     row where one card is a link. The link states are copied from
     SpeakerCard rather than reinvented. */
  if (host.speakerId) {
    return (
      <Link
        href={`/speakers/${host.speakerId}`}
        className={`${PERSON_CARD} ${PERSON_CARD_INTERACTIVE}`}
      >
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
