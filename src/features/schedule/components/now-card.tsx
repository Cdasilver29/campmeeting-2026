import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { ministryLabels, type CurrentEntry } from "../lib/today";
import { ministryChipClasses } from "../lib/ministry-tone";
import {
  SECTION_HEADING,
  UPCOMING_EYEBROW,
  UPCOMING_TITLE,
} from "./card-styles";
import { LiveDot } from "./live-dot";
import { ENTRY_GRID, SessionCard, TimeRange } from "./session-card";

const sectionHeading = SECTION_HEADING;

/*
 * What makes the now card unmistakable, in one place because both
 * branches below have to look identical.
 *
 * Four cues, so none of them is doing the job alone: a 2px accent ring
 * where every other card has a 1px hairline, a tinted surface, the
 * heading's live dot, and the size of the title. Deliberately not a
 * shadow — the brief rules out oversized shadows and a ring reads as
 * emphasis at any elevation.
 */
const NOW_SURFACE = "bg-primary/[0.06] ring-2 ring-primary";

/**
 * The live indicator card: a timed session and an all-block activity are
 * the same thing to a reader ("what is on right now"), so they share a
 * heading and differ only in body. Shared by the Today view and the
 * livestream page, which both need "happening now" but must never
 * re-derive it independently.
 *
 * ── TWO PRESENTATIONS, BECAUSE THE TWO PAGES ASK DIFFERENT THINGS ────
 *
 * `heading` is the home page. There "Happening now" is news — the reader
 * did not come looking for it — so it gets a display-size heading and,
 * below the card, a way to go and watch it.
 *
 * `badge` is /livestream. There the live player is already the thing at
 * the top of the page, so a second display heading announcing the same
 * fact is repetition, and a "watch live" button under it points at the
 * player three inches above. It is ONE LINE: the pulsing dot, the words
 * "Live now", and nothing else — no display type, no block of its own, no
 * vertical space beyond the ordinary gap to the card under it.
 *
 * Still an `h2`, and that is deliberate rather than left over. The section
 * is named by `aria-labelledby="now-heading"`, so this element is the
 * accessible name of the whole live region; demoting it to a `span` to
 * make it look like a line would have left the section anonymous. It is a
 * heading that is set small, which is a styling decision, not a semantic
 * one.
 *
 * ── THE GREEN IS THE DOT AND ONLY THE DOT ────────────────────────────
 *
 * The obvious version of the badge sets the words in --color-live, which
 * is the brand's Tree Frog green. It was measured before it was written:
 * #448d21 is 4.14:1 on the page surface and white on it is 4.14:1 too,
 * both under the 4.5 floor. Its own token comment says "indicator fill
 * only" for this reason. So the green stays the pulsing dot, which is
 * decorative and carries no information alone, and the words stay ink.
 */
/**
 * The "Watch live" affordance, and why it is inside the card.
 *
 * ── IT REPLACES A BUTTON THAT WAS ALWAYS THERE ───────────────────────
 *
 * There used to be a separate "Watch this live" button under this card,
 * rendered whatever was on. On a Sunday morning that put it under the
 * Medical Camp — an untimed all-block activity that is not broadcast —
 * so the one control on the card promised a stream that did not exist.
 * The button is gone and the card itself is the target, but only when
 * there is genuinely something to watch.
 *
 * ── A STRETCHED LINK, NOT A WRAPPED CARD ─────────────────────────────
 *
 * The whole card is tappable, and it is done with one small link whose
 * `::after` covers the card rather than by wrapping the card in an
 * anchor. Wrapping would have made the link's accessible name the entire
 * contents of the card — the time, the block label, the title and every
 * presenter chip read out as one string. This way there is exactly one
 * link with exactly one name: "Watch live: Divine Service".
 *
 * It is safe because this card contains no other interactive element.
 * SessionCard's only control is the bookmark toggle in `meta`, and the
 * live card does not pass one; nothing else inside is a link or a button,
 * so there is no nested-interactive problem to create.
 *
 * The affordance is visible rather than a hover state, because the readers
 * who most need it are on phones and have no cursor: a filled chip with a
 * play glyph, in the card, saying what tapping does.
 */
