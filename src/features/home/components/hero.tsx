import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { eventInfo } from "@/data";
import { WatchLiveLink } from "@/features/livestream/components/watch-live-link";
import { eventDateRange } from "@/lib/event-dates";
import {
  ART_DIRECTION,
  HERO_IMAGES,
  HERO_SCRIM_BOTTOM_HEIGHT,
} from "@/lib/hero";
import {
  HeroBackdrop,
  HeroCaption,
  HeroRotation,
} from "./hero-rotation";
import { EventPhaseSync } from "@/components/event-phase-sync";
import {
  buildTimeHeroPhase,
  HERO_PHASE_ATTRIBUTE,
  heroPhaseScript,
} from "../lib/hero-phase";

/**
 * The home hero band.
 *
 * Server component. The clock-dependent countdown / live / archive states
 * are unchanged and still render below this, from TodayView. The hero
 * wraps them, it does not replace them.
 *
 * HEIGHT AND PHASE
 * From md: full bleed before the event, when the countdown is the point,
 * and roughly 60svh during and after it, so the live session card clears
 * the fold. svh rather than vh or dvh: vh ignores mobile browser chrome and
 * overflows behind it, dvh changes as that chrome retracts and would resize
 * the band mid-scroll. svh is the one of the three that is both correct and
 * stable.
 *
 * Below md, height is not driven by the viewport at all — the frame takes a
 * 4:3 ratio close to the source's own shape and the text moves off the
 * photograph onto the page. A 0.46:1 portrait viewport crops a 1.70:1
 * photograph to 27% of its width, and no scrim or object-position fixes
 * that. See the frame below.
 *
 * The phase is one attribute on the section, resolved at build time and
 * corrected before first paint — see ../lib/hero-phase.ts for why it
 * cannot come from useNow(). Everything phase-dependent inside reads it
 * through group-data variants rather than carrying its own copy, so the
 * correction script has exactly one attribute to set and no descendant can
 * be left holding a stale value. Both heights are declared in CSS, so the
 * band reserves its own space and nothing shifts when the image decodes or
 * when the phase is corrected.
 *
 * Every variant below is written out as a literal class string. Building
 * them by interpolation reads better and does not work: Tailwind finds
 * class names by scanning source text, so a name assembled at runtime is a
 * name it never generates and the rule silently does not exist.
 *
 * THE SCRIMS
 * Two localised gradients and nothing between them. The flat wash that
 * used to cover the whole frame is gone and stays gone.
 *
 * Painted in the poster's plum, built from Emperor and Grapevine rather
 * than colour-picked off the poster: the poster's ground is this same
 * photograph already tinted, so picking it would be copying an output.
 * Each scrim runs BETWEEN the two inks — warm at the outer edge, cool as
 * it eases in — which is what gives the frame the poster's shift instead
 * of a flat wash. Both are sized to the box they exist to protect and no
 * further: the top one to the header's 80px, the bottom one to the text
 * block's measured footprint. The middle of the frame — the hands and the
 * page they rest on — is untouched. Alphas are measured, not chosen; the
 * method and the numbers are in src/lib/hero.ts.
 *
 * The scrims are now PER IMAGE and live in ./hero-rotation.tsx with the
 * photographs they belong to. The inks, the alphas and their derivation
 * have not changed; what changed is that each layer carries its own pair,
 * so a picture that needs more alpha can have it without darkening the two
 * that measured fine, and so a crossfade never has one image sitting under
 * another image's protection.
 *
 * Whether the top scrim is protection or art direction depends on which
 * photograph is showing, and now also on which CROP of it — which is the
 * argument for deriving its alpha against a white pixel rather than
 * against any particular file. Six files, two per picture, and a value
 * tuned to one of them is a value guessed at for the other five.
 *
 * SOFTNESS, AND THE END OF A LONG-STANDING REQUEST
 * This used to say hands-bible was 735x616 and upscaled 2.61x at 1920 —
 * the softest picture on the site in the slot every visitor sees — and
 * that the thing to ask the committee for was the original behind the
 * poster. It arrived. The wide crop is 1672x941 and upscales 1.15x at
 * 1920; the phone crop is 853x1844, which a 390px viewport at device
 * pixel ratio 3 does not quite fill either, but by 1.37x rather than by
 * three and a half.
 *
 * Nothing is upscaled to reach a cap, and the cap itself is gone: see
 * tools/assets/hero-photos.mjs. Sharpness is no longer what limits this
 * hero at any width.
 *
 * MOTION
 * The photographs crossfade, three of them, 800ms of fade and six seconds
 * of dwell, with a caption that fades with its picture and a visible pause
 * control. No parallax, no ken burns, no typing effect. Under
 * prefers-reduced-motion the rotation does not happen at all: first image
 * only, no interval, no control. See ./hero-rotation.tsx.
 *
 * The TEXT block's motion is unchanged and is all the motion it has. It
 * does not rotate and it gained nothing from the rotation, because it is
 * the LCP element. Once, on load — theme, then the verse and song, then
 * the meta line, then the call to action, 100ms apart, 620ms end to end.
 * See the note on the RevealGroup below.
 *
 * THE POSTER'S TYPEFACES, AND WHY NEITHER IS HERE
 *
 * The 2026 poster sets "Camp Meeting" in a heavy geometric sans carrying a
 * drawn C-A ligature, and "Obey and Live" in a formal script. Both are set
 * in Fraunces here, which is the display face the site already loads, and
 * that is a decision rather than a shortfall:
 *
 *   - The ligature is artwork. It is one drawn glyph pair in a lockup, and
 *     no font on any service has it, because it does not belong to a font.
 *     Reproducing it means the artwork, not a typeface.
 *   - A formal script has no honest free equivalent. What is available on
 *     Google Fonts — Great Vibes, Pinyon Script, Petit Formal Script,
 *     Italianno, Tangerine — is a set of wedding-stationery faces with
 *     thin, even strokes and no real contrast modulation. Setting "Obey
 *     and Live" in one of those alongside a photograph and a measured
 *     scrim would read as a near-miss of the poster, which is worse than
 *     not attempting it: a reader who has seen the poster sees a copy that
 *     did not quite work, and a reader who has not sees a wedding invite.
 *   - Fraunces is already loaded, already preloaded, and costs nothing
 *     further. It carries every other heading on the site, so the theme in
 *     Fraunces reads as this site saying the theme rather than as a
 *     failed impression of the print.
 *
 * ── COMMITTEE OWES THIS ───────────────────────────────────────────────
 * The real fix is the poster's own lockup as an SVG or a transparent PNG,
 * from whoever set the poster. That gets the ligature and the script
 * exactly, at any size, with no licence to buy and no font to ship — an
 * SVG of two words is smaller than any webfont that could approximate
 * them. Ask for the lockup, and ask for it in the same request as the
 * full-resolution photograph src/lib/hero.ts already asks for.
 */

