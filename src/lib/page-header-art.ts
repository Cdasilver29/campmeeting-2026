import { PLUM_DEEP, PLUM_WARM, SCRIM_ALPHA_FLOOR } from "@/lib/hero";

/**
 * The photograph behind a page-header band, and the scrim that makes type
 * survivable on top of it.
 *
 * ── THE SHAPE OF THE PROBLEM, WHICH IS NOT THE HERO'S ────────────────
 *
 * The band is short and full-bleed. Measured on the built page, the same
 * five widths everything else here is measured at:
 *
 *   route                 390      768      1024     1440     1920
 *   /schedule           390x269  768x286  1024x286 1440x286 1920x286
 *   /faq                390x345  768x403  1024x403 1440x403 1920x403
 *   /ministries/health  390x357  768x350  1024x350 1440x350 1920x350
 *
 * So the crop runs from about 1.09:1 on a phone to 6.71:1 at 1920. At the
 * wide end `object-fit: cover` keeps only 25% to 33% of a source's HEIGHT;
 * at 390 it keeps the full height and crops the WIDTH to about 78%. Those
 * are two different questions and `position` below has to answer both.
 *
 * The band height is not negotiable and is not touched by any of this:
 * the image and both scrims are absolutely positioned, so they contribute
 * nothing to layout, and the band goes on being as tall as its own
 * padding and its own type make it.
 *
 * ── WHY THE SCRIM COVERS THE WHOLE BAND ──────────────────────────────
 *
 * The hero's two scrims are sized to the boxes they protect and leave the
 * middle of the frame untouched, because in a 88svh frame there IS a
 * middle with no type in it. There is no such middle here. The band's own
 * padding is 3rem, rising to 4rem at md, so on a 286px band the type
 * block reaches to within 64px of both edges — the type IS the middle.
 * Sizing a scrim "to the box it protects" therefore means the whole band,
 * and saying otherwise would be quoting the hero's shape rather than
 * applying its method.
 *
 * What is kept from the hero is the part that matters: the same two inks,
 * the same derived alpha floor, and the same warm-at-the-outer-edge,
 * cool-as-it-eases-in direction. Two scrim elements, not one, and they
 * ABUT at the middle rather than overlapping — two 0.66 layers on top of
 * each other composite to 0.88, which is a third alpha nobody chose.
 *
 * ── THE ALPHA IS THE HERO'S, AND IT IS ENOUGH ────────────────────────
 *
 * SCRIM_ALPHA_FLOOR is 0.66, derived in hero.ts against a PURE WHITE
 * pixel. Composited over white, white type measures:
 *
 *   PLUM_DEEP at 0.66   rgb(114, 99,133)   5.49:1
 *   PLUM_WARM at 0.72   rgb(122, 87,101)   6.22:1
 *
 * Both clear 4.5:1 with margin, and a pure white pixel is the worst case
 * any of these photographs can present. The outer edges take 0.72 rather
 * than the floor because that is where a band meets the page surface
 * above and below it, and the extra is what stops the join reading as a
 * seam.
 *
 * ── THE TYPE GOES WHITE, INCLUDING THE EYEBROW ───────────────────────
 *
 * A band with a photograph carries white type in both colour schemes,
 * the way the hero does. The eyebrow cannot stay accent-600: Grapevine
 * over this scrim is about 1.3:1, which is the same measurement that put
 * the hero's kicker in white. Warm was the other candidate, since the
 * share card uses it as an eyebrow on the poster plum and clears 4.81:1
 * there — but the card's ground is SOLID Grapevine, and over a 0.66 scrim
 * on a white pixel Warm measures 2.87:1 and fails. Making it pass needs
 * about 0.85 alpha, at which point there is no photograph left to have
 * put behind the band. So: white, and hierarchy from size and weight.
 */

