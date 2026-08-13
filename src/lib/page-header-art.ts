import { PLUM_DEEP, PLUM_WARM, SCRIM_ALPHA_FLOOR } from "@/lib/hero";

/**
 * The photograph behind a page-header band, and the scrim that makes type
 * survivable on top of it.
 *
 * ── THE SHAPE OF THE PROBLEM, WHICH IS NOT THE HERO'S ────────────────
 *
 * The band is full-bleed, runs under the header, and now carries a
 * RESERVED height rather than being as tall as its own type. Measured on
 * the built page:
 *
 *   route                 390      768      1440
 *   /schedule           390x349  768x416  1440x480
 *   /faq                390x425  768x483  1440x483
 *   /ministries/health  390x437  768x430  1440x480
 *
 * See HEADER_BAND_HEIGHT below for those numbers and why they are what
 * they are. What matters HERE is what they did to the crop: it runs from
 * about 1.1:1 on a phone to 4.0:1 at 1920, where it used to reach 6.7:1.
 * At the wide end `object-fit: cover` keeps 43% to 75% of a source's
 * HEIGHT, against 25% to 33% before; at 390 it keeps the full height and
 * crops the WIDTH to between 36% and 72%, which is tighter than the 78%
 * the short band cropped to. Those are two different questions and
 * `position` below has to answer both — and several of the values below
 * were re-derived against the taller band and are marked where they were.
 *
 * The height is still not something the picture can move: the image and
 * both scrims are absolutely positioned, so they contribute nothing to
 * layout, and the band is exactly as tall as the reserved floor or as its
 * own type, whichever is greater.
 *
 * ── WHY THE SCRIM COVERS THE WHOLE BAND ──────────────────────────────
 *
 * The hero's two scrims are sized to the boxes they protect and leave the
 * middle of the frame untouched, because in a 88svh frame there IS a
 * middle with no type in it. There is no such middle here. The type is
 * centred in the band and the band is 304-483px, so the type is the
 * middle of it — and above the type is now the site header, which goes
 * transparent over these bands and whose white lockup and nav need the
 * same protection the type does. Sizing a scrim "to the box it protects"
 * therefore still means the whole band.
 *
 * The scrim's SHAPE is unchanged by the taller band. Its depth came down
 * separately and for its own reason: every stop is 0.04 lighter than it
 * was, because the wash read as too much plum over the pictures and every
 * string was passing with room to spare. See the alpha block below.
 *
 * What is kept from the hero is the part that matters: the same two inks,
 * the same derived alpha floor, and the same warm-at-the-outer-edge,
 * cool-as-it-eases-in direction. Two scrim elements, not one, and they
 * ABUT at the middle rather than overlapping — two 0.66 layers on top of
 * each other composite to 0.86, which is a third alpha nobody chose.
 *
 * ── THE ALPHA IS THE HERO'S, AND IT IS ENOUGH ────────────────────────
 *
 * SCRIM_ALPHA_FLOOR is 0.62, derived in hero.ts against a PURE WHITE
 * pixel, and it came down from 0.66 because the wash read as too much
 * plum over the photographs. Composited over white, white type measures:
 *
 *   PLUM_DEEP at 0.62   rgb(122,108,140)   4.83:1
 *   PLUM_WARM at 0.68   rgb(129, 96,109)   5.49:1
 *
 * Both clear 4.5:1, and a pure white pixel is the worst case any of these
 * photographs can present. 0.62 is the DERIVED minimum for the worse of
 * the two inks rather than a value picked to look right, so there is
 * nothing further to give here without re-deriving it. The outer edges
 * take 0.68 rather than the floor because that is where a band meets the
 * page surface above and below it, and the extra is what stops the join
 * reading as a seam.
 *
 * ── THE TYPE GOES WHITE, INCLUDING THE EYEBROW ───────────────────────
 *
 * A band with a photograph carries white type in both colour schemes,
 * the way the hero does. The eyebrow cannot stay accent-600: Grapevine
 * over this scrim is about 1.4:1, which is the same measurement that put
 * the hero's kicker in white. Warm was the other candidate, since the
 * share card uses it as an eyebrow on the poster plum and clears 4.81:1
 * there — but the card's ground is SOLID Grapevine, and over a 0.62 scrim
 * on a white pixel Warm measures 2.72:1 and fails. Making it pass needs
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
  /**
   * A SEPARATE PHONE CROP, served below md through a real `<picture>`.
   *
   * Optional, and eleven of the twelve bands leave it out. Those eleven go
   * on being one file through next/image with a `sizes` and a srcset,
   * which is the right mechanism for them: one photograph at several
   * resolutions, the browser picking a width.
   *
   * /speakers is the exception, and it is the exception because it is the
   * one band whose type is RANGED LEFT. Every other header centres its
   * block, so a subject centred in the frame reads at any width. This one
   * carries the poster's lockup on the left and needs the empty half of
   * the picture to stay on the left while the band goes from about 1:1 on
   * a phone to 4:1 at 1440 — and a single landscape file cropped down to a
   * phone puts Pr. Mfune underneath the words.
   *
   * That is art direction, and no `sizes` value can express it: `sizes`
   * describes how big the box is and says nothing about what should be
   * inside it.
   *
   * When this is present the band renders a `<picture>` instead, with the
   * WIDE crop behind a `min-width` media query and this one on the `<img>`
   * itself — so the smaller, safer file is what a browser that cannot
   * evaluate the query falls back to. The breakpoint is ART_DIRECTION in
   * src/lib/hero.ts, shared with the home hero so the two cannot drift.
   *
   * `position` here is this crop's own, applied through `--art-position`;
   * the outer `position` becomes the DESKTOP crop's. See the `.art-crop`
   * rules in globals.css for why both have to be custom properties rather
   * than an inline style.
   */
  mobile?: {
    src: string;
    width: number;
    height: number;
    position: string;
  };
}