const HERO_ID = "home-hero";
const HERO_TEXT_ID = "home-hero-text";

/*
 * The compact treatment, once per phase that uses it. `during` and `after`
 * are styled identically, so each pair below says the same thing twice
 * rather than a third rule existing for a third look.
 */
/*
 * ── THE COMPACT BAND IS GONE; THE COMPACT TYPE IS NOT ────────────────
 *
 * `during` and `after` used to shorten the band itself — 55svh below md
 * with a 29rem floor, 60svh above — so that the live session card cleared
 * the fold during the event. That has been withdrawn deliberately: the
 * band is now the full height in all three phases and the photograph is
 * shown whole all week. VISUAL-PASS.md records the trade and why it was
 * reversed.
 *
 * What remains below is the compact TYPE: smaller theme, verse and meta
 * line and tighter spacing in the two event phases. It is kept for two
 * reasons. It is the denser setting the hero wants once the countdown is
 * no longer the point, and it makes the block SHORTER than the `before`
 * block the 28rem scrim was measured against — so the scrim covers it
 * with more margin than the case it was derived from, not less.
 *
 * Everything here is `group-data-`, which compiles to a DESCENDANT
 * selector: the section carries the attribute and these style elements
 * inside it. The height rule that used to sit at the top of this block was
 * the one exception and had to be plain `data-`, since it styled the
 * attribute-carrying element itself.
 */
