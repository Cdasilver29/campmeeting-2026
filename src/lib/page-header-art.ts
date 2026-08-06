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
 * /schedule/[day] and /speakers/[id] both carry flat bands. Every
 * ministry page now has artwork, /ministries/children included, so the
 * four of them are all listed here and all take the transparent header.
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
  "prayer-requests": "/prayer-requests",
  health: "/ministries/health",
  "family-life": "/ministries/family-life",
  children: "/ministries/children",
  "christian-education": "/ministries/christian-education",
} as const satisfies Record<keyof typeof headerImages, string>;

const PHOTO_HEADER_ROUTES: ReadonlySet<string> = new Set(
  Object.values(HEADER_ROUTES),
);

/**
 * True where the page-header band carries a photograph, and therefore
 * where the site header goes transparent at scroll 0. Exact match on the
 * pathname: there is no prefix rule here, because /ministries has a
 * photograph and /ministries/children does not.
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
    // band is 4.0:1 there against a 1.725:1 source, and no position fits a
    // head into 43% of that height with room to spare.
    position: "50% 12%",
    keeps: "the plum diagonal and Pr. Kennedy Mfune from crown to bow tie; the taller band recovers the collar and tie a 356px band cut",
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
  "prayer-requests": {
    src: "/headers/prayer-requests.webp",
    width: 588,
    height: 306,
    // The hands are right of centre, x 0.48-0.85, against black. 62%
    // keeps their right edge on a phone, where the crop is tightest, and
    // that half is unchanged: at 390 the band still keeps only 53% of the
    // width.
    //
    // 50% -> 30% on the vertical, and it only exists because the band got
    // taller. At 1440 `cover` now keeps 64% of the height rather than 27%,
    // and a centred window of 64% is y 0.18-0.82 — which cut the tops of
    // the fingers off, the one part of this frame that is the subject.
    // 30% puts the window at 0.108-0.748 and the fingertips are complete.
    // Inert at 390 and effectively so at 768, where the band keeps 100% of
    // the height either way.
    position: "62% 30%",
    keeps: "the joined hands whole, fingertips to wrists, and the black ground to their left",
  },
  health: {
    src: "/headers/health.webp",
    width: 736,
    height: 412,
    position: "50% 50%",
    keeps: "the produce entire, greens to peppers and the pineapple's crown above them, on the table it is heaped on",
  },
  "family-life": {
    // 1600x620, cut at 52% of the source, which is the position this page
    // used to carry.
    src: "/headers/family-life.webp",
    width: 1600,
    height: 620,
    position: "50% 50%",
    keeps: "all four stacked hands and the knitted cuffs around them; on a phone it crops in to the two topmost hands",
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
    src: "/headers/christian-education.webp",
    width: 735,
    height: 414,
    // 50% -> 60%, for the taller band. At 1440 `cover` keeps 59% of the
    // height rather than 30%, and centred that window is y 0.205-0.795 —
    // enough to show the whole clock except the feet it stands on, which
    // leaves it floating on the bottom edge. 60% drops the window to
    // 0.246-0.836 and the clock stands on its book. Inert at 390 and at
    // 768, where the full height is kept.
    position: "50% 60%",
    keeps: "the book stack, and the alarm clock whole, standing on the open book below it",
  },
} as const satisfies Record<string, PageHeaderImage>;
