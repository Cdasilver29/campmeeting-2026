/**
 * The shared surface of the home page's clock-driven cards.
 *
 * Next Up, Next saved session and On Duty are siblings: one asks what is
 * about to happen, one what you asked to be reminded of, one who is
 * serving. They are the same kind of answer and they have to look it.
 * Before this file each of them carried its own class string, and On Duty
 * would have been a fourth copy waiting to drift.
 *
 * Everything visual about that family is here, so a change to the family
 * is a change to this file and to nothing else. That is the whole reason
 * it exists as its own module rather than as three exports from
 * session-card.tsx: it has no markup in it, and the cards that use it are
 * in three different files.
 */

/** The h2 above each card. */
export const SECTION_HEADING = "font-display text-2xl text-ink";

/**
 * The card itself.
 *
 * A hairline ring rather than a border: a border participates in the box
 * and would push the padding in by a pixel at each edge, which is what
 * made these cards sit a pixel narrower than the session cards below
 * them. `rounded-card` and `bg-surface` are the same tokens the session
 * card uses, so an upcoming card and a timeline card are the same object
 * at different emphases rather than two designs.
 *
 * NOT the now card's treatment. That one has a 2px accent ring and a
 * tinted ground, and it earns them by being the one card on the page
 * that is true this minute. A card about the next hour must not shout as
 * loudly as the card about this one.
 */
export const UPCOMING_CARD = "rounded-card bg-surface p-4 ring-1 ring-line";

/**
 * The small label inside a card: the block name on Next Up, the day on On
 * Duty, the shift heading's siblings.
 *
 * Uppercase at 12px with tracking, in muted ink. It is the only thing
 * above the card's own heading, so it has to read as a label rather than
 * as a first line of content, and case and tracking do that without
 * needing a colour of its own.
 */
export const UPCOMING_EYEBROW =
  "text-xs tracking-wide text-ink-muted uppercase";