export interface PageHeaderImage {
  /** Site-relative path under public/headers, or the shared hero photo. */
  src: string;
  /** Intrinsic size of the file on disk, for next/image. */
  width: number;
  height: number;
  /**
   * CSS `object-position`. Chosen per page against the short, wide crop
   * described above, and recorded with what it keeps.
   */
  position: string;
  /** What survives the crop at 1920. Documentation, not rendered. */
  keeps: string;
  /**
   * `"whole"` makes the band take THIS IMAGE'S aspect ratio instead of the
   * standard short band, so the photograph is shown entire and uncropped at
   * every width. One route uses it: /contact, where the picture is the
   * church itself and is doing wayfinding rather than decoration — a reader
   * who has never been to 5th Ngong Avenue needs to recognise the building,
   * and a 28%-of-the-height strip of its roofline does not let them.
   *
   * The consequence is deliberate and is not small: /contact's band is
   * 1130px tall at 1920 against every other band's 213-403px. Sizing the
   * band to the image is chosen over `object-contain`, which would have
   * kept the standard height and put empty letterbox bars above and below
   * the picture — a band that looks like a loading state.
   *
   * `position` is unused when this is set. Nothing is cropped, so there is
   * no crop to position.
   */
  fit?: "whole";
}

/*
 * Two scrims, both anchored to an edge, each covering half the band and
 * meeting at 0.66 in the middle so there is no seam. Written as
 * background images rather than as a Tailwind gradient because the stops
 * are measured values, and a class name assembled from them is a class
 * Tailwind never generates.
 */
const FLOOR = SCRIM_ALPHA_FLOOR;
const EDGE = 0.72;

export const HEADER_SCRIM_TOP = `linear-gradient(to bottom, rgba(${PLUM_WARM}, ${EDGE}) 0%, rgba(${PLUM_WARM}, 0.69) 45%, rgba(${PLUM_DEEP}, ${FLOOR}) 100%)`;

export const HEADER_SCRIM_BOTTOM = `linear-gradient(to top, rgba(${PLUM_WARM}, ${EDGE}) 0%, rgba(${PLUM_WARM}, 0.69) 45%, rgba(${PLUM_DEEP}, ${FLOOR}) 100%)`;

/**
 * The scrim for a `fit: "whole"` band, and it is the HERO's technique
 * rather than this file's.
 *
 * The two above cover half the band each and meet in the middle, and the
 * reason is stated at the top of this file: on a 286px band the type IS the
 * middle, so a scrim sized to the box it protects is a scrim over the whole
 * band. That argument is exactly false on a band that is 1130px tall. There
 * the type is the top 190px and the other 940px is the photograph the tall
 * band exists to show — scrimming all of it would be paying a page of
 * scrolling for a picture and then covering the picture.
 *
 * So this is the hero's top scrim: measured px stops, held at the floor for
 * as far as the type reaches, then eased out. Nothing protects the lower
 * frame because nothing is written there.
 *
 * Stops in px, not percentages, for the same reason the hero's are: what it
 * has to cover is the band's own padding plus a fixed number of lines of
 * type, which is a pixel height, while the element it is painted on is a
 * fraction of a viewport.
 *
 * 0.72 at the top edge rather than the 0.66 floor, matching EDGE above:
 * that is where the band meets the page surface, and the extra is what stops
 * the join reading as a seam. Held to 190px, which is the band's 4rem
 * padding plus the eyebrow, its margin and a 48px title. The ease below is
 * concave for the reason the hero's is — a straight ramp to zero terminates
 * with a derivative change that reads as a band edge across the photograph.
 */
export const HEADER_SCRIM_WHOLE = `linear-gradient(to bottom, rgba(${PLUM_WARM}, ${EDGE}) 0px, rgba(${PLUM_WARM}, 0.70) 120px, rgba(${PLUM_DEEP}, ${FLOOR}) 190px, rgba(${PLUM_DEEP}, 0.44) 232px, rgba(${PLUM_DEEP}, 0.24) 268px, rgba(${PLUM_DEEP}, 0.10) 296px, rgba(${PLUM_DEEP}, 0) 320px)`;