/*
 * Two scrims, both anchored to an edge, each covering half the band and
 * meeting at the 0.62 floor in the middle so there is no seam. Written as
 * background images rather than as a Tailwind gradient because the stops
 * are measured values, and a class name assembled from them is a class
 * Tailwind never generates.
 */
/*
 * ── HOW FAR THE SCRIM COULD ACTUALLY COME DOWN ───────────────────────
 *
 * Asked to lighten these, and this is what the measurement allowed.
 *
 * FLOOR does not move, and that is not caution. 0.62 is the DERIVED
 * minimum in hero.ts for Grapevine plum to hold white type at 4.5:1 over a
 * pure white pixel, and the two replacement photographs put a pure white
 * pixel directly behind the type: /about measures its worst composite at
 * rgb(122,109,140), which is exactly PLUM_DEEP at 0.62 over 255, for
 * 4.78:1. One step lighter there is an AA failure on the title of a page,
 * and CLAUDE.md does not trade that for a nicer picture.
 *
 * EDGE does move, 0.68 -> 0.64, because the extra 0.06 at the two edges was
 * never protection. It is there so the join where the band meets the page
 * surface does not read as a seam, and it sits at the top and bottom of the
 * band where the plum is heaviest over the photograph and where the reader
 * is most likely to mean "too much wash". The mid stop follows it down,
 * 0.65 -> 0.63, so the ramp between edge and floor keeps its shape instead
 * of acquiring a step.
 *
 * What actually made these pictures better this session is not here: it is
 * that four of the sources went from 555-735px wide to 1600px, so the band
 * upscales them 1.20x where it used to upscale /livestream 3.46x. A scrim
 * at 0.62 over a sharp photograph looks like a scrim over a sharp
 * photograph; at 0.68 over a 3.46x upscale it looked like fog.
 */
const FLOOR = SCRIM_ALPHA_FLOOR;
const EDGE = 0.64;
/** Between EDGE and FLOOR, so the two ends do not meet in a step. */
const MID = 0.63;

