/**
 * The class strings that set the reading pages as documents.
 *
 * /about, /faq, /downloads and /contact are prose, not interface, and they
 * were being laid out like interface: full-width paragraphs in a 48rem
 * column, headings a size apart from their body, and one flat gap between
 * everything. These four constants are the whole correction, kept here
 * rather than repeated per page so the four pages cannot drift into four
 * slightly different documents.
 *
 * Written as complete literal strings, because Tailwind finds class names
 * by scanning source text and would never generate one that was assembled
 * at runtime.
 */

/**
 * The measure, read from --width-prose rather than written as a literal
 * here. It is one half of the width system in globals.css and the shell is
 * the other; keeping the number in one place is what stops a document page
 * and a schedule page from disagreeing about how wide a line of text is.
 *
 * 68 characters is inside the 45-75 that typographic practice settles on,
 * and at --text-base it lands around 34rem — less than half the 80rem
 * shell the pages are now built in, which is what makes it do anything.
 */
export const MEASURE = "max-w-(--width-prose)";

/**
 * The container a document's sections sit in, so the headings, the rules
 * between sections and the paragraphs all share one left and right edge.
 *
 * This is the piece the old layout could not have: at a 48rem wrapper the
 * paragraphs were capped at 68ch and everything else ran to 48rem, which
 * is close enough to look like a mistake rather than a decision. At an
 * 80rem shell the difference would have been unmissable.
 */
export const PROSE_COLUMN = MEASURE;

/** A section heading: display face, and the space above it that separates sections. */
export const DOC_HEADING = "font-display text-2xl text-ink";

/**
 * Body copy. leading-7 rather than the 1.625rem the base scale sets:
 * --text-base--line-height is tuned for dense UI, and prose read at length
 * wants the extra quarter-line.
 */
export const DOC_BODY = `${MEASURE} leading-7 text-ink-muted`;

/**
 * The vertical rhythm of a document: one gap between a heading and its
 * paragraphs, a larger one between sections, and a hairline where a
 * section ends so the rhythm is visible rather than merely felt.
 */
export const DOC_SECTION = "flex flex-col gap-3";
export const DOC_STACK = "flex flex-col gap-12";
