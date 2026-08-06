/**
 * The home hero's photographic treatment, behind one switch.
 *
 * Set HERO_IMAGES to undefined and the whole photograph goes away: the
 * images, the scrims, the caption, the pause control. The hero falls back
 * to a solid Emperor band that is a deliberate treatment in its own right,
 * not a broken-looking gap. That is the point of the constant. The church
 * has not signed off on the hero photography in writing, and if they
 * decide against it the change has to be one line here rather than an
 * unpicking of the hero component.
 *
 * ── THREE IMAGES NOW, AND WHAT ROTATION DOES NOT TOUCH ───────────────
 *
 * The list rotates: background and caption only, crossfaded, six seconds
 * each. The theme, the key verse, the theme song, the dates, the venue and
 * the call to action are the hero's fixed content and do not move — that
 * block is the LCP element and rotation must not go near it.
 *
 * The FIRST entry is load-bearing in three separate ways and is therefore
 * the least interesting picture on purpose:
 *
 *   1. It is the only one with `priority`, so it is the only one preloaded
 *      and the only one that can delay the LCP.
 *   2. It is the only one rendered on the server, so it is what a reader
 *      with JavaScript off, or before hydration, sees.
 *   3. It is the ONLY one rendered under prefers-reduced-motion. The
 *      rotation stops dead there rather than slowing down: a slowed
 *      carousel is still a carousel.
 *
 * `caption` is present only on the two choir photographs, because a
 * caption is for a picture whose subject a reader could not otherwise
 * name. hands-bible has no caption and the caption line renders empty for
 * it, keeping its own height reserved so the rotation cannot shift layout.
 *
 * WHAT THE FIRST PHOTOGRAPH ACTUALLY IS, because the scrims below only make
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
  /**
   * One line naming what the photograph is of, shown only while that
   * photograph is on screen. Omitted where the picture needs no caption.
   */
  caption?: string;
  /**
   * CSS `object-position`. Per image, because these three are three
   * different compositions and one value cannot be right for all of them.
   *
   * The vertical half is what does the work, and the phase is why. In the
   * full-bleed phase the frame is close to the sources' own aspect and
   * `cover` throws away only a few percent of the height. In the COMPACT
   * phase the frame is 55-60svh — 2.67:1 at 1440 — so it keeps about half
   * the height, and centred that half is the middle of the picture. On a
   * photograph whose subject is a rank of singers standing at the top of
   * the frame, the middle of the picture is their waists.
   */
  position?: string;
  /**
   * Extra alpha added to BOTH of this image's scrims, where the measured
   * worst pixel needs it. Zero for every image that passes at the derived
   * floor, and it is meant to stay zero: the whole reason each image
   * carries its own pair of scrims is that a picture which fails can be
   * fixed without deepening the two that do not.
   *
   * Deepening a scrim is the only lever here. Knocking the type back from
   * pure white is not: white/80 over these pixels costs about a quarter of
   * the contrast and fails.
   */
  scrimBoost?: number;
};

/**
 * ROTATION TIMING, in one place because the caption's fade and the
 * image's fade have to agree exactly or the caption is briefly the wrong
 * caption for the picture behind it.
 *
 * 800ms of crossfade, 6000ms of dwell, so an image holds still for six
 * seconds and the transition takes another 0.8. The interval is the sum:
 * anything shorter overlaps the next fade with the current one.
 */
export const HERO_ROTATION = { fadeMs: 800, dwellMs: 6000 } as const;