export const HEADER_SCRIM_TOP = `linear-gradient(to bottom, rgba(${PLUM_WARM}, ${EDGE}) 0%, rgba(${PLUM_WARM}, ${MID}) 45%, rgba(${PLUM_DEEP}, ${FLOOR}) 100%)`;

export const HEADER_SCRIM_BOTTOM = `linear-gradient(to top, rgba(${PLUM_WARM}, ${EDGE}) 0%, rgba(${PLUM_WARM}, ${MID}) 45%, rgba(${PLUM_DEEP}, ${FLOOR}) 100%)`;

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
 * 0.64 at the top edge rather than the 0.62 floor, matching EDGE above:
 * that is where the band meets the page surface, and the extra is what stops
 * the join reading as a seam. Held to 190px, which is the band's 4rem
 * padding plus the eyebrow, its margin and a 48px title. The ease below is
 * concave for the reason the hero's is — a straight ramp to zero terminates
 * with a derivative change that reads as a band edge across the photograph.
 *
 * The 120px stop came down with EDGE, 0.66 -> 0.635, for the reason given
 * there: it is inside the held section and its job is the ramp's shape, not
 * protection. Everything from 190px on is unchanged — those stops are the
 * fade, and the whole of /contact's photograph is below them.
 */
export const HEADER_SCRIM_WHOLE = `linear-gradient(to bottom, rgba(${PLUM_WARM}, ${EDGE}) 0px, rgba(${PLUM_WARM}, 0.635) 120px, rgba(${PLUM_DEEP}, ${FLOOR}) 190px, rgba(${PLUM_DEEP}, 0.44) 232px, rgba(${PLUM_DEEP}, 0.24) 268px, rgba(${PLUM_DEEP}, 0.10) 296px, rgba(${PLUM_DEEP}, 0) 320px)`;

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

/**
 * The reserved height of a band that carries a photograph.
 *
 * ── WHY THESE BANDS GOT A HEIGHT AT ALL ──────────────────────────────
 *
 * Until now every one of them was exactly as tall as its own type plus the
 * band's padding — 176px to 403px depending on how many lines a page
 * happened to carry. That is the right rule for a band of flat colour and
 * the wrong one for a band of photograph, and it showed in two ways. The
 * picture was cropped to whatever the type left over: at 1440 /about kept
 * 32% of its source's height and /schedule 27%, which is a strip rather
 * than a picture. And two pages with the same photograph treatment were
 * different heights because one had a meta line, so the treatment did not
 * read as a treatment.
 *
 * ── THE NUMBERS, AND WHY THEY ARE NOT A FRACTION OF THE VIEWPORT ─────
 *
 *   below md   19rem   304px
 *   md         min(26rem, 50svh)
 *   lg         min(30rem, 55svh)
 *
 * The base value is a flat rem because a phone viewport is tall and a
 * fraction of it is the wrong unit: 50svh on a 390x844 phone is 422px,
 * which is half the screen given to a decorative band on the page that is
 * hardest to read on. **304px is a deliberate cut against the desktop
 * number**, per the brief — on a small screen reaching the content matters
 * more than the photograph. It still leaves 540px of content above the
 * fold at 390x844.
 *
 * The `min()` on the two upper steps is what keeps a short laptop honest.
 * 30rem is 480px, which is fine on a 1440x900 and is 62% of a 1024x768,
 * and a band taking nearly two thirds of the screen is the full-viewport
 * hero the brief rules out for a content page. The svh half caps it at
 * 422px there. svh rather than vh or dvh for the reason the hero uses it:
 * vh ignores mobile browser chrome, dvh changes as that chrome retracts
 * and would resize the band mid-scroll.
 *
 * Resolved: 304 / 416 / 422 / 480 / 480px at 390 / 768 / 1024 / 1440 /
 * 1920, against 176-403px before.
 *
 * ── min-height, NOT height, AND THAT IS LOAD-BEARING ─────────────────
 *
 * A fixed `height` clips. /faq at 390 carries an eyebrow, a two-line
 * title, a rule, a meta line and a paragraph of children, which is 249px
 * of type inside 96px of padding — more than 19rem holds. A band of
 * photograph that eats the last line of its own subtitle is a worse fault
 * than a band that is 40px taller than its neighbour.
 *
 * So this is a floor. Every band is at least this tall, the picture is
 * reserved at that height before anything loads, and the two pages that
 * need more take more. Nothing shifts either way: the type is
 * server-rendered, so its contribution is in the first paint too.
 */
