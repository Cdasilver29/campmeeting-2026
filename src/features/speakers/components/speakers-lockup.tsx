import { eventInfo, speakers } from "@/data";
import { speakerLabel } from "@/features/schedule/lib/presenters";

/**
 * The /speakers band's own statement, ranged left over the photograph:
 *
 *     Main Speaker
 *     Pr. Kennedy Mfune
 *     Obey and Live
 *     Key text: Isaiah 1:19-20
 *
 * It is the poster's lockup, which is what the supplied artwork behind it
 * is: a portrait cut onto the camp meeting's plum diagonal with room on the
 * left for exactly these four lines. Centring them, the way every other
 * band on the site centres its title, would have put them over his face and
 * left the plum wedge empty.
 *
 * ── NOTHING HERE IS TYPED OUT ────────────────────────────────────────
 *
 * Every one of the four lines is read from src/data. The theme and the key
 * text come from `eventInfo`, and the speaker's name and role come from the
 * speakers list by id — so the band cannot come to disagree with the hero,
 * the share cards, the JSON-LD or the speaker's own page, all of which read
 * the same two objects.
 *
 * The honorific comes from `speakerLabel`, the same helper the programme
 * rows, the speaker pages and the share cards use, so "Pr." is not typed
 * out here either.
 *
 * The name is looked up by id rather than taken as a prop, because "who the
 * main speaker is" is a fact about the event and not a decision this
 * component gets to make. If the committee replaces him, `event.ts` is the
 * one file that changes.
 *
 * ── "OBEY AND LIVE", NOT "OBEY AND BELIEVE" ──────────────────────────
 *
 * The brief for this band gave the theme as "OBEY AND BELIEVE". The poster
 * and `eventInfo.theme` both say **Obey and Live**, and both give the same
 * key text, Isaiah 1:19-20 — which is the verse "If ye be willing and
 * obedient, ye shall eat the good of the land", the text Obey and Live is
 * drawn from. So the two are not two candidate themes, they are one theme
 * and a misremembering of it, and the data wins. Flagged rather than
 * silently corrected: see VISUAL-PASS.md. The committee still owes a
 * written confirmation of the theme, which has been open since the first
 * session.
 *
 * ── NO h1 HERE ───────────────────────────────────────────────────────
 *
 * The page's h1 is "Speakers" and it now sits BELOW the band. These four
 * lines are paragraphs, not headings: they are a promotional lockup, and
 * making any of them a heading would put "Obey and Live" or a speaker's
 * name into the document outline of a page that is a list of eight people.
 * A screen reader still reads all four, in order, before the h1.
 */

/** The main speaker, by id. See the note above on why it is not a prop. */
const MAIN_SPEAKER_ID = "kennedy-mfune";

export function SpeakersLockup() {
  const speaker = speakers.find((s) => s.id === MAIN_SPEAKER_ID);
  if (!speaker) return null;

  return (
    /*
     * gap-2 rather than the band's usual mt-3 / mt-6 rhythm, because these
     * four lines are one lockup and not a title with things under it. The
     * rule is absent for the same reason: there is nothing here to separate.
     *
     * ── SET ONE STEP LARGER THAN IT WAS, AND A SECOND AT lg ───────────
     *
     * Every line moved up one size and gained an `lg` step it did not have
     * before. What it was competing with is why: the band is 480px tall at
     * lg and full-bleed, so a 30px name and a 36px theme sat in the middle
     * of a very large photograph and read as a caption on it rather than as
     * the poster's own statement.
     *
     * The RATIO between the four is unchanged — label, name, theme one step
     * above the name, verse — so the lockup still reads in the same order.
     * Only the whole thing is bigger.
     *
     * The phone steps are deliberately the conservative end. At 390 the
     * shell leaves about 350px, and "Pr. Kennedy Mfune" set at text-4xl
     * measures close to 306px before it starts breaking at its spaces; the
     * name is held at text-3xl there and takes its two larger steps at sm
     * and lg, where there is room. `text-balance` on the theme is what
     * handles the break if a longer theme ever arrives.
     *
     * The band's own height is a MIN-height, so it grows if this type ever
     * outgrows it rather than clipping. Re-rendered and re-measured after
     * the change: the crop still holds a complete head at all three widths
     * and contrast is unmoved.
     */
    <div className="flex flex-col gap-2 text-white">
      {/* The same treatment the site's eyebrow has everywhere else, so this
          line reads as the label it is rather than as small type. */}
      <p
        data-header-line="role"
        className="text-sm font-semibold tracking-[0.18em] uppercase sm:text-base"
      >
        {speaker.role ?? "Main Speaker"}
      </p>

      <p
        data-header-line="name"
        className="font-display text-3xl sm:text-4xl lg:text-5xl"
      >
        {speakerLabel(speaker)}
      </p>

      {/* "Slightly larger than the rest", per the brief, and the display
          face because it is the theme — the same face and the same words the
          home hero sets. */}
      <p
        data-header-line="theme"
        className="font-display text-4xl text-balance sm:text-5xl lg:text-6xl"
      >
        {eventInfo.theme}
      </p>

      <p data-header-line="verse" className="text-lg sm:text-xl">
        Key text: {eventInfo.keyVerse}
      </p>
    </div>
  );
}
