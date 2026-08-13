import type { HostLetter } from "@/data";
import { MEASURE } from "@/lib/typography";

/**
 * A host's welcome letter, set as a document.
 *
 * ── EVERYTHING HERE IS ABOUT LENGTH ──────────────────────────────────
 *
 * The five letters run from about 120 words to nearly a thousand, and a
 * layout that flatters one breaks the other. A card would hold
 * Pr. Nyangau's and be a wall for Eld. Oyoo's; a fixed-height block with
 * a "read more" would hide four fifths of the longest and do nothing at
 * all to the shortest.
 *
 * So it is set as prose at `--width-prose`, which is the site's own
 * measure — 68 characters, the same one /about and /faq read at. A long
 * letter is then simply a longer page, which is what a long letter is.
 * Nothing is truncated and nothing is behind a control.
 *
 * ── THE HEADINGS ARE REAL HEADINGS ───────────────────────────────────
 *
 * Eld. Oyoo's letter carries five of its own — "A Time to Reconnect with
 * God", "A Time for Fellowship", "A Time for Transformation", "Let Us
 * Make This Camp Special", "Conclusion". They are `h2`s, so they are in
 * the document outline and a screen reader can jump between them, which
 * is the whole reason he wrote them. Flattening them into bold
 * paragraphs, or into paragraphs at all, would have thrown away the
 * structure the writer put in.
 *
 * ── THE SIGNATURE ────────────────────────────────────────────────────
 *
 * Set apart by a rule and printed as SIGNED, which is not always the
 * display name — Dr. Gerald Mochoge signs "Dr. Mochoge Nyarega / Snr
 * pastor". A signature is the one part of a letter that is not the
 * site's to restyle. See host-letters.ts and DATA-NOTES.
 */
export function HostLetterBody({ letter }: { letter: HostLetter }) {
  return (
    <div className={`flex flex-col gap-4 ${MEASURE}`}>
      {letter.blocks.map((block, index) => {
        if (block.kind === "heading") {
          return (
            <h2
              key={`${block.kind}-${block.text}`}
              // mt on all but the first, so a heading is separated from
              // the paragraph above it by more than the paragraph gap.
              // The gap-4 above is the rhythm inside a section; this is
              // the rhythm between them.
              className={`font-display text-xl text-ink ${index > 0 ? "mt-4" : ""}`}
            >
              {block.text}
            </h2>
          );
        }

        if (block.kind === "list") {
          return (
            <ul
              key={`${block.kind}-${index}`}
              className="flex flex-col gap-1.5 text-ink-muted"
            >
              {block.items.map((item) => (
                <li
                  key={item}
                  // A marker drawn rather than a list-style, for the same
                  // reason the Medical Camp's lists draw theirs: an
                  // outside marker needs a left indent this measure has
                  // no room for, and `list-inside` puts the wrapped lines
                  // back under the bullet.
                  className="relative pl-5 leading-7 before:absolute before:top-3 before:left-1 before:size-1.5 before:rounded-full before:bg-ink-muted/60 before:content-['']"
                >
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`${block.kind}-${index}`} className="leading-7 text-ink-muted">
            {block.text}
          </p>
        );
      })}

      <p className="mt-4 flex flex-col gap-0.5 border-t border-line pt-4">
        <span className="font-medium text-ink">{letter.signature.name}</span>
        <span className="text-sm text-ink-muted">{letter.signature.role}</span>
      </p>
    </div>
  );
}
