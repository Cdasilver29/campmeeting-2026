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

/*
 * The navy the scrims are painted in: --color-navy-900 #052252, as an
 * "r, g, b" triplet so alpha can vary per stop.
 */
const NAVY = "5, 34, 82";

/**
 * The alpha any scrim must reach where white text sits.
 *
 * Derived, not chosen. Navy composited over a pure-white pixel has to
 * land at or below 0.1833 relative luminance for white to reach 4.5:1.
 * Solving for alpha over rgb(255,255,255):
 *
 *   0.55 -> 3.72:1  fail
 *   0.60 -> 4.33:1  fail
 *   0.63 -> 4.52:1  pass, the floor
 *   0.65 -> 5.07:1  pass
 *   0.70 -> 5.97:1  pass
 *
 * Every stop that sits behind type is kept above 0.63 with margin, and
 * the gradients only fall below it above the type.
 */
export const SCRIM_ALPHA_FLOOR = 0.63;

/**
 * Top scrim: sits behind the site header and nowhere else.
 *
 * Stops are in px, not percentages, because what it has to cover is a
 * fixed-height header (about 68px) rather than a fraction of a frame that
 * changes height with the phase. Holds 0.72 through the header, then
 * fades out by 176px so there is no visible edge across the sky.
 *
 * Measured against the brightest composited pixel in the header's own box
 * at five widths: 5.91:1 at 390, 7.86:1 at 768, 7.78:1 at 1024, 7.86:1 at
 * 1440, 7.78:1 at 1920.
 */
export const HERO_SCRIM_TOP = `linear-gradient(to bottom, rgba(${NAVY}, 0.85) 0px, rgba(${NAVY}, 0.82) 48px, rgba(${NAVY}, 0.72) 76px, rgba(${NAVY}, 0.40) 120px, rgba(${NAVY}, 0) 176px)`;

/**
 * Bottom scrim: covers the car park and the text block over it, and stops.
 *
 * Stops run across the scrim element's own height, and the element's
 * height decides how much of the frame is covered. Those two must not
 * both be fractions of the frame — a 45%-tall element whose gradient also
 * ended at 45% died at 19% of the frame and left the top of the title
 * bare, which is how the first version of this measured 2.12:1.
 *
 * The curve holds above the 0.63 floor to roughly 80% of the scrim and
 * only then falls away, because the type occupies the lower three
 * quarters of it. Above that the photograph is untouched.
 */
export const HERO_SCRIM_BOTTOM = `linear-gradient(to top, rgba(${NAVY}, 0.95) 0%, rgba(${NAVY}, 0.93) 42%, rgba(${NAVY}, 0.88) 64%, rgba(${NAVY}, 0.76) 78%, rgba(${NAVY}, 0.44) 90%, rgba(${NAVY}, 0) 100%)`;

/**
 * How tall the bottom scrim is, per phase.
 *
 * A bare percentage cannot do this job. The text block is a fixed number
 * of pixels tall and the hero is not, so on a short viewport 45% of the
 * frame is shorter than the type standing in it. The full-bleed phase
 * therefore carries a px floor, which only engages below a 1024-tall
 * viewport and takes the scrim to at most 54% of the frame.
 *
 * The compact phase needs no floor because its type is smaller: 45% is
 * genuinely enough there, so the shorter hero does not end up with a
 * scrim across the whole of it.
 */
export const HERO_SCRIM_BOTTOM_HEIGHT = {
  before: "max(45%, 26rem)",
  compact: "45%",
} as const;