/**
 * `sizes` for one hero image, derived from that image's own aspect ratio.
 *
 * Above md, 100vw is correct for all three: the frame is between 1.33:1 and
 * 1.78:1 and every source is wider in aspect than the frame is at every one
 * of those widths, so `cover` scales by WIDTH and the slot's width is what
 * the browser needs to know.
 *
 * Below md it is not, and this is where the three images stop agreeing. The
 * frame is 88svh tall and the viewport is narrow, so it is roughly 0.53:1
 * and `cover` scales by HEIGHT — the rendered image is far wider than the
 * slot, and by a factor that is the source's aspect ratio. On a 390x844
 * phone the frame is 743px tall, which is 190vw, so the rendered width is
 * 190 x aspect:
 *
 *   hands-bible  1.193:1  ->  227vw
 *   migori       1.807:1  ->  344vw
 *   taji         1.413:1  ->  269vw
 *
 * A single 190vw was there before, from when there was one image, and it
 * described the frame's HEIGHT rather than the rendered width — so it
 * under-requested even for hands-bible, by 1.19x. Deriving it per image
 * fixes that and is the only honest way to serve three different shapes
 * from one component.
 *
 * It is a cap, not a promise: hands-bible is 735px wide, so what Next can
 * serve for it is bounded by the file whatever this says.
 */
export const heroImageSizes = (image: HeroImage) =>
  `(max-width: 767px) ${Math.ceil((190 * image.width) / image.height)}vw, 100vw`;

export const HERO_IMAGES: HeroImage[] | undefined = [
  {
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
    //
    // It is also, now, the softest of the three and the one every visitor
    // sees. The two photographs under it are 1600px and 1491px wide. That
    // makes the request above more urgent rather than less: rotation put a
    // sharp picture next to a soft one in the same frame.
    width: 735,
    height: 616,
    // No caption. It is the poster's own photograph and there is no
    // subject a reader would want named; "clasped hands on a Bible" is a
    // description of what is plainly visible, which is the kind of caption
    // that teaches people not to read captions.
  },
  {
    src: "/hero/migori-choir.webp",
    // 1600x885 from a 1686x933 PNG, q82 effort 6. See
    // tools/assets/hero-photos.mjs.
    width: 1600,
    height: 885,
    // Centred, and checked rather than left as the default. This frame is
    // 1.807:1, so the compact phase keeps 68% of its height and a centred
    // window is y 0.162-0.838 — the choir's heads are at y 0.245-0.41 and
    // sit well inside it. Centring also drops the brightest part of the
    // picture: the top four twentieths of this file are the white hall
    // ceiling and its downlights, mean luminance 0.67 to 0.84.
    position: "50% 50%",
    caption: "Camp Meeting 2026 Guest Choir · Migori Central",
  },
  {
    src: "/hero/taji-choir.webp",
    // 1491x1055, not resized: the cap is 1600 and nothing is upscaled to
    // reach it.
    width: 1491,
    height: 1055,
    // 25%, not centred, and this is the one crop on the hero with a
    // measured window behind it. The five singers stand at the TOP of this
    // frame: heads and microphones span y 0.15 to 0.42, and the bottom
    // third is the foreground rank of graduation caps.
    //
    // `object-position: 50% P` puts the visible window at
    // [P(1-k), P(1-k)+k] where k is the fraction of the height `cover`
    // keeps. In the COMPACT phase at 1440 the frame is 2.67:1 against a
    // 1.413:1 source, so k = 0.53 — and centred that window is
    // y 0.235-0.765, which starts BELOW the singers' chins. Rendered and
    // looked at, not inferred: at 50% every face is cut off across the
    // forehead.
    //
    // 25% puts the window at y 0.118-0.648: every face complete, with
    // headroom above and the flags behind them. In the full-bleed phase
    // k = 0.88 so the same value costs nothing — the window is
    // y 0.029-0.912 and only the very edges go.
    position: "50% 25%",
    // ── NOT IN THE PROGRAMME ─────────────────────────────────────────
    // "Taji" appears nowhere in src/data/program.ts. Neither does Migori
    // Central. Draft_Program_v2 has no guest choir items at all, which is
    // the same staleness the four speakers with no sessions come from. The
    // caption is the artwork's word, not the programme's. DATA-NOTES.md.
    caption: "Camp Meeting 2026 Guest Choir · Taji",
  },
];

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
/*
 * A function of the per-image boost rather than a constant, since the hero
 * took three photographs. Each image carries its own pair of scrims, so an
 * image whose brightest pixel needs more alpha can have it without
 * deepening the two that measured fine — which is the whole reason the
 * scrims are per-layer rather than one pair over the stack.
 *
 * The boost is added only to the stops that are doing protection, never to
 * the ones easing out: adding alpha to a stop that is meant to be
 * invisible is how a fade acquires a visible edge. The last two stops are
 * left exactly where they are, and the ones between are lifted by half the
 * boost so the ramp does not get a kink in it.
 *
 * Clamped at 1 because `rgba(r,g,b,1.4)` is not a colour and browsers
 * discard the whole declaration, which would silently remove the scrim
 * that was being made stronger.
 */