// No longer md-scoped. The text block is inside the frame at every width
// now, so its bottom padding is the phase's business at every width too.
const COMPACT_BOTTOM_PADDING =
  "group-data-[hero-phase=during]/hero:pb-8 group-data-[hero-phase=after]/hero:pb-8";
const COMPACT_STACK_GAP =
  "group-data-[hero-phase=during]/hero:gap-2 group-data-[hero-phase=after]/hero:gap-2";
const COMPACT_THEME =
  "group-data-[hero-phase=during]/hero:text-4xl group-data-[hero-phase=after]/hero:text-4xl";
const COMPACT_VERSE =
  "group-data-[hero-phase=during]/hero:text-base group-data-[hero-phase=after]/hero:text-base";
const COMPACT_META =
  "group-data-[hero-phase=during]/hero:text-sm group-data-[hero-phase=after]/hero:text-sm";
const COMPACT_CTA_OFFSET =
  "group-data-[hero-phase=during]/hero:mt-0 group-data-[hero-phase=after]/hero:mt-0";

export function Hero() {
  const phase = buildTimeHeroPhase();
  const first = HERO_IMAGES?.[0];

  return (
    <>
      {/*
        THE LCP PRELOAD, WHICH USED TO BE next/image's `priority`.

        The backdrop is a plain <picture> now (see the note in
        ./hero-rotation.tsx for why art direction cannot go through
        next/image), so the two things `priority` did have to be said
        directly. `fetchPriority="high"` is on the img itself; this is the
        other half.

        TWO LINKS, EACH WITH THE MEDIA QUERY THAT SELECTS IT, and that is
        the part a single preload would get wrong. Exactly one of these
        matches at any width, so exactly one file is fetched — a preload
        without `media` would pull the wide crop onto every phone, which
        is 102 KB the phone will never paint, competing with the 40 KB it
        actually needs. The queries are the same pair the <picture> itself
        resolves, from the same constant, so the preload cannot select a
        different file from the one the element ends up using.

        Only the first image. The other two are `loading="lazy"` and are
        six and thirteen seconds away; preloading them would spend the
        LCP's bandwidth on pictures nobody is looking at yet.

        React 19 hoists these into <head>. They are rendered before the
        section so they are in the markup ahead of the img they describe,
        which is what lets the preload scanner act on them first.
      */}
      {first ? (
        <>
          <link
            rel="preload"
            as="image"
            href={first.mobile.src}
            media={`(max-width: ${ART_DIRECTION.breakpoint - 1}px)`}
            fetchPriority="high"
          />
          <link
            rel="preload"
            as="image"
            href={first.desktop.src}
            media={ART_DIRECTION.media}
            fetchPriority="high"
          />
        </>
      ) : null}

      <section
        id={HERO_ID}
        {...{ [HERO_PHASE_ATTRIBUTE]: phase }}
        // -mt-header pulls the band up under the sticky header by exactly
        // the header's own height, so the photograph runs full bleed behind
        // it while the content that follows the hero still starts where it
        // would have. Both sides read --spacing-header; see globals.css.
        //
        // ONE SHAPE AT EVERY WIDTH, as of this pass. The section IS the
        // frame everywhere: clipped, Emperor behind, the text block laid
        // over the bottom of it inside the scrim. There is no longer an
        // md breakpoint at which the hero changes kind, only one at which
        // it changes height. See the frame below for why the 4:3 box and
        // the text-underneath layout are gone.
        //
        // 88svh on phones rather than 100. A full-height band with nothing
        // visible under it gives a reader no reason to believe there is
        // more page, and the 12% is enough to show the top edge of what
        // follows. svh, not vh or dvh: vh ignores mobile browser chrome and
        // overflows behind it, dvh changes as that chrome retracts and
        // would resize the band mid-scroll.
        //
        // One height in all three phases now. The phase-dependent override
        // that used to follow md:h-svh has gone; see the note above the
        // compact type constants.
        className="group/hero relative isolate flex h-[88svh] flex-col justify-end overflow-hidden bg-emperor -mt-header md:h-svh"
        style={
          {
            // One scrim height for the one band height it protects, and a
            // taller one for `before` below 390px, where the block wraps to
            // 478px and outgrew the 448px default. The variant that picks
            // between them is on the scrim itself, in ./hero-rotation.tsx.
            "--scrim-h": HERO_SCRIM_BOTTOM_HEIGHT.default,
            "--scrim-h-narrow": HERO_SCRIM_BOTTOM_HEIGHT.narrow,
          } as CSSProperties
        }
      >
        {/*
          The provider renders no DOM of its own: it exists so the backdrop
          and the caption, which sit in two places that are not each other's
          ancestors, read one index. Everything between them stays
          server-rendered markup passing through as `children`.

          `?? []` rather than a second branch of this whole subtree. With no
          images the list is empty, `rotating` is false, and both consumers
          below are gated on HERO_IMAGES anyway — so the kill switch removes
          the photographs, their scrims, the caption and the control, and
          leaves the Emperor band and the type.
        */}
        <HeroRotation images={HERO_IMAGES ?? []}>
        {/*
          THE FRAME CHANGES SHAPE. THE PHOTOGRAPH NOW CHANGES WITH IT.

          The band is 0.53:1 at 390x844 and full-bleed landscape from md
          up. It used to be handed one landscape file for both, and
          `object-fit: cover` was left to find a phone crop inside a
          picture composed for a wide one. What that cost was written down
          rather than hidden: at 390 it kept 29% of migori's width and 37%
          of taji's, so both stopped being group shots and became close
          shots of the three or four singers in the middle of the rank.
          The defence was that a choir is a dense rank of people and the
          middle of it still reads as a choir — true, and it was always an
          argument for tolerating the crop rather than for wanting it.

          Each picture is now TWO FILES, composed separately for the two
          shapes, chosen by a `media` query on a real `<picture>`. The
          phone gets a portrait re-frame that holds the whole rank; md and
          up get the wide one. That is art direction, and it is a
          different problem from responsive sizing — `sizes` describes how
          big the box is and cannot say what should be inside it. See
          ART_DIRECTION in src/lib/hero.ts for the breakpoint and why
          it is the same 768 this band's own height changes at, and
          ./hero-rotation.tsx for why the optimiser is not in the path.

          One picture has no wide re-cut and that is intended: taji keeps
          its existing desktop file and gains only a phone crop.

          The frame, the three layers and their scrims are in
          ./hero-rotation.tsx. HERO_IMAGES going undefined removes all of
          it and leaves the Emperor band, which is the point of the switch.
        */}
        {HERO_IMAGES ? <HeroBackdrop /> : null}

        {/*
          ONE TEXT BLOCK, ONE PLACE, ONE COLOUR.

          It sits over the bottom of the photograph inside the scrim at
          every width. It used to move off the picture below md onto the
          page surface and change from white to --color-ink to do it,
          which is the pair of md: variants that have gone from every
          string below.

          Still one block rather than a mobile copy and a desktop copy:
          two copies means two h1 elements on the page, a real
          accessibility and structured-data fault rather than a tidiness
          preference, and the two would drift the first time the date
          range or the CTA wording changed.

          Every string is pure white, never white/80. The measured ratios
          are the figures for white; knocking the meta line back to 80%
          opacity over the same pixels costs about a quarter of the
          contrast and fails. Hierarchy comes from size and weight.

          The compact phases set a smaller theme, verse and meta line, and
          tighter spacing. That is not decoration: it is what lets the
          bottom scrim stay short in a 55svh band instead of covering the
          whole of it. The measured footprints both scrim heights are
          derived from are in src/lib/hero.ts.
        */}
        <div className={`shell pb-10 md:pb-16 ${COMPACT_BOTTOM_PADDING}`}>
          {/*
            The measure moved out here from the RevealGroup, and the id with
            it, because the block the bottom scrim has to protect is now the
            entrance PLUS the caption row under it. tools/perf/verify-hero.mjs
            measures the footprint from #home-hero-text, so leaving the id on
            the RevealGroup would have excluded the caption from every
            reading — the same class of quiet exclusion that made the harness
            stop seeing the call to action two sessions ago.
          */}
          <div id={HERO_TEXT_ID} className="flex max-w-2xl flex-col">
          {/*
            THE ENTRANCE.

            Theme, then the verse and song, then the meta line, then the
            call to action, each a short fade and a 12px lift, 100ms apart.
            620ms end to end. It is the first thing anyone sees and it used
            to arrive as one block, carried in by the page transition;
            sequencing it is what makes it read as composed rather than as
            switched on.

            `immediate`, not the default scroll trigger: this is on screen
            at load by definition, so observing it would be asking a
            question whose answer is already known.

            Four items, not five: the edition kicker is inside the h1 and
            arrives with the theme it belongs to. It is not the eyebrow
            this hero used to have and does not reinstate it — the
            "Seventh-day Adventist Church Newlife" line stays gone, since
            the header lockup carries it and so does the green sign in the
            photograph. What the kicker names is the event, which had to
            stay somewhere in the hero once the theme took the display
            slot.

            RevealGroup and RevealItem are client components; their children
            are not. The hero stays a server component and these are slots
            around already-rendered markup, so nothing here ships as
            JavaScript beyond the wrappers themselves.

            The group-data phase variants below still resolve: they compile
            to descendant selectors against group/hero on the section, and
            wrapping an element in a div leaves it a descendant.
          */}
          <RevealGroup
            immediate
            stagger={0.1}
            className={`flex flex-col gap-4 ${COMPACT_STACK_GAP}`}
          >
            {/*
              THE THEME IS THE SUBJECT, AND THE EDITION IS ITS KICKER.

              Both sit inside the one h1, so the heading a screen reader
              announces is still "Camp Meeting 2026 Obey and Live" — the
              event names itself — while the eye goes to the theme, which
              is what the poster does and what this hero was missing.

              The alternative was an h1 of "Obey and Live" with the edition
              as a separate eyebrow above it. That would make the home
              page's only top-level heading not name the event, which is a
              real cost in a document whose title, share card, manifest and
              JSON-LD all lead with "Camp Meeting 2026".

              TYPEFACE. The poster sets "Camp Meeting" in a heavy geometric
              sans with a drawn C-A ligature and "Obey and Live" in a
              formal script. Neither is reproduced here and neither is
              approximated: see the note at the foot of this file.
            */}
            <RevealItem>
              {/* The colour lives on the h1, not on the theme span inside
                  it, and that is load-bearing rather than tidiness.
                  tools/perf/verify-hero.mjs reads
                  getComputedStyle(h1).color to decide whether to score the
                  block against the brightest backdrop pixel or the darkest
                  — see the note at the top of that file. With the colour
                  moved down onto a child, the h1 inherited --color-ink at
                  every width and the harness reported 1.02:1 FAIL at five
                  of six widths for a hero that is white over a scrim and
                  fine. Declaring it here is also simply the correct place:
                  it is the colour of the heading's text, and the kicker
                  overrides it. */}
              <h1 className="flex flex-col gap-2 text-balance text-white">
                {/* Not the display face. Set small and letter-spaced it
                    would only read as a serif shrunk, and the site's own
                    eyebrow convention (PageHeader) is sans.

                    White, not the accent-600 the PageHeader eyebrow uses.
                    Grapevine measures about 1.3:1 on the scrim, and this
                    kicker is on the scrim at every width now. Hierarchy
                    against the theme under it comes from size, weight and
                    tracking, which is what has to carry it whenever the
                    ground is a photograph. */}
                <span className="text-sm font-semibold tracking-[0.18em] uppercase">
                  {eventInfo.edition}
                </span>
                <span className={`font-display text-hero ${COMPACT_THEME}`}>
                  {eventInfo.theme}
                </span>
              </h1>
            </RevealItem>

            {/* The verse and the song. Two spans in a wrapping row, not a
                string with punctuation in it, so the pair breaks between
                the two references instead of mid-reference.

                NO SEPARATOR GLYPH. There was an aria-hidden middle dot
                here, and it measured badly: the row wraps at 320 in both
                phases and at 360 in the full-bleed phase, which left the
                dot stranded at the end of the first line. Every fix that
                keeps it is worse — bound to the second phrase it leads
                line two instead, and a breakpoint that stacks the pair
                would have to be 390 and would then stack it at widths
                where it fits. The dot was carrying no meaning anyway:
                "Theme song" already labels what follows it. Space does the
                separating, at gap-x-6 so the two read as two. */}
            <RevealItem>
              <p
                className={`flex flex-wrap items-baseline gap-x-6 gap-y-1 text-lg text-white ${COMPACT_VERSE}`}
              >
                {/* Labelled, matching /speakers. The reference stood bare
                    here beside a labelled "Theme song", which read as one
                    labelled item and one loose one. */}
                <span>Key Text: {eventInfo.keyVerse}</span>
                <span>Theme song {eventInfo.themeSong}</span>
              </p>
            </RevealItem>

            <RevealItem>
              {/* White, like everything else in the block. It was
                  ink-muted off the photograph, and there is no "off the
                  photograph" any more. Subordinate by size, not by
                  colour: white/80 over these pixels costs about a quarter
                  of the contrast and fails. */}
              <p className={`text-base text-white ${COMPACT_META}`}>
                {eventDateRange()} at {eventInfo.church.address}
              </p>
            </RevealItem>

            <RevealItem className={`mt-2 ${COMPACT_CTA_OFFSET}`}>
              {/* TWO ACTIONS, AND ONLY ONE OF THEM IS FILLED.

                  The programme is what most people open this site for and
                  keeps the white fill. The livestream is for the people
                  who cannot be there, which is fewer of them but a need
                  the programme cannot answer — so it is a real button and
                  not a text link, set as an outline. Two filled buttons
                  side by side is two primary actions, which is none.

                  flex-wrap, and the pair stacks below about 360 rather
                  than shrinking: these are 48px tap targets on a
                  photograph and a squeezed row of two is worse than a
                  column of two. gap-3 keeps them clearly separate when
                  they do sit on one line.

                  min-h-12, not min-h-11: primary actions on a phone take
                  the same 48px floor the header controls do, reverting to
                  the site's compact size at lg. */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/schedule"
                  className="inline-flex min-h-12 items-center gap-2 rounded-control bg-white px-5 py-2.5 text-sm font-medium text-emperor transition-[background-color,translate] duration-fast ease-out-soft hover:bg-white/90 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:min-h-11"
                >
                  See the programme
                  <ArrowRight aria-hidden className="size-4" />
                </Link>

                {/* A 2px ring rather than a 1px border, because this sits
                    on a photograph: a hairline disappears over a light
                    patch, and the hero's whole contrast argument is that
                    nothing here may depend on which pixels are behind it.
                    The fill on hover is white/15, which reads on every
                    frame of the rotation without ever approaching the
                    filled button beside it.

                    The destination is /livestream and during the week it
                    also carries the hash of the half of the day the viewer
                    is in, which is why this one button is a client
                    component. See watch-live-link.tsx. */}
                <WatchLiveLink className="inline-flex min-h-12 items-center gap-2 rounded-control px-5 py-2.5 text-sm font-medium text-white ring-2 ring-white/80 transition-[background-color,translate] duration-fast ease-out-soft hover:bg-white/15 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:min-h-11" />
              </div>
            </RevealItem>
          </RevealGroup>

          {/* Outside the RevealGroup on purpose. It is not part of the
              hero's opening statement and must not join the stagger: the
              entrance is four items that read as one sentence, and a photo
              credit is not the fifth. It also has to be free to fade on its
              own clock, which is the image's clock. */}
          {HERO_IMAGES ? <HeroCaption /> : null}
          </div>
        </div>
        </HeroRotation>
      </section>

      {/* Runs during parse, immediately after the section it corrects, so
          the final height is in place before the first paint.

          It covers the COLD load only. A client-side navigation back to
          this page never parses a document, so this script never runs
          again, and React restores the build-time phase from the RSC
          payload — which put the hero at the wrong height for anyone who
          visited a second page and came back. The sync below is the other
          half; see its file for the measurements. */}
      <script dangerouslySetInnerHTML={{ __html: heroPhaseScript(HERO_ID) }} />
      <EventPhaseSync elementId={HERO_ID} attribute={HERO_PHASE_ATTRIBUTE} />
    </>
  );
}
