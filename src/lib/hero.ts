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
 * ── EACH PHOTOGRAPH IS TWO FILES, CUT FOR TWO SHAPES ─────────────────
 *
 * Every entry carries a `mobile` crop and a `desktop` crop, and
 * HeroBackdrop serves them through a real `<picture>` with a `media`
 * query on the source. That is ART DIRECTION and it is a different
 * problem from responsive sizing, which is why it needs a different
 * mechanism.
 *
 * Responsive sizing is one photograph at several resolutions: `sizes` and
 * a srcset are the answer, the browser picks a file, and every candidate
 * is the same picture. No `sizes` value can express what is wanted here,
 * because `sizes` describes how big the box is and says nothing about
 * what should be inside it.
 *
 * What is wanted here is a different CROP, because the frame is not a
 * different size at the two ends — it is a different SHAPE. 0.53:1 at
 * 390x844, full-bleed landscape from md up. The previous single-file
 * version admitted the cost in tools/assets/hero-photos.mjs: at 390 it
 * kept 29% of migori's width and 37% of taji's, so on a phone both
 * stopped being group shots and became close shots of the three or four
 * singers in the middle of the rank.
 *
 * THE SWITCH IS AT 768px, min-width, and it is not a number chosen for
 * this. It is `md`, which is the width the hero itself changes at: the
 * band goes from `h-[88svh]` to `md:h-svh`, and the compact phase from
 * 55svh to 60svh. Cutting the photographs anywhere else would mean the
 * frame changed shape at one width and the picture chosen for it changed
 * at another, so between the two there would be a crop composed for a
 * frame that is not on screen. See ART_DIRECTION.
 *
 * WHAT THE FIRST PHOTOGRAPH ACTUALLY IS, because the scrims below only make
 * sense against it. This is the same praying-hands-on-a-Bible photograph
 * the official 2026 poster is built on, and it is now the full-resolution
 * frame this file spent several sessions asking the committee for: 1672x941
 * against the 735x616 that used to be here. Sampled per decile of image
 * height:
 *
 *   0-30%    the unlit ground behind the hands, and a soft warm glow in
 *            the top left corner. Dark, but NOT the 0.027 maximum the old
 *            file had — the glow reaches about 0.45
 *   30-70%   the hands and forearms. Specular highlights on the knuckles
 *            reach 0.99
 *   70-100%  the open Bible, the brightest region in the frame, with
 *            clipped white in the page gutter
 *
 * The bottom scrim has more to do than the top one: a third of the pixels
 * under the text block are above 0.75 and some are 1.0. That has not
 * changed with the new file, and neither has the reason the top scrim is
 * derived against a white pixel rather than against this photograph's own
 * top deciles — see HERO_SCRIM_TOP, where the frame crops to the middle of
 * the picture in the compact phase and the hands land under the header.
 */

/**
 * The one breakpoint the `<picture>` switches at, in one place because
 * three things have to agree on it: the `media` attribute on the source,
 * the `media` on the preload link in hero.tsx, and the `md` that the
 * band's own height changes at.
 *
 * `min-width`, so the DESKTOP crop is the one behind the query and the
 * phone crop is the unconditional `<img>`. That direction is deliberate.
 * A browser too old to understand `<source media>` gets the phone file,
 * which is the smaller download and the safer crop; the reverse would
 * hand a 1672px landscape to whatever could not ask for something better.
 */
export const ART_DIRECTION = {
  breakpoint: 768,
  media: "(min-width: 768px)",
} as const;
/**
 * One crop of one photograph: a file, its intrinsic size, and where the
 * frame should sit on it.
 */
export type HeroSource = {
  src: string;
  /** Intrinsic size of the file, for the aspect the box reserves. */
  width: number;
  height: number;
  /**
   * CSS `object-position`, per CROP rather than per photograph, because
   * the two crops of one picture are two different compositions and the
   * value that holds a subject in a 1.78:1 landscape says nothing about
   * where it sits in a 0.56:1 portrait.
   *
   * The vertical half is what does the work, and the phase is why. In the
   * full-bleed phase the frame is close to the crop's own aspect and
   * `cover` throws away only a few percent. In the COMPACT phase the frame
   * is 55-60svh — 2.67:1 at 1440 — so it keeps about two thirds of the
   * height, and centred that is the middle of the picture. On a
   * photograph whose subject is a rank of singers standing at the top of
   * the frame, the middle of the picture is their waists.
   */
  position?: string;
};