const a = (base: number, boost: number) => Math.min(1, base + boost).toFixed(3);

export const heroScrimTop = (boost = 0) =>
  `linear-gradient(to bottom, rgba(${PLUM_DEEP}, ${a(0.66, boost)}) 0px, rgba(${PLUM_DEEP}, ${a(0.64, boost)}) 80px, rgba(${PLUM_WARM}, ${a(0.46, boost / 2)}) 104px, rgba(${PLUM_WARM}, ${a(0.26, boost / 2)}) 128px, rgba(${PLUM_WARM}, 0.10) 150px, rgba(${PLUM_WARM}, 0) 176px)`;

/** The unboosted top scrim, for anything that wants the string itself. */
export const HERO_SCRIM_TOP = heroScrimTop();

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
export const heroScrimBottom = (boost = 0) =>
  `linear-gradient(to top, rgba(${PLUM_WARM}, ${a(0.74, boost)}) 0%, rgba(${PLUM_WARM}, ${a(0.7, boost)}) 40%, rgba(${PLUM_DEEP}, ${a(0.68, boost)}) 70%, rgba(${PLUM_DEEP}, ${a(0.66, boost)}) 88%, rgba(${PLUM_DEEP}, ${a(0.44, boost / 2)}) 92%, rgba(${PLUM_DEEP}, 0.24) 95%, rgba(${PLUM_DEEP}, 0.10) 97.5%, rgba(${PLUM_DEEP}, 0) 100%)`;

/** The unboosted bottom scrim, for anything that wants the string itself. */
export const HERO_SCRIM_BOTTOM = heroScrimBottom();

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
 * ── THE CAPTION ROW MOVED BOTH OF THESE, AND FAILED TWO IMAGES FIRST ──
 *
 * The rotation added one line at the foot of the block — the caption and
 * the pause control — and its height is reserved whether or not the
 * photograph on screen has a caption, so that the rotation cannot shift
 * layout. That grew the footprint, and the footprint is what these two
 * numbers are:
 *
 *   phase=before    390    768    1440
 *   was (26rem)     323    310    336px
 *   now             341    358    380px
 *
 * 380px against a 416px scrim is 91% of it, and the curve only holds 0.66
 * to 88%. That is not a rounding matter: measured on the built page at
 * 1440, the taji photograph came out at **3.78:1, a real AA failure**, and
 * migori at 4.57:1, because the top of the caption row was sitting in the
 * part of the gradient that is designed to be fading out. hands-bible
 * passed at 6.50:1 only because its bottom two deciles are the dark
 * unlit ground.
 *
 * 28rem (448px) puts 380px back at 85%, which is inside the held section
 * with the same margin the block had before it grew. 27rem would have put
 * it at 88.0% — exactly on the boundary — and a floor that lands on its own
 * boundary is a floor that fails the next time a string wraps.
 *
 * The compact phase moves for the same reason: its footprint went 214px to
 * about 258px, which is past the whole of a 16rem (256px) scrim. 19rem
 * (304px) puts it at 85%, matching the full-bleed phase rather than being
 * chosen separately.
 */
export const HERO_SCRIM_BOTTOM_HEIGHT = {
  before: "28rem",
  compact: "19rem",
} as const;