export const HEADER_BAND_HEIGHT =
  "min-h-[19rem] md:min-h-[min(26rem,50svh)] lg:min-h-[min(30rem,55svh)]";

/**
 * Which route each of these photographs belongs to.
 *
 * It exists so `src/components/site-header.tsx` can answer one question
 * during SSR — "is there a photograph behind me on this route?" — without
 * importing `page-identity.ts`, which pulls the whole programme into the
 * client bundle for a header that needs a boolean.
 *
 * `satisfies Record<keyof typeof headerImages, string>` is the part that
 * stops this drifting: adding a photograph to `headerImages` without
 * saying which route it is on is a type error, not a page that quietly
 * keeps a solid header over its own picture.
 *
 * The dynamic routes are absent because they have no photograph:
 * /schedule/[day] and /speakers/[id] both carry flat bands. The three
 * ministry pages all have artwork, and so does /children, which used to
 * be the fourth of them and is now a top-level route -- the picture moved
 * with the page, and this map is the only place that had to be told.
 */
const HEADER_ROUTES = {
  schedule: "/schedule",
  speakers: "/speakers",
  livestream: "/livestream",
  ministries: "/ministries",
  about: "/about",
  contact: "/contact",
  faq: "/faq",
  downloads: "/downloads",
  health: "/ministries/health",
  "family-life": "/ministries/family-life",
  // Top-level since the children's ministry got a page of its own.
  children: "/children",
  "christian-education": "/ministries/christian-education",
} as const satisfies Record<keyof typeof headerImages, string>;

const PHOTO_HEADER_ROUTES: ReadonlySet<string> = new Set(
  Object.values(HEADER_ROUTES),
);

/**
 * True where the page-header band carries a photograph, and therefore
 * where the site header goes transparent at scroll 0. Exact match on the
 * pathname rather than a prefix rule, because the set is arbitrary: it is
 * whichever pages the committee has supplied artwork for.
 */
