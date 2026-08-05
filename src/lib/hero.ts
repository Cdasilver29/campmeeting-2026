/**
 * The home hero's photographic treatment, behind one switch.
 *
 * Set HERO_IMAGE to undefined and the whole photograph goes away: the
 * image, the scrims, the preload. The hero falls back to a solid Emperor
 * band that is a deliberate treatment in its own right, not a broken-
 * looking gap. That is the point of the constant. The church has not
 * signed off on the hero photograph in writing, and if they decide
 * against it the change has to be one line here rather than an unpicking
 * of the hero component.
 *
 * WHAT THE PHOTOGRAPH ACTUALLY IS, because the scrims below only make
 * sense against it. This is the same praying-hands-on-a-Bible photograph
 * the official 2026 poster is built on. Sampled per decile of image
 * height, on the source file:
 *
 *   0-30%    the unlit ground behind the hands. Mean luminance 0.018 and
 *            a MAXIMUM of 0.027 — there is no bright pixel here at all
 *   30-70%   the hands and forearms. Mean 0.05-0.18, but the specular
 *            highlights on the knuckles reach 0.99
 *   70-100%  the open Bible. Mean 0.30-0.44, and between 15% and 30% of
 *            every row is above 0.75. Maximum 1.000 — the page gutter is
 *            clipped white
 *
 * The shape of that is the inverse of the church photograph this
 * replaced, and it changes what each scrim is for. The bottom scrim has
 * more to do than before, not less — a third of the pixels under the text
 * block are above 0.75 and some of them are 1.0.
 *
 * The deciles above are of the SOURCE FILE, and that distinction cost a
 * failing measurement once: they describe what sits at the top of the
 * frame only while the frame is taller in aspect than the 1.193:1 source.
 * At 60svh it is not, and the hands land under the header. See
 * HERO_SCRIM_TOP.
 */
export type HeroImage = {
  src: string;
  /** Intrinsic size of the file, for next/image. */
  width: number;
  height: number;
};

export const HERO_IMAGE: HeroImage | undefined = {
  src: "/hero/hands-bible.webp",
  // 735x616, converted from the supplied JPEG at WebP q92 effort 6
  // (34,203 -> 36,778 bytes). Not upscaled.
  //
  // ── COMMITTEE OWES THIS ──────────────────────────────────────────
  // This source is SMALL, and smaller than the one it replaces. The
  // church photograph was 1634x962; this is 735x616, which is 29% of the
  // pixels. On a phone that does not matter — see the phone frame in
  // hero.tsx, where even a 414x380 box at device pixel ratio 3 is asking
  // for 1242px of width and getting 735. On a desktop it is the single
  // thing that visibly limits the hero:
  //
  //   viewport   frame       upscale from 735x616
  //   1024x768   1024x768    1.39x wide, 1.25x tall
  //   1440x900   1440x900    1.96x
  //   1920x1080  1920x1080   2.61x
  //   2560x1440  2560x1440   3.48x
  //
  // The file is deliberately NOT upscaled here to disguise that; an
  // upscaled file is the same softness at four times the bytes. What is
  // wanted is the original from the poster designer, which will be at
  // least 1080x1080 (the poster is) and is very likely a licensed stock
  // frame at 3000px or more. Ask for the source, not the poster.
  width: 735,
  height: 616,
};

/**
 * THE TINT.
 *
 * The poster's ground is a dark plum, and sampling it gives values
 * between #4d2332 and #2f132b. Those are NOT brand colours and are not
 * treated as any: they are this same photograph already tinted and
 * flattened, so colour-picking them would be copying an output. The two
 * inks below are built from the two palette colours nearest that ground
 * — Emperor for the cool end, Grapevine for the warm — each taken 45% to
 * black, which is what puts them in the poster's range.
 *
 *   Emperor   #4b207f -> #291246   (poster cool end, cf. #2f132b)
 *   Grapevine #7f264a -> #461529   (poster warm end, cf. #4d2332)
 *
 * The scrims run BETWEEN the two rather than each being one colour at a
 * varying alpha, which is what gives the ground the poster's warm-to-cool
 * shift instead of a flat wash. Warm at the outer edge, cool as it eases
 * in, transparent at the end.
 *
 * The technique is unchanged from the last pass: two localised scrims,
 * each sized to the box it protects, and the middle of the frame
 * untouched. Only the ink changed.
 */
