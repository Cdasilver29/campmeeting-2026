/**
 * The home hero's photographic treatment, behind one switch.
 *
 * Set HERO_IMAGE to undefined and the whole photograph goes away: the
 * image, the scrims, the preload. The hero falls back to a solid navy
 * band that is a deliberate treatment in its own right, not a broken-
 * looking gap. That is the point of the constant. The church has not
 * signed off on using a photograph of the building in the hero, and if
 * they decide against it the change has to be one line here rather than
 * an unpicking of the hero component.
 *
 * WHAT THE PHOTOGRAPH ACTUALLY IS, because the scrims below only make
 * sense against it. Sampled per decile of image height:
 *
 *   0-20%    bright sky and cloud, mean luminance 0.41-0.45,
 *            10-19% of pixels above 0.75
 *   40-60%   the building, its roof and the green church sign,
 *            mean luminance 0.06-0.08 — the darkest, most legible band
 *   60-100%  the car park. Mean only 0.13-0.19, but it contains a white
 *            sedan, a chrome bumper and a white number plate, so maximum
 *            luminance still reaches 1.0 in isolated pixels
 *
 * That last line is the whole design constraint. The lower frame reads
 * dark on average and still holds blown-out specular pixels, so a scrim
 * sized off the average would fail behind a glyph that happens to land on
 * the white car.
 */
export type HeroImage = {
  src: string;
  /** Intrinsic size of the file, for next/image. */
  width: number;
  height: number;
};

export const HERO_IMAGE: HeroImage | undefined = {
  src: "/hero/church.webp",
  // 1634x962, converted from the supplied PNG at WebP q90 (2,674,440 ->
  // 420,772 bytes).
  //
  // This is smaller than the frame it now fills. At full bleed the CSS
  // upscale is 1.18x on a 1920 viewport and 1.57x on a 2560 one, before
  // device pixel ratio. See the note in src/features/home/components/hero.tsx:
  // a larger source is wanted, and the file is deliberately not upscaled
  // here to fake one.
  width: 1634,
  height: 962,
};

/**
 * The ink the scrims are painted in, as an "r, g, b" triplet so alpha can
 * vary per stop.
 *
 * Near-black, not the brand navy, for two reasons. Black is darker, so it
 * buys the same protection at a lower alpha and lets more of the frame
 * through. And it darkens without tinting, so the photograph keeps its own
 * colour instead of reading as a blue wash over the car park. Measured
 * over a pure-white pixel, the alpha each candidate needs before white
 * type reaches 4.5:1:
 *
 *   navy #052252   0.62
 *   #0b0f14        0.57
 *   pure black     0.54
 *
 * #0b0f14 rather than #000: it keeps a trace of the navy's hue, so the
 * scrim sits in the brand's family where it meets the flat --color-navy-900
 * fallback band, and it costs 0.03 of alpha against pure black to do it.
 */
const INK = "11, 15, 20"; /* #0b0f14 */

/**
 * The alpha any scrim must reach where white text sits.
 *
 * Derived, not chosen. #0b0f14 composited over a pure-white pixel has to
 * land at or below 0.1833 relative luminance for white to reach 4.5:1.
 * Solving for alpha over rgb(255,255,255):
 *
 *   0.54 -> 4.29:1  fail
 *   0.57 -> 4.55:1  pass, but the margin is one rounding step wide
 *   0.58 -> 4.71:1  the floor used below
 *   0.60 -> 5.05:1  pass
 *   0.62 -> 5.42:1  pass
 *
 * The pure-white premise is not hypothetical. Sweeping object-position
 * across eleven horizontal and five vertical crops (tools/perf/crop-sweep.mjs)
 * the brightest raw pixel inside the text block never drops below 0.97 at
 * 1024, 1440 or 1920, and is 0.99 at the default centre crop. There is no
 * crop of this photograph that puts the text over anything but white.
 */
export const SCRIM_ALPHA_FLOOR = 0.58;

/**
 * Top scrim: sits behind the site header and nowhere else.
 *
 * Stops are in px, not percentages, because what it has to cover is a
 * fixed-height header (--spacing-header, 5rem) rather than a fraction of a
 * frame that changes height with the phase. Holds the 0.58 floor with
 * margin through the full 80px of the header box, then eases out by 176px
 * so there is no edge across the sky.
 *
 * Only as heavy as the header needs. The old navy version opened at 0.85
 * and was still at 0.72 under the nav; it was sized to a floor of 0.63 in
 * a darker-tinting ink, and it flattened the top fifth of the sky to do
 * it.
 */
export const HERO_SCRIM_TOP = `linear-gradient(to bottom, rgba(${INK}, 0.62) 0px, rgba(${INK}, 0.60) 80px, rgba(${INK}, 0.44) 104px, rgba(${INK}, 0.24) 128px, rgba(${INK}, 0.10) 150px, rgba(${INK}, 0) 176px)`;

/**
 * Bottom scrim: covers the text block and its own padding, and stops.
 *
 * Stops run across the scrim element's own height, and the element's
 * height decides how much of the frame is covered. Those two must not
 * both be fractions of the frame — a 45%-tall element whose gradient also
 * ended at 45% died at 19% of the frame and left the top of the title
 * bare, which is how the first version of this measured 2.12:1.
 *
 * The curve holds 0.58 or better to 85% of the element, which is where the
 * measured type footprint reaches (352px of a 416px element at every width
 * from 1024 up), and eases out over the remaining 62px. The ease is
 * concave on purpose: a straight ramp to zero terminates with a visible
 * derivative change that reads as a band edge across the photograph,
 * whereas dropping fast and then trailing puts the last, most noticeable
 * part of the transition below 0.10 alpha where nothing can be seen.
 */
export const HERO_SCRIM_BOTTOM = `linear-gradient(to top, rgba(${INK}, 0.62) 0%, rgba(${INK}, 0.60) 60%, rgba(${INK}, 0.58) 85%, rgba(${INK}, 0.42) 90%, rgba(${INK}, 0.24) 94%, rgba(${INK}, 0.10) 97%, rgba(${INK}, 0) 100%)`;

/**
 * How tall the bottom scrim is, per phase.
 *
 * A percentage of the frame is the wrong unit and the old `max(45%, 26rem)`
 * was mostly paying the percentage. What the scrim exists to cover is the
 * text block, and the text block is type: its height is a number of pixels
 * that changes with the breakpoint, not with the height of the viewport.
 * Measured footprints, from the bottom of the frame to the top of the h1
 * and including the block's own bottom padding:
 *
 *   390   290px      1440  352px
 *   768   236px      1920  352px
 *   1024  325px      2560  352px
 *
 * So 26rem (416px) covers the worst case with 64px left over for the
 * fade, and a flat rem value stops the scrim growing with the frame. That
 * is the whole of the coverage saving on a large display: at 2560 the old
 * rule painted 648px of scrim to protect 352px of type.
 *
 * The compact phase is the same calculation against its smaller type,
 * whose footprint measures 154px at every width except 390, where the
 * title takes a second line and it reaches 180px.
 */
export const HERO_SCRIM_BOTTOM_HEIGHT = {
  before: "26rem",
  compact: "15rem",
} as const;