export function hasPhotoHeader(pathname: string): boolean {
  return PHOTO_HEADER_ROUTES.has(pathname);
}

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
    // 1600x854, replacing a 612x328 file. Same picture, and that is the
    // point: the old source was 612px wide against a full-bleed band that
    // wants 1920, so it was upscaled 2.61x by the browser. This one is
    // upscaled 1.20x, which is the same order as the home hero's own.
    src: "/headers/schedule.webp",
    width: 1600,
    height: 854,
    // Unchanged at 45%, re-checked against the new frame rather than
    // carried over. The fingertips reach up to y 0.29 and the sun sits at
    // 0.43. At 1920 `cover` keeps 47% of the height, so 45% puts the
    // window at 0.239-0.708: sky, both fingertips, the sun between them
    // and the palms. Centred it would start at 0.265 and clip the tips.
    position: "50% 45%",
    keeps: "the cupped hands from fingertips to the heels of the palms, with the sun between them and the cloud bank above; loses the wrists and the grass below them at 1920",
  },
  speakers: {
    // ── THE ONE BAND WITH TWO CROPS ─────────────────────────────────
    // A wide file and a phone file of the same portrait, chosen by a
    // `media` query on a real `<picture>`. See `mobile` on PageHeaderImage
    // for why this band and no other, and ART_DIRECTION in src/lib/hero.ts
    // for the breakpoint it shares with the home hero.
    //
    // The outer `src`, `width`, `height` and `position` are the DESKTOP
    // crop, served from md up and also the fallback the `<img>` would use
    // if `mobile` were removed.
    src: "/headers/speakers.webp",
    // 1600x900 from a 1672x941 supply, replacing the 1492x865 that was
    // here. Not cropped — 1.78:1 is already the shape the wide band paints
    // — only taken down to the 1600 ceiling every band file sits under.
    // The hero's copy of this same portrait keeps its 1672 because it is
    // full-bleed and is the LCP; here the upscale at 1920 is 1.20x either
    // way, so the exemption would buy nothing.
    width: 1600,
    height: 900,
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
    //
    // ── 16% -> 12%, re-derived for the taller band ──────────────────
    //
    // The band went from 356px to a reserved 480px at lg, so `cover` keeps
    // 57% of the source's height at 1440 where it kept 43%. A bigger window
    // starting at the same P reaches FURTHER DOWN, and at 16% the top of
    // that window moved from 0.092 to 0.069 while the bottom went from
    // 0.518 to 0.639 — so the extra height all landed on his suit and the
    // crown sat on the frame edge with no air above it.
    //
    //   width   k      window at P=0.12    rendered and looked at
    //   768     0.98   0.002 - 0.982       everything
    //   1440    0.57   0.052 - 0.622       crown clear of the edge, bow tie in
    //   1920    0.43   0.068 - 0.498       crown to chin, chin on the edge
    //
    // 8% was better at 1440 and cut the chin at 1920; 12% is the value that
    // holds a complete head at both. **1920 is still the tight one** — the
    // band is 4.0:1 there against a 1.777:1 source, and no position fits a
    // head into 44% of that height with room to spare.
    //
    // The value SURVIVES the new file rather than being carried over
    // untested: 1.777:1 against the old 1.725:1 is a 3% change in aspect,
    // and his head sits at y 0.10-0.40 here against 0.10-0.49 before, so
    // the window that held a crown at 12% still holds it with more air.
    // Re-rendered at all three widths, not inferred.
    position: "50% 12%",
    keeps: "the plum diagonal with the ghosted praying hands, and Pr. Kennedy Mfune from crown to bow tie, standing in the right third where the left-ranged lockup is not",
    mobile: {
      src: "/headers/speakers-mobile.webp",
      // 940x1120, 0.839:1, which is close to the shape the band actually
      // is on a phone — about 0.81:1 at 390 against the reserved 480px
      // height. So `cover` keeps 97% of the width and all of the height,
      // and almost nothing is thrown away.
      //
      // That is the whole gain. The wide file at 390 is a 1.777:1 frame in
      // a 0.81:1 box: it keeps 46% of the height and 100% of the width
      // scaled up, which put his head above the top edge and his suit
      // behind the entire lockup. This file re-composes him lower and
      // right, standing clear of the four lines of type.
      width: 940,
      height: 1120,
      // Centred, and both halves are near-inert by construction — the file
      // was cut to the band's own phone shape, so there is only 3% of
      // width for the horizontal half to choose between and no vertical
      // crop at all at 390. It is written out rather than left implicit so
      // that a future change to HEADER_BAND_HEIGHT has a value to move.
      position: "50% 50%",
    },
  },
  livestream: {
    // 1600x900, replacing a 555x260 file. That 555 was the worst source
    // on the site — 3.46x upscale at 1920, and it is why this page led
    // every softness table in VISUAL-PASS.md. It is now 1.20x.
    src: "/headers/livestream.webp",
    width: 1600,
    height: 900,
    // 85% -> 100%, and it is the new frame rather than a new opinion. The
    // lens barrel now runs off the RIGHT EDGE of the source: its rings
    // span x 0.60 to 1.0. At 390 the band keeps 72% of the width, so 85%
    // put the window at 0.237-0.958 and sliced 4% off the barrel, which
    // reads as a mistake in a way that losing bokeh does not. 100% aligns
    // the window to the right edge, 0.278-1.0, and the lens is whole.
    // Inert from 768 up, where the full width is kept either way.
    position: "100% 50%",
    keeps: "the lens and its rings whole at every width, with the near bank of bokeh beside it; loses the far-left city lights and their reflections on a phone",
  },
  ministries: {
    // 1600x895, replacing a 735x245 file: 2.61x upscale at 1920 down to
    // 1.20x. The new source is 1.79:1 rather than 3:1, so the band DOES
    // crop it vertically now, which is what the position below is for.
    src: "/headers/ministries.webp",
    width: 1600,
    height: 895,
    // 45% -> 42%. Two subjects that have to read as one thing: the
    // clasped hands, y 0.03-0.58, and the open Bible under them,
    // y 0.48-0.82. At 1920 `cover` keeps only 45% of the height, so
    // nothing shows both whole; 42% puts the window at 0.232-0.679,
    // centred on the join where the hands rest on the pages. At 45% it
    // starts 0.017 lower and takes the top knuckles off.
    position: "50% 42%",
    keeps: "the clasped hands down to the knuckles and the open Bible they rest on, its gutter and the inner columns of both pages; at 1440 it keeps the forearms too",
  },
  about: {
    // A different photograph, not a re-cut of the old one: an open hand
    // holding the numerals 2026 against a sunset, replacing the spread of
    // printed pages.
    //
    // NO `band` WINDOW ANY MORE, and that is the source changing rather
    // than the reasoning. The 620px cut existed because the old file came
    // off a 6000x4000 original at 1.5:1, and a full-bleed band that is
    // never taller than 480px was throwing away 447 of its 1067 rows
    // before painting anything. This source is 1694x929, already 1.82:1,
    // so there is nothing to discard ahead of time and the render crop
    // keeps its full range of choice. 32.1 KB at q82, the smallest file in
    // the directory: three quarters of the frame is smooth sky, which WebP
    // encodes almost for free.
    src: "/headers/about.webp",
    width: 1600,
    height: 877,
    // Centred, and it earns it. The numerals sit at y 0.40-0.56 and the
    // palm runs from 0.38 to the bottom edge; at 1920 `cover` keeps 46%
    // of the height, so 50% puts the window at 0.272-0.728 with the
    // numerals in the middle of it and sky above. At 390 the band keeps
    // 70% of the width, centred on 0.148-0.851, which holds the numerals
    // and all but the fingertips.
    position: "50% 50%",
    keeps: "the numerals 2026 held in the open hand, the sun behind them and the band of sky above; loses the far treeline and the fingertips on a phone",
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
    keeps: "the Psalm 23 heading and the columns either side of it, from the page edges inward; the taller band shows the spread rather than one legible strip of it",
  },
  downloads: {
    src: "/headers/downloads.webp",
    width: 736,
    height: 404,
    // Centred, the band lands on the shelf of closed books above the
    // desk. 58% drops it onto the open book and the pencil, which is
    // what a downloads page is about.
    position: "50% 58%",
    keeps: "the open book, its tabs, the pencil and the mug beside them; loses the lamp and the top of the shelf",
  },
  health: {
    // A new photograph, and a `band` window where there was none. The old
    // file was 736x412 and small enough that cutting it would have been
    // pointless; this source is 4032x3024, so at 1920 the band would have
    // painted 33% of it and precached the other two thirds.
    //
    // 620, the efficient window, and this is the one picture on the site
    // that can take it without argument: an overhead market stall is an
    // all-over pattern with no subject to cut through, so the 35% of the
    // width a phone keeps at 2.58:1 still reads as a market. The two
    // pages below take 840 precisely because they do have a subject.
    src: "/headers/health.webp",
    width: 1600,
    height: 620,
    // Centred, and re-derived rather than inherited. The window was
    // already cut at 0.5 of the source, and there is nothing left for the
    // vertical half to choose between — produce fills the frame corner to
    // corner, so every window of every height shows the same kind of
    // thing. The horizontal half is what matters at 390 and centred is
    // right for a pattern with no focus.
    position: "50% 50%",
    keeps: "greens, beans and cucumbers across the middle of the stall with the squash and papaya above them; on a phone it crops to the beans and gourds at the centre",
  },
  "family-life": {
    // A new photograph. 1600x840 from a 5472x3648 source cut at 0.45 of
    // its height, where the hands are.
    //
    // 840 AND NOT THE 620 THE PAGE USED TO CARRY, and the subject decides
    // it. This frame is one baby's hand held inside two adult hands, and
    // the baby's hand — which is the whole picture — spans only x
    // 0.30-0.62. At 620 the file is 2.58:1 and a 390px band keeps 35% of
    // the width, a window of x 0.325-0.675 that clipped it on the left.
    // 840 makes the file 1.90:1 and the phone keeps 47%, x 0.265-0.735,
    // which holds the small hand whole with an adult thumb either side.
    //
    // The wide end still justifies the cut: at 1920 the band uses 48% of
    // this file where the uncut 1.5:1 source would have used 37%.
    src: "/headers/family-life.webp",
    width: 1600,
    height: 840,
    // Centred. The 0.45 cut already put the hands in the middle of the
    // file, so the vertical half has little left to do, and the
    // horizontal half is centred because the subject is.
    position: "50% 50%",
    keeps: "the baby's hand resting open on the adult palm beneath it, with the second pair of fingers curled round from the right; on a phone it crops to the small hand and the palm it lies in",
  },
  children: {
    // The last ministry page without artwork now has some. Everything
    // this file says about /ministries/children having none is gone with
    // it, including the exemption in HEADER_ROUTES above.
    //
    // 1600x840, cut from a 5220x3480 source at 0.55 of its height. `band`
    // for the reason the other three carry it: 1.5:1 is the shape whose
    // rows a 480px full-bleed band cannot use, and at 1920 the uncut file
    // would have painted 37% of itself and precached the rest.
    //
    // 840 AND NOT THE 620 THE OTHER THREE TAKE. This page has the longest
    // description of any header on the site, so its band is 437px tall at
    // 390 where every other one sits on the 304px floor — and a taller
    // band in a narrow viewport crops the WIDTH. At 620 it kept 35% of it:
    // the left edge cut through the braids and the second figure was
    // halved. Measured after the re-cut, the phone keeps 47%. The cost is
    // 18 KB of precache and the wide end still uses 66% of the file.
    src: "/headers/children.webp",
    width: 1600,
    height: 840,
    // Centred. The window was already cut at 0.55 of the source, which is
    // where both figures stand, so the vertical half has little left to
    // choose; the horizontal half is what matters at 390, and centred is
    // what holds both of them.
    position: "50% 50%",
    keeps: "both children watching the platform, the keyboard and the lit room behind them; on a phone it crops to the two of them with the tables either side",
  },
  "christian-education": {
    // A new photograph, and everything the old entry said is void with
    // it. There is no alarm clock and no book stack in this frame: it is
    // two people sitting side by side with an open Bible on each lap, shot
    // from above, one of them marked up in highlighter and the other
    // tabbed down the edge.
    //
    // 1600x840 from a 6000x4000 source. `band` for the usual reason — at
    // 1920 the uncut 1.5:1 file paints 37% of itself — and 840 rather than
    // 620 for the reason family-life takes it: there is a subject and a
    // 620 window cuts through it. The two Bibles sit either side of the
    // frame's midline with a knitted scarf between them, so the 35% of the
    // width a 2.58:1 file leaves at 390 lands in the gap and shows the
    // scarf. At 47% the phone keeps a page of each book.
    src: "/headers/christian-education.webp",
    width: 1600,
    height: 840,
    // Centred, re-derived from scratch. The old 60% belonged to a
    // photograph that no longer exists and was solving a problem — a clock
    // floating on the bottom edge — that this frame does not have. Here
    // the 0.5 cut already centres the two open books, and both of them run
    // the full height of the window, so a window of any height at any
    // vertical offset shows printed page. Nothing to move.
    position: "50% 50%",
    keeps: "both open Bibles, the highlighted columns on the left and the tabbed edges on the right, with the hands holding them; on a phone it crops to the inner page of each",
  },
} as const satisfies Record<string, PageHeaderImage>;