/**
 * `sizes` for the band's image.
 *
 * 100vw describes the box's WIDTH, and `cover` on a box this shape is
 * driven by its width at every width from 768 up. Below that it is not:
 * at 390 the tallest band on the site is 357px, so a source filling a
 * 390x357 box renders (357 x its aspect) wide, and the phone branch has
 * to ask for that rather than under-requesting by a third.
 *
 * 240vw, not the 165vw this used to carry, and the reason is the re-cut
 * files rather than a re-think. 165 was derived from the widest aspect
 * then present: a 1.786:1 source in a 390x357 box renders 638px, which is
 * 164vw. about, faq and family-life are now 1600x620, so 2.58:1, and the
 * tallest of their bands at 390 renders 921px — 236vw. Left at 165 the
 * three files this session made SHORTER would also have been served
 * softer, which is the opposite of the point.
 *
 * It is a cap, not a promise, and that is why raising it costs the other
 * eight nothing: seven of the ten sources are under 740px wide, so what
 * Next can serve is bounded by the file, and asking for 936 CSS px of a
 * 555px file returns the same 555px it returned before.
 */
export const HEADER_IMAGE_SIZES = "(max-width: 767px) 240vw, 100vw";

/*
 * ── THE FILES ────────────────────────────────────────────────────────
 *
 * Written by tools/assets/header-photos.mjs. Read the note at the top of
 * that script before changing a source: seven of the ten supplied files
 * are between 555 and 736 pixels wide, which is a real limit on this
 * band and not something a converter setting can fix.
 *
 * `position` is per page. The vertical half is what does the work from
 * 768 up, because that is where the crop starts throwing height away;
 * the horizontal half is what does it at 390.
 */