function WatchLive({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      /* `after:` is what stretches the hit area over the whole card. It
         resolves against the nearest positioned ancestor, which is why the
         card is given `relative` below — without that it would size to
         this chip and the card would not be tappable at all. */
      className="inline-flex w-fit items-center gap-1.5 rounded-control bg-primary px-2.5 py-1 text-xs font-medium text-white transition-colors duration-fast ease-out-soft hover:bg-accent-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 after:absolute after:inset-0 after:rounded-card after:content-['']"
    >
      <PlayCircle aria-hidden className="size-3.5" />
      Watch live
      {/* The session's name, for a reader hearing the link out of
          context. Inside the link so it is part of its one name, and
          sr-only so the chip stays a chip. */}
      <span className="sr-only">: {title}</span>
    </Link>
  );
}

export function NowCard({
  current,
  variant = "heading",
  watchHref,
}: {
  current: CurrentEntry;
  /** `heading` on the home page, `badge` beside a live player. */
  variant?: "heading" | "badge";
  /**
   * Where "watch this" goes, when the caller wants the card to offer it
   * at all. The home page passes /livestream; /livestream itself passes
   * nothing, because the player is already three inches above the card.
   *
   * Passing it is a request, not a guarantee — an all-block activity
   * refuses it below. It is no longer conditioned on knowing which video
   * is live, because nothing on this site knows that any more: the
   * livestream page asks YouTube at the moment somebody presses play.
   */
  watchHref?: string;
}) {
  const badge = variant === "badge";
  /*
   * A timed session only, and this is now the WHOLE rule rather than one
   * half of it. An all-block activity — Sunday's Medical Camp, Friday's
   * Sabbath Preparation — is a period of the day rather than something
   * going out on a stream, and it is the case that produced the wrong
   * button in the first place. A link there would send a reader to a
   * player with nothing on it, which is the same "video unavailable"
   * confusion arriving by a different road.
   *
   * `current.kind` is the same discriminant that chooses which of the two
   * cards below to draw, so the card that says "this is a session" and
   * the card that is tappable are decided by one value and cannot drift
   * apart.
   */
  const live = watchHref && current.kind === "session" ? watchHref : undefined;

  return (
    <section
      aria-labelledby="now-heading"
      className={`flex flex-col ${badge ? "gap-2" : "gap-3"}`}
    >
      <h2
        id="now-heading"
        className={
          badge
            ? "flex items-center gap-2 text-sm font-medium leading-5 text-ink"
            : `flex items-center gap-2 ${sectionHeading}`
        }
      >
        <LiveDot />
        {badge ? "Live now" : "Happening now"}
      </h2>

      {current.kind === "session" ? (
        <SessionCard
          session={current.session}
          className={`${NOW_SURFACE} [&>h3]:text-lg${live ? " relative" : ""}`}
          footer={
            live ? (
              <WatchLive href={live} title={current.session.title} />
            ) : undefined
          }
        />
      ) : (
        <article
          className={`${ENTRY_GRID} rounded-card p-4 ${NOW_SURFACE}`}
        >
          <span className="flex min-h-6 items-center sm:col-start-1 sm:row-start-1">
            <TimeRange />
          </span>
          <span className={UPCOMING_EYEBROW}>{current.block.label}</span>
          <h3 className={UPCOMING_TITLE}>{current.activity.title}</h3>
          {current.activity.ministry ? (
            <p data-entry="ministry" className="flex flex-wrap gap-1.5">
              <span
                className={`inline-flex items-center rounded-control px-2 py-0.5 text-xs font-medium ${ministryChipClasses(current.activity.ministry)}`}
              >
                {ministryLabels[current.activity.ministry]}
              </span>
            </p>
          ) : null}
          {current.activity.note ? (
            <p className="text-sm text-ink-muted">{current.activity.note}</p>
          ) : null}
        </article>
      )}
    </section>
  );
}
