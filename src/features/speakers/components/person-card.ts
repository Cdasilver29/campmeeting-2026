/**
 * The class strings shared by SpeakerCard and HostCard.
 *
 * Two grids of the same card on one page, and they have to stay the same
 * card. Before this the box, the hover contract and the type sizes were
 * written out twice, which is two copies of a decision and one of them
 * eventually drifts.
 *
 * Complete literal strings, never assembled: Tailwind finds class names
 * by scanning source text and would not generate one built at runtime.
 *
 * ── SIZED FOR TWO ACROSS A 320px PHONE ───────────────────────────────
 *
 * That is the width every value below is set by, because it is the
 * tightest the card is ever asked to be. The arithmetic:
 *
 *   320  viewport
 *  -40   shell gutter, 1.25rem each side
 *  -12   the grid's gap-3 between the two columns
 *   ÷2   = 134px per card
 *  -32   the card's own p-4, both sides
 *   =102px of content
 *
 * 102px is what the avatar, the name, the role and the last line have to
 * live in. At the previous p-5 and size-20 the avatar alone was 80 of
 * 92px and the names wrapped to three lines, so both step down below
 * `sm` and step back up at it. Nothing above `sm` changes at all.
 *
 * The longest unbreakable token in the data is "Discipleship" at 12
 * characters, about 70px at text-xs, so it fits without hyphenation. The
 * names break at their spaces and Janet Oyende-Kariuki's at its hyphen.
 * `break-words` on the name is the guard for a longer one arriving.
 */

/** The card box: same silhouette whether or not the card is a link. */
export const PERSON_CARD =
  "flex h-full flex-col items-start gap-3 rounded-card bg-surface p-4 ring-1 ring-line sm:gap-4 sm:p-5";

/**
 * Hover, active and focus, for the cards that are links.
 *
 * Three states, not one. Hover is a surface tint plus a 1px lift; active
 * puts the lift back and deepens the ring, so a press is confirmed before
 * the next page paints; focus-visible is the accent outline. The ring
 * moving is what makes the change legible without colour — the tint alone
 * is a two-percent shift a lot of screens will not show at all.
 *
 * No shadow: CLAUDE.md rules out the heavy drop-shadow card hover, and
 * the ring already reads as an edge.
 */
export const PERSON_CARD_INTERACTIVE =
  "transition-[background-color,box-shadow,translate] duration-fast ease-out-soft hover:-translate-y-px hover:bg-surface-muted hover:ring-ink-muted/30 active:translate-y-0 active:ring-2 active:ring-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";

/**
 * The name. text-base on a phone, where text-lg put every two-word name
 * onto three lines in a 102px column; text-lg from `sm`, which is what it
 * has always been.
 */
export const PERSON_CARD_NAME =
  "font-display text-base leading-tight break-words text-ink sm:text-lg";

/** The role or office, one step down from the name at both sizes. */
export const PERSON_CARD_ROLE = "text-xs text-ink-muted sm:text-sm";