export const headerImages = {
  schedule: {
    src: "/headers/schedule.webp",
    width: 612,
    height: 328,
    // The sun sits at y 0.42 and the fingertips reach up to y 0.28. A
    // centred crop at 1920 keeps y 0.361-0.639 and takes the tops of the
    // fingers off; 45% moves the window to 0.347-0.625, which holds the
    // sun, the light between the hands and the fingers down to the palms.
    position: "50% 45%",
    keeps: "the sun between the hands and the fingers down to the palms; loses the fingertips and the grass",
  },
  speakers: {
    src: "/headers/speakers.webp",
    // 1492x865, q82, not resized: the 1600 cap is above it and nothing is
    // upscaled to reach a cap.
    width: 1492,
    height: 865,
    // 16%, and it is derived. Pr. Kennedy Mfune's head spans y 0.10 to 0.49
    // of this frame — 40% of its height — and the poster's plum diagonal
    // fills the left, which is where the page's left-aligned lockup sits.
    //
    // `object-position: 50% P` puts the visible window at
    // [P(1-k), P(1-k)+k], k being the fraction of the height `cover` keeps.
    // The band is 356px from md (see the note on /speakers/page.tsx for why
    // it takes extra padding), so:
    //
    //   width   k      window at P=0.16
    //   768     0.80   0.031 - 0.831   everything
    //   1440    0.43   0.092 - 0.518   the whole head, air above it
    //   1920    0.32   0.109 - 0.429   the head, chin to crown, no more
    //
    // At 50% the 1440 window was 0.287-0.713, which starts at his eyebrows.
    // Rendered and looked at, not inferred. Below md the band is taller in
    // aspect than the source, so the full height is kept and this value is
    // inert there.
    //
    // Horizontally centred, not pushed right, and that is a phone decision:
    // at 390 the band keeps almost the full width, and above md it keeps all
    // of it, so there is nothing for the horizontal half to choose. Pushed
    // right it would only start cutting the plum wedge the type reads on.
    position: "50% 16%",
    keeps: "the plum diagonal and Pr. Kennedy Mfune's head and shoulders; loses the lower half of the suit",
  },
  livestream: {
    src: "/headers/livestream.webp",
    width: 555,
    height: 260,
    // The lens is the subject and it is hard right: its rings centre on
    // x 0.87. At 390 the crop keeps 68% of the width, and centred that
    // window ends at x 0.84 — just short of the one thing in the frame.
    // 85% puts the window at 0.272-0.952 and the rings well inside it.
    position: "85% 50%",
    keeps: "the lens and its rings, and the nearest bank of bokeh; loses the far-left city lights on a phone",
  },
  ministries: {
    src: "/headers/ministries.webp",
    width: 735,
    height: 245,
    // 3:1 already, so this is the one source the band does not have to
    // crop hard: at 1920 it keeps 45% of the height. 45% rather than
    // centre holds the join between the clasped hands and the open page,
    // which is what the picture is of.
    position: "50% 45%",
    keeps: "the lower half of the clasped hands and the open Bible under them",
  },
  about: {
    src: "/headers/about.webp",
    // 1600x620, not 1600x1067. The 70% this page's position used to carry
    // is now baked into the file — see the `band` note in
    // tools/assets/header-photos.mjs. The band is never taller than 403px
    // and is full-bleed, so 447 of those 1067 rows were being thrown away
    // by `cover` before anything painted, and the three files that had
    // them were 425 KB of a 576 KB precached directory.
    width: 1600,
    height: 620,
    // 50% now, and it is doing real work rather than standing in for the
    // 70% it replaced: at 1920 a 2.58:1 file in a 403px band still has
    // `cover` keeping only 54% of its height, so this value still chooses
    // which 54%. Centred is right because the window itself was cut at
    // 70% of the source, which is where the open pages are.
    position: "50% 50%",
    keeps: "the open pages, their printed text and the gutter between them; on a phone it crops in to the gutter and the inner columns",
  },
  contact: {
    // The church photograph the home hero used to carry. It is still in
    // the repo, still precached, and costs nothing to reuse — and it was
    // always a better wayfinding picture than a home hero.
    src: "/hero/church.webp",
    width: 1634,
    height: 962,
    // WHOLE. This band takes the file's own 1.698:1 ratio, so nothing is
    // cropped at any width and `position` is inert — kept only because the
    // property needs a value and because the note below is worth keeping.
    //
    // What it replaces: `50% 31%`, which was the one position on the site
    // with a name in it. The green "NEWLIFE SDA CHURCH, NAIROBI" sign spans
    // y 0.29-0.38, and at 1920 a short band kept 28% of the height, so a
    // centred crop landed on the car park and the sign was gone. 31% put the
    // window at 0.221-0.499 to hold roofline, sign and the top of the
    // glazing — and lost the rest of the building.
    //
    // That was the best a 213px band could do, and the point of this page is
    // the opposite: someone who has not been to 5th Ngong Avenue is looking
    // at this picture to recognise the building when they arrive. So the
    // band grew to the photograph instead of the photograph shrinking to the
    // band.
    fit: "whole",
    position: "50% 31%",
    keeps: "the whole photograph, uncropped, at every width: the pitched roof, the green NEWLIFE SDA CHURCH sign, the glazed frontage end to end, the stone base course and the car park",
  },
  faq: {
    // 1600x620, cut at 50% of the source, which is where it was already
    // being read from.
    src: "/headers/faq.webp",
    width: 1600,
    height: 620,
    position: "50% 50%",
    keeps: "the Psalm 23 heading and the lines under it, which is the legible band of the frame",
  },
  downloads: {
    src: "/headers/downloads.webp",
    width: 736,
    height: 404,
    // Centred, the band lands on the shelf of closed books above the
    // desk. 58% drops it onto the open book and the pencil, which is
    // what a downloads page is about.
    position: "50% 58%",
    keeps: "the open book, its tabs and the pencil; loses the lamp and the top of the shelf",
  },
  "prayer-requests": {
    src: "/headers/prayer-requests.webp",
    width: 588,
    height: 306,
    // The hands are right of centre, x 0.48-0.85, against black. 62%
    // keeps their right edge on a phone, where the crop is tightest.
    position: "62% 50%",
    keeps: "the palms and fingers of the joined hands, and the black ground to their left",
  },
  health: {
    src: "/headers/health.webp",
    width: 736,
    height: 412,
    position: "50% 50%",
    keeps: "the body of the produce, from the greens on the left to the peppers on the right",
  },
  "family-life": {
    // 1600x620, cut at 52% of the source, which is the position this page
    // used to carry.
    src: "/headers/family-life.webp",
    width: 1600,
    height: 620,
    position: "50% 50%",
    keeps: "the stacked hands and the cuffs around them; on a phone it crops in to the two topmost hands",
  },
  "christian-education": {
    src: "/headers/christian-education.webp",
    width: 735,
    height: 414,
    position: "50% 50%",
    keeps: "the middle of the book stack and the clock face beside it",
  },
} as const satisfies Record<string, PageHeaderImage>;
