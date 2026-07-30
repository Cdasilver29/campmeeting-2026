/**
 * The two link treatments the site actually has, in one place.
 *
 * ACTION_LINK was written out identically in six files — /downloads, three
 * not-found routes, the schedule shell's "Clear filters" and the empty
 * saved-schedule view — and INLINE_LINK in three more. Six copies of a
 * class string is six places to miss when the height turns out to be
 * wrong, which is exactly what happened: every one of them measured 32px
 * tall, under the tap-target floor, on every phone width.
 *
 * The touch/pointer split is at lg rather than sm throughout the site: 768
 * and 820 are tablet portrait, and a finger is the safe assumption below
 * 1024.
 *
 * Written as complete literal strings. Tailwind finds class names by
 * scanning source text and never generates one assembled at runtime.
 */

/**
 * A standalone call to action set as a link: "Clear filters", "See the
 * full programme". 44px up to lg and the original 32px above it, the same
 * split the Input and the schedule selects use.
 */
export const ACTION_LINK =
  // w-fit, because as a flex item this stretched to the full column: a
  // 694px-wide link under a paragraph on /livestream, which is the same
  // mis-hit magnet the footer lockup was.
  "inline-flex w-fit min-h-11 items-center rounded-control px-2 text-sm font-medium text-primary underline-offset-4 transition-colors duration-fast hover:underline active:text-accent-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 lg:h-8 lg:min-h-0";

/**
 * A link inside a list of facts — a phone number, an address, an external
 * profile. Not running prose, so it takes a real target height; the
 * underline on hover is the half of the state change that does not depend
 * on colour.
 */
export const INLINE_LINK =
  "inline-flex min-h-11 w-fit items-center rounded-control underline-offset-4 transition-colors duration-fast hover:text-ink hover:underline active:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";
