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
 * ── WHY IT IS NOT THE SESSION CARD ANY MORE ─────────────────────────
 *
 * It was `bg-surface ring-1 ring-line` — character for character the
 * session card's own treatment. So on the home page mid camp meeting,
 * "Next up" was a heading over a card indistinguishable from the twenty
 * five rows of "Rest of Tuesday" beneath it, and the page had two levels
 * of emphasis where it needed three. That is the whole of what "reads as
 * unstyled" was.
 *
 * Three levels now, each one step apart, and no new colour in any of
 * them:
 *
 *   happening now   2px solid primary ring, primary tint at 6%
 *   next up         1px primary ring at 20%, the neutral muted surface
 *   the timeline    1px --color-line, the plain surface
 *
 * The surface is `surface-muted`, not an accent tint. An accent tint was
 * tried and is wrong: primary at 6% over white computes to about #f4f1f7
 * and `accent-50` is #f2eff6, so a tinted upcoming card would have been
 * the SAME COLOUR as the live card and the top of the hierarchy would
 * have collapsed into its second step. Neutral for the surface, brand for
 * the hairline: the two cues stay independent and each says one thing.
 *
 * A ring rather than a border, still: a border participates in the box
 * and would push the padding in a pixel at each edge, leaving these cards
 * a pixel narrower than the session cards they sit above.
 */
export const UPCOMING_CARD =
  "rounded-card bg-surface-muted p-4 ring-1 ring-accent-500/20";

/**
 * The small label inside a card: the block name on Next Up, the day on On
 * Duty.
 *
 * Uppercase at 12px with tracking, in accent-600 — which is the colour
 * this site's page-header eyebrow already uses, so the label inside a
 * card and the label above a page are one convention rather than two. It
 * was `ink-muted`, which made it the same grey as the note underneath the
 * title and left the card with no top edge to read from.
 *
 * accent-600 is Grapevine in light and its lightened step in dark, and
 * both are text-safe on every surface these cards use. The ratios are in
 * the commit that introduced this.
 */
export const UPCOMING_EYEBROW =
  "text-xs font-medium tracking-wide text-accent-600 uppercase";

/**
 * The card's own heading.
 *
 * `text-lg`, the same step the live card takes, rather than the `text-base`
 * of a timeline row. These cards are answers to a question the reader
 * asked; a row in a list is not, and the size is the difference.
 * Straight off the existing type scale — no new size was introduced.
 */
export const UPCOMING_TITLE = "text-lg leading-6 font-semibold text-ink";
