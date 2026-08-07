import Link from "next/link";
import type { Host } from "@/data";
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
 * ── NOTHING HERE HAS TO CHANGE WHEN THE PHOTOS ARRIVE ────────────────
 *
 * All five hosts render as initials monograms today and none has a
 * biography. Both are drawn from data the moment it exists: the avatar
 * is the same SpeakerAvatar the presenter cards use and already prefers
 * `image` over the monogram, and the biography block below renders when
 * `bio` is a non-empty array and renders NOTHING otherwise. No
 * placeholder, no "biography to follow" — a line of type apologising for
 * itself is worse than a card that simply stops after the role.
 */
function HostBody({ host }: { host: Host }) {
  const label = host.title ? `${host.title} ${host.name}` : host.name;

  return (
    <>
      <SpeakerAvatar speaker={host} size="lg" />
      <div className="flex flex-col gap-1">
        <p className="font-display text-lg leading-tight text-ink">{label}</p>
        {/* Not optional the way a speaker's role is. The office IS what
            puts someone on this list, so a host without one would be a
            data error rather than a card with a line missing, and the
            type makes it required. */}
        <p className="text-sm text-ink-muted">{host.role}</p>
      </div>
      {host.bio && host.bio.length > 0 ? (
        <div className="flex flex-col gap-2">
          {host.bio.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-6 text-ink-muted">
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}
    </>
  );
}

/** Shared by both branches so the two cannot drift apart visually. */
const CARD = "flex h-full flex-col items-start gap-4 rounded-card bg-surface p-5 ring-1 ring-line";

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
        className={`${CARD} transition-[background-color,box-shadow,translate] duration-fast ease-out-soft hover:-translate-y-px hover:bg-surface-muted hover:ring-ink-muted/30 active:translate-y-0 active:ring-2 active:ring-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500`}
      >
        <HostBody host={host} />
      </Link>
    );
  }

  return (
    <article className={CARD}>
      <HostBody host={host} />
    </article>
  );
}
