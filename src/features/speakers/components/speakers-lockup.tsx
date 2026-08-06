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
    // gap-2 rather than the band's usual mt-3 / mt-6 rhythm, because these
    // four lines are one lockup and not a title with things under it. The
    // rule is absent for the same reason: there is nothing here to separate.
    <div className="flex flex-col gap-2 text-white">
      {/* The same treatment the site's eyebrow has everywhere else, so this
          line reads as the label it is rather than as small type. */}
      <p
        data-header-line="role"
        className="text-sm font-semibold tracking-[0.18em] uppercase"
      >
        {speaker.role ?? "Main Speaker"}
      </p>

      <p data-header-line="name" className="font-display text-2xl sm:text-3xl">
        {speakerLabel(speaker)}
      </p>

      {/* "Slightly larger than the rest", per the brief, and the display
          face because it is the theme — the same face and the same words the
          home hero sets. */}
      <p
        data-header-line="theme"
        className="font-display text-3xl text-balance sm:text-4xl"
      >
        {eventInfo.theme}
      </p>

      <p data-header-line="verse" className="text-base sm:text-lg">
        Key text: {eventInfo.keyVerse}
      </p>
    </div>
  );
}