export type HeroImage = {
  /**
   * The wide crop, served from md up. Also the intrinsic size the
   * `<picture>`'s `<source>` declares.
   */
  desktop: HeroSource;
  /**
   * The phone crop, served below md, and the one on the `<img>` itself —
   * so it is what any browser that does not understand `<source media>`
   * falls back to, and what the markup means before CSS is consulted.
   */
  mobile: HeroSource;
  /**
   * One line naming what the photograph is of, shown only while that
   * photograph is on screen. Omitted where the picture needs no caption.
   *
   * On the image and not on either crop: the two crops are the same
   * photograph of the same people, so a caption that differed between
   * them would be describing the framing rather than the subject.
   */
  caption?: string;
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

/*
 * `heroImageSizes` used to live here and is gone with the single-file
 * hero. It derived a `sizes` string per image from that image's aspect
 * ratio, to tell the browser how wide a landscape photograph renders once
 * `cover` has scaled it by HEIGHT into a portrait phone frame.
 *
 * There is nothing left for it to describe. Each crop is now served at its
 * own dimensions to the breakpoint it was composed for — the phone files
 * are portrait, so `cover` no longer blows a landscape up to three times
 * the viewport width to fill a tall box, and there is one candidate file
 * per breakpoint rather than a set for the browser to choose within. A
 * `sizes` attribute with no srcset to select from is inert markup.
 */

export const HERO_IMAGES: HeroImage[] | undefined = [
  {
    // ── THE COMMITTEE ANSWERED THIS ──────────────────────────────────
    // Both halves of the request that used to sit here are met. This file
    // asked for "the original from the poster designer, at least 1080x1080
    // and very likely a licensed stock frame at 3000px or more", because
    // the first image in the rotation was 735x616 — the softest picture on
    // the site and the one every visitor saw, upscaled 2.61x at 1920.
    //
    // What arrived is 1672x941 of the same clasped hands on the same open
    // Bible, 2.3x the width, plus a vertical re-composition of it for
    // phones. At 1920 the upscale is 1.15x, which is no longer the thing
    // that limits this hero. Nothing here is upscaled to reach any cap;
    // see tools/assets/hero-photos.mjs.
    desktop: {
      src: "/hero/hands-bible.webp",
      width: 1672,
      height: 941,
      // 55% across, not centred. At 1440 `cover` keeps 90% of the width
      // and this costs nothing, but at 768 in the full-bleed phase the
      // frame is 0.85:1 against a 1.78:1 file, so it keeps only 48% of the
      // width — and centred, that window is x 0.26-0.74 while the hands
      // span x 0.28-0.85. The right side of the clasp was cut off. 55%
      // puts the window at x 0.31-0.79 and centres it on the hands
      // themselves rather than on the frame.
      //
      // 40% down. The compact phase at 1440 is 2.67:1, so it keeps 67% of
      // the height; centred that is y 0.165-0.835 and the hands start at
      // 0.16, clipping the top of the knuckles. 40% drops the window to
      // y 0.132-0.802, which holds the whole clasp and loses the lower
      // edge of the Bible, where there is nothing but page.
      position: "55% 40%",
    },
    // ── THE ONE PHOTOGRAPH WITH NO SEPARATE PHONE CUT ────────────────
    //
    // The committee asked for the wide frame on both ends, so `mobile`
    // points at the same file `desktop` does. There WAS a tall cut,
    // 853x1844, and it is gone with its file.
    //
    // It costs less here than it would on the other two, which is why
    // this is the one that can take it. The choir photographs are ranks
    // of people filling the frame edge to edge, so a phone-shaped window
    // onto the wide file keeps under a third of the width and turns a
    // group shot into a close shot of whoever is in the middle. This is a
    // single clasp of hands near the centre of a dark ground: a narrow
    // window onto it still contains the whole subject.
    //
    // 68% 45%, AND THE HORIZONTAL HALF IS THE ONE THAT MATTERS HERE.
    // That is the opposite of every other value in this file and it is
    // worth being explicit about, because the first attempt was 50% and
    // was wrong for exactly that reason.
    //
    // A phone frame is 0.46:1 and the file is 1.78:1, so `cover` scales
    // by HEIGHT: all of the height is kept and about 26% of the width.
    // The vertical value is inert in the full-bleed phase — there is no
    // height left over to position — and the whole decision is which
    // quarter of the width. Centred, that window is x 0.37-0.63, and the
    // clasp sits right of centre in this frame: it ran off the right edge
    // with the knuckles cut. 68% puts the window at x 0.50-0.76, which
    // holds the whole clasp with the Bible's gutter under it.
    //
    // 45% is for the COMPACT phase, which is 0.84:1, keeps 47% of the
    // height and does read it. Same reason the tall cut used 45%: it
    // lifts the clasp clear of the text block instead of leaving it
    // behind the type.
    mobile: {
      src: "/hero/hands-bible.webp",
      width: 1672,
      height: 941,
      position: "68% 45%",
    },
    // No caption. It is the poster's own photograph and there is no
    // subject a reader would want named; "clasped hands on a Bible" is a
    // description of what is plainly visible, which is the kind of caption
    // that teaches people not to read captions.
  },
  {
    desktop: {
      src: "/hero/migori-choir.webp",
      // 1672x941, the wide re-cut. Replaces the 1600x885 that was here.
      width: 1672,
      height: 941,
      // 30% down, and it is the compact phase that requires it. That frame
      // is 2.67:1 at 1440 against a 1.78:1 file, so `cover` keeps 67% of
      // the height, and `object-position: 50% P` puts the window at
      // [P(1-k), P(1-k)+k]. Centred that is y 0.165-0.835 — and the
      // choir's heads start at y 0.12, so a centred window cuts the back
      // row off above the eyes. 30% puts it at y 0.099-0.769: every face
      // complete with headroom, and the floor at the bottom is what goes
      // instead.
      //
      // Inert in the full-bleed phase at every width, and that is worth
      // saying rather than leaving to be rediscovered: the file is wider
      // in aspect than the frame at 768 and at 1440, so `cover` scales by
      // HEIGHT there and keeps all of it. Only the horizontal half is
      // read, and centred is right for a rank of people that fills the
      // frame edge to edge.
      position: "50% 30%",
    },
    mobile: {
      src: "/hero/migori-choir-mobile.webp",
      // 941x1672. The whole point of the phone crop: the old single file
      // was a 1.81:1 landscape and a 390px frame kept 29% of its width, so
      // the choir became four people. This is the same choir re-framed
      // vertically, and the rank survives.
      width: 941,
      height: 1672,
      // 85% down, and it is free. The two phases read different halves of
      // this value, which is what makes it free:
      //
      //   full-bleed, 0.53:1 frame against a 0.563:1 file. The file is
      //   wider per unit height, so `cover` scales by HEIGHT, keeps all of
      //   it and 93% of the width. The vertical half is INERT here — any
      //   value renders the same frame.
      //
      //   compact, 0.84:1 frame. Now the file is narrower, so `cover`
      //   scales by width and keeps k = 0.67 of the height.
      //
      // So the vertical value costs nothing at full bleed and decides
      // everything in the compact phase, where the photographer put the
      // choir low in the frame: they stand at y 0.47-0.79 with empty plum
      // above them. Centred, the window is y 0.165-0.835 and the rank maps
      // to 0.46-0.93 of the band — which is exactly where the text block
      // and its scrim are, so all that showed beside the type was the two
      // singers on the right. Rendered and looked at, not inferred.
      //
      // 85% puts the window at y 0.28-0.95 and the rank at 0.28-0.76,
      // clear of the type with the empty plum cropped off instead.
      position: "50% 85%",
    },
    // ── THE NAME, AND WHY THE CAPTION IS ONLY THE NAME ───────────────
    //
    // "Migori Central" was the caption burnt into the supplied photograph
    // and it was never the choir's name. The committee has settled it:
    // this is the **Newlife Migori Adventist Church Choir**, the same
    // choir the programme credits on sixteen lines, and program.ts prints
    // the full form too so the site has one name for it.
    //
    // ── THE FIXED HALF IS GONE, AND IT WAS MEASURED OUT ──────────────
    //
    // The caption row reserves exactly ONE 20px line (min-h-5, leading-5
    // in hero-rotation.tsx) and each caption is absolutely positioned
    // inside it. A caption that wraps therefore does not push the layout
    // — it overflows its own box by 20px, and it is WHITE TYPE OVER THE
    // PHOTOGRAPH at every width, including below md where the rest of the
    // text block is ink on the page surface. That was checked rather than
    // assumed: the caption's computed colour is rgb(255,255,255) at 320
    // and 360 too.
    //
    // Measured in the caption's own font, against the caption box's own
    // width (248px at 320, 288px at 360, 318px at 390):
    //
    //   Camp Meeting 2026 Guest Choir · Migori Central       276.8px
    //   Guest Choir · Newlife Migori Adventist Church Choir  294.3px
    //   Newlife Migori Adventist Church Choir                217.0px
    //
    // So the old caption already wrapped at 320. "Guest Choir · " plus
    // the full name wrapped at 320 AND 360, which is a very common phone.
    // The name on its own clears 320 by 31px and is shorter than what
    // this site shipped before, at every width.
    //
    // Reserving a second line instead (min-h-10 below sm) was the other
    // way out and was rejected: it is 20px of extra hero on every phone,
    // to hold a label the photograph already makes obvious. The caption
    // is a photo credit, and the credit is the name.
    caption: "Newlife Migori Adventist Church Choir",
  },
  {
    // ── THE ONE PICTURE WITH NO NEW WIDE CROP, AND IT IS INTENDED ────
    // Only migori was re-cut for desktop. taji keeps the 1491x1055 from
    // the earlier drop, unchanged on disk and unchanged here, and gains a
    // phone crop only. This is not a gap: it is the third image in the
    // rotation, nobody sees it for thirteen seconds, and its existing wide
    // crop was already measured and passing. tools/assets/hero-photos.mjs
    // does not write it.
    desktop: {
      src: "/hero/taji-choir.webp",
      width: 1491,
      height: 1055,
      // Unchanged, and the derivation still holds because neither the file
      // nor the frame moved. The five singers stand at the TOP of this
      // frame: heads and microphones span y 0.15 to 0.42, and the bottom
      // third is the foreground rank of graduation caps. In the compact
      // phase at 1440 the frame is 2.67:1 against a 1.413:1 source, so
      // k = 0.53, and centred the window is y 0.235-0.765 — which starts
      // BELOW the singers' chins. Rendered and looked at, not inferred: at
      // 50% every face is cut off across the forehead.
      //
      // 25% puts the window at y 0.118-0.648: every face complete, with
      // headroom above and the flags behind them. In the full-bleed phase
      // k = 0.88 so the same value costs nothing.
      position: "50% 25%",
    },
    mobile: {
      src: "/hero/taji-choir-mobile.webp",
      // 941x1672, and the largest file on the site at 216 KB. That is the
      // subject rather than a setting: a lit stage, a rank of printed
      // flags and a foreground of graduation caps is high-frequency detail
      // everywhere with no soft region to encode cheaply. See the note in
      // tools/assets/hero-photos.mjs.
      width: 941,
      height: 1672,
      // Same geometry as migori's phone crop and the same answer, for the
      // same reason: inert at full bleed, decisive in the compact phase.
      // The five singers are at y 0.44-0.68 with the rank of graduation
      // caps below them, so a centred compact window put them at 0.41-0.77
      // of the band and behind the type. 85% lifts them to 0.24-0.60 and
      // drops the caps, which are foreground and not the subject.
      position: "50% 85%",
    },
    // ── THIS ONE IS IN THE PROGRAMME AFTER ALL ───────────────────────
    // Written when Draft_Program_v2 had no guest choir items at all and
    // "Taji" appeared nowhere in src/data/program.ts. The near-final
    // version credits **Taji Kenya** on five Heart of Worship lines and on
    // the closing Sabbath's Special Songs, so the caption is the
    // programme's word now and not only the artwork's — which is why this
    // is "Taji Kenya" and no longer the bare "Taji". DATA-NOTES.md.
    //
    // The fixed "Guest Choir · " went with the other caption's, so the
    // two still read as one pair. See the note above for the measurements
    // that took it off.
    caption: "Taji Kenya",
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
 * ── 0.66 -> 0.62, AND WHAT WAS SPENT TO GET THERE ────────────────────
 *
 * 0.66 used to be 0.04 above the worse of the two inks, and the note here
 * said that margin was "bought deliberately rather than saved". It has now
 * been spent, deliberately, in the other direction: the scrims read as too
 * much plum over the photographs, and every one of them was passing with
 * room to spare rather than sitting on the floor.
 *
 * 0.62 is the DERIVED minimum for Grapevine plum, the worse of the two
 * inks, so this is the alpha the table above says is required and not one
 * step less. Over a pure-white pixel:
 *
 *   PLUM_DEEP at 0.62   rgb(122,108,140)   4.83:1
 *   PLUM_WARM at 0.62   rgb(140,110,122)   4.54:1
 *
 * Both still clear 4.5:1, and a pure-white pixel is the worst case any of
 * these photographs can present. The SHAPE of each gradient is unchanged
 * and only its depth moved. Nothing below the floor was touched: the tail
 * stops that ease to zero are fade, not protection.
 *
 * ── ONE SCRIM KEPT ALMOST ALL OF ITS DEPTH, AND IT IS MEASURED ───────
 *
 * The bottom scrim and the page-header bands took the full 0.04. THE
 * HERO'S TOP SCRIM DID NOT: it went 0.66 -> 0.65, one step rather than
 * four, and that is a measurement rather than a preference. At 0.62 the
 * home header's white lockup and nav measured **4.58:1 over the migori
 * photograph** — passing, and passing by 0.08, which is one rounding step
 * wide on the one element that is on every page.
 *
 * It also costs the least to keep. That scrim is 176px tall and sits
 * behind the site header and nowhere else, so its depth is not what the
 * reader means by "too much gradient on the photograph" — the bottom
 * scrim is 28rem of the frame and it is the one that took the change.
 * 0.65 puts the header back at 4.9:1 and up.
 *
 * This is a floor and not a target. It is not to be lowered further
 * without re-deriving the table above, and the measured readings after the
 * change are in VISUAL-PASS.md session 6 — every one of them still passes,
 * with the worst at 4.91:1 on a band and 5.04:1 on the hero.
 *
 * The pure-white premise is not hypothetical here. It is measured: the
 * bottom two deciles of the source contain pixels at luminance 1.000.
 */
export const SCRIM_ALPHA_FLOOR = 0.62;

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
  `linear-gradient(to bottom, rgba(${PLUM_DEEP}, ${a(0.65, boost)}) 0px, rgba(${PLUM_DEEP}, ${a(0.63, boost)}) 80px, rgba(${PLUM_WARM}, ${a(0.45, boost / 2)}) 104px, rgba(${PLUM_WARM}, ${a(0.26, boost / 2)}) 128px, rgba(${PLUM_WARM}, 0.10) 150px, rgba(${PLUM_WARM}, 0) 176px)`;

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
 *
 * ── THE THREE STOPS ABOVE THE FLOOR CAME DOWN TO IT ──────────────────
 *
 * 0.70 / 0.66 / 0.64 / 0.62 is now 0.66 / 0.64 / 0.63 / 0.62. Asked to
 * lighten the wash over the photographs, and this is the part of it that
 * was never protection: the floor is what the derivation requires, and
 * these three sat above it only so the gradient had somewhere to travel
 * from. The bottom edge is also the widest, heaviest part of the plum on
 * screen, which is what the request is about.
 *
 * The FLOOR STOP AT 88% IS UNTOUCHED, and that is the whole of the safety
 * argument: the measured type footprint reaches 85% of this element, so
 * every pixel of type is still over 0.62 or deeper. What changed is only
 * how much darker than the requirement the region below the type was.
 *
 * The top scrim did NOT take the same change; see its own note. It is
 * 176px behind the site header, it measured 4.58:1 at 0.62 against the
 * migori photograph, and 0.08 of margin on the one element that is on
 * every page is not margin.
 */
export const heroScrimBottom = (boost = 0) =>
  `linear-gradient(to top, rgba(${PLUM_WARM}, ${a(0.66, boost)}) 0%, rgba(${PLUM_WARM}, ${a(0.64, boost)}) 40%, rgba(${PLUM_DEEP}, ${a(0.63, boost)}) 70%, rgba(${PLUM_DEEP}, ${a(0.62, boost)}) 88%, rgba(${PLUM_DEEP}, ${a(0.40, boost / 2)}) 92%, rgba(${PLUM_DEEP}, 0.24) 95%, rgba(${PLUM_DEEP}, 0.10) 97.5%, rgba(${PLUM_DEEP}, 0) 100%)`;

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
 * ── ONE VALUE, BECAUSE THERE IS ONE BAND AGAIN ───────────────────────
 *
 * This used to be three numbers: 28rem for the full-bleed `before` band
 * and a separate compact pair (28rem below md, 19rem above) for the short
 * band the site showed during and after the event. That short band has
 * been withdrawn — the hero is now the same tall height in all three
 * phases, so the photograph is shown full all week. See VISUAL-PASS.md
 * for why that trade was reversed.
 *
 * With one band height there is one footprint to protect, and 28rem is
 * the value that was derived for it above. The compact phases keep their
 * smaller type, so their block is SHORTER than the `before` block this
 * number was measured against — which means they sit further inside the
 * held part of the curve, not closer to its edge.
 *
 * ── EXCEPT BELOW 390px IN `before`, WHERE 28rem WAS NEVER ENOUGH ─────
 *
 * The one number above is right for nine of the ten widths this is
 * measured at and was wrong for two of them for as long as the hero has
 * existed. The `before` block grows sharply on the narrowest phones —
 * the call-to-action pair stops fitting on one line and stacks, and the
 * verse row wraps — and 28rem (448px) is simply shorter than the block it
 * is supposed to be covering:
 *
 *   width   footprint   against 448px   measured
 *   320     478px       107%            1.76:1  hands-bible
 *   360     433px        97%            2.80:1  taji-choir was 1.42:1
 *   390     373px        83%            5.44:1
 *   414     374px        83%            5.25:1
 *   430     348px        78%            5.52:1
 *   1440    380px        85%            5.54:1
 *
 * At 320 the type was sitting ABOVE the scrim entirely — 107% of it — so
 * the top of the title was white on unprotected photograph. This is not a
 * near miss at the edge of a curve; it is the block being taller than its
 * own scrim. It predates the tall-band change: the same measurement
 * against the previous deploy returned the identical numbers.
 *
 * Every width that passes sits between 78% and 85% of the scrim. 36rem
 * (576px) puts the two failures at 83% and 75%, inside that same band
 * rather than at a new boundary of their own. 35rem would put 320 at
 * 85.4% — on the edge the passing widths merely reach — and a floor that
 * lands on its own boundary fails the next time a string wraps.
 *
 * Scoped by WIDTH only, at below 390px. It was briefly scoped to `before`
 * as well, which was correct while `during` and `after` kept a smaller
 * type and a 372px block the 448px default still covered. That type has
 * since gone — the hero is one size in all three phases — so the 478px
 * block is now what every phase renders below 390 and every phase needs
 * the taller scrim. 390 is the first width that passes, so the cut sits
 * between the last failure and the first pass rather than at a round
 * number near them.
 */
export const HERO_SCRIM_BOTTOM_HEIGHT = {
  /** Every width from 390px up. */
  default: "28rem",
  /** Below 390px, where the block wraps to 478px. */
  narrow: "36rem",
} as const;