/*
 * Exported since the page-header bands took photographs of their own.
 * src/lib/page-header-art.ts builds its two scrims from these two
 * strings rather than from its own copy of the numbers — which is the
 * difference between the site having one plum and having two that agree
 * today.
 */
export const PLUM_WARM = "70, 21, 41"; /* #461529, Grapevine -> black 45% */
export const PLUM_DEEP = "41, 18, 70"; /* #291246, Emperor -> black 45% */

/**
 * The alpha the bottom scrim must reach where white text sits.
 *
 * Derived, not chosen, and re-derived for these inks: a plum is lighter
 * than the near-black #0b0f14 this replaces, so it needs more alpha to
 * buy the same protection. Measured over a pure-white pixel, the alpha
 * each ink needs before white type reaches 4.5:1:
 *
 *   #0b0f14 (old, near-black)   0.570
 *   #291246 (Emperor plum)      0.600
 *   #461529 (Grapevine plum)    0.620
 *
 * 0.66 is used, not 0.62. That is 0.04 above the worse of the two inks,
 * and the extra is bought deliberately rather than saved: white over a
 * clipped page gutter lands at 5.16:1 instead of 4.53:1, and the denser
 * ground is also what makes the lower frame read as the poster's plum
 * rather than as a photograph with a wash on it. On this photograph
 * there is no art-direction cost to paying it — the region under the
 * text block is the open Bible, not the subject.
 *
 * The pure-white premise is not hypothetical here. It is measured: the
 * bottom two deciles of the source contain pixels at luminance 1.000.
 */
export const SCRIM_ALPHA_FLOOR = 0.66;

/**
 * Top scrim: sits behind the site header and nowhere else.
 *
 * Stops are in px, not percentages, because what it has to cover is a
 * fixed-height header (--spacing-header, 5rem) rather than a fraction of
 * a frame that changes height with the phase.
 *
 * It runs deep-to-warm downward, the opposite direction to the bottom
 * scrim, so the two ends of the frame are not the same colour.
 *
 * ── WHY THIS IS NO LONGER THE LIGHT ONE ────────────────────────────────
 *
 * It used to hold 0.55 easing to 0.52 across the header, on the reasoning
 * quoted above the file: the top three deciles of this source have a
 * MAXIMUM luminance of 0.027, so white type over them is at 19:1 before
 * anything is painted, and the gradient was therefore almost entirely
 * tint rather than protection.
 *
 * That reasoning is true of the source file and false of the frame. It
 * assumes the top of the frame shows the top of the photograph, which
 * only holds while the frame is TALLER in aspect than the 1.193:1 source.
 * In the compact phase the frame is 60svh — 2.22:1 at a 1024x768
 * viewport — so `object-fit: cover` crops the height instead of the
 * width and centres what is left. The band that lands under the header is
 * then the middle of the image: the hands, whose specular highlights
 * reach 0.99.
 *
 * Measured on the built page, phase=during, white header type against the
 * brightest pixel under it: 4.45:1 at 1024, 4.49:1 at 1440 and 2560. A
 * real AA failure, present since the photograph was swapped in and missed
 * because the phase that exposes it was not re-measured then.
 *
 * So the top scrim is now derived the same way the bottom one is —
 * against a white pixel, because a white pixel is what can appear there —
 * rather than against the top of the source file. PLUM_DEEP needs 0.600
 * over pure white for white type to reach 4.5:1; 0.66 is used, matching
 * SCRIM_ALPHA_FLOOR, and held to 80px because that is --spacing-header.
 * Past the header there is nothing to protect and it eases out as before.
 *
 * The art-direction cost is close to nil. In the full-bleed phase the
 * pixels underneath are at luminance 0.027, and a plum at 0.66 over
 * near-black looks like a plum at 0.55 over near-black.
 */
export const HERO_SCRIM_TOP = `linear-gradient(to bottom, rgba(${PLUM_DEEP}, 0.66) 0px, rgba(${PLUM_DEEP}, 0.64) 80px, rgba(${PLUM_WARM}, 0.46) 104px, rgba(${PLUM_WARM}, 0.26) 128px, rgba(${PLUM_WARM}, 0.10) 150px, rgba(${PLUM_WARM}, 0) 176px)`;

/**
 * Bottom scrim: covers the text block and its own padding, and stops.
 *
 * Stops run across the scrim element's own height, and the element's
 * height decides how much of the frame is covered. Those two must not
 * both be fractions of the frame — a 45%-tall element whose gradient also
 * ended at 45% died at 19% of the frame and left the top of the title
 * bare, which is how the first version of this measured 2.12:1.
 *
 * The curve holds 0.66 or better to 88% of the element, which is where
 * the measured type footprint now reaches, and eases out over the
 * remainder. The ease is concave on purpose: a straight ramp to zero
 * terminates with a visible derivative change that reads as a band edge
 * across the photograph, whereas dropping fast and then trailing puts the
 * last, most noticeable part of the transition below 0.10 alpha where
 * nothing can be seen.
 *
 * Warm at the bottom edge, cool by the time it reaches the top of the
 * type. Both ends are above the floor, so the shift costs nothing.
 */
export const HERO_SCRIM_BOTTOM = `linear-gradient(to top, rgba(${PLUM_WARM}, 0.74) 0%, rgba(${PLUM_WARM}, 0.70) 40%, rgba(${PLUM_DEEP}, 0.68) 70%, rgba(${PLUM_DEEP}, 0.66) 88%, rgba(${PLUM_DEEP}, 0.44) 92%, rgba(${PLUM_DEEP}, 0.24) 95%, rgba(${PLUM_DEEP}, 0.10) 97.5%, rgba(${PLUM_DEEP}, 0) 100%)`;

/**
 * How tall the bottom scrim is, per phase.
 *
 * A percentage of the frame is the wrong unit. What the scrim exists to
 * cover is the text block, and the text block is type: its height is a
 * number of pixels that changes with the breakpoint, not with the height
 * of the viewport.
 *
 * Measured footprints, from the bottom of the frame to the top of the h1
 * and including the block's own bottom padding. Re-measured on the built
 * page now that the block carries the poster's theme, key verse and theme
 * song (tools/perf/verify-hero.mjs, the `footprint` column):
 *
 *   768   310px      1440  336px
 *   1024  323px      1920  336px
 *                    2560  336px
 *
 * The block gained two lines and got SHORTER at the wide end, 352px to
 * 336px, which is worth understanding rather than filing as luck. "Camp
 * Meeting 2026" at the top of the clamp is about 700px of type in a 42rem
 * measure, so it always took two lines: two lines of 88px display face.
 * "Obey and Live" is 13 characters and fits on one. Losing that line
 * releases about 90px, and the kicker and the verse line together cost
 * about 70px. The remaining +14px at 768, where the title never wrapped,
 * is the true cost of the new content.
 *
 * So 26rem (416px) still covers the worst case: 336px reaches 81% of the
 * scrim and the curve holds 0.66 to 88%. Unchanged, and measured rather
 * than assumed.
 *
 * The compact phase did NOT survive unchanged. Its footprint went 154px
 * to 214px — the compact title was already one line, so it paid for the
 * kicker and the verse without the wrap saving to offset them. Against
 * the old 15rem (240px) that is 89% of the scrim, just past where the
 * curve leaves 0.66, and it measured 4.72:1 at 1024 and 4.86:1 at 768:
 * passing, but on the wrong side of the design. 16rem (256px) puts the
 * footprint back at 84%.
 */
export const HERO_SCRIM_BOTTOM_HEIGHT = {
  before: "26rem",
  compact: "16rem",
} as const;
