import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { eventInfo } from "@/data";
import { eventDateRange } from "@/lib/event-dates";
import {
  HERO_IMAGE,
  HERO_SCRIM_BOTTOM,
  HERO_SCRIM_BOTTOM_HEIGHT,
  HERO_SCRIM_TOP,
} from "@/lib/hero";
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
 * Two localised gradients and nothing between them. The flat navy wash
 * that used to cover the whole frame is gone: it was protecting text
 * against the bright sky by flattening the building as well, and the
 * building is the reason to run a photograph at all.
 *
 * Painted in near-black rather than the brand navy. Black protects type at
 * a lower alpha and darkens without tinting, so the car park now reads as
 * a darkened photograph instead of a blue cast. Both scrims are sized to
 * the box they exist to protect and no further: the top one to the
 * header's 80px, the bottom one to the text block's measured footprint.
 * The middle of the frame — the roof, the glass, the church sign — is
 * untouched. Alphas are measured, not chosen; the method and the numbers
 * are in src/lib/hero.ts.
 *
 * SOFTNESS
 * The source is 1634x962, so at full bleed it is upscaled 1.18x at a 1920
 * viewport and 1.57x at 2560, before device pixel ratio. The file is not
 * upscaled to hide that. A larger source is worth asking the committee for.
 *
 * MOTION
 * The photograph does not animate: no parallax, no ken burns, no fade. The
 * text block does, once, on load — title, meta, then call to action, 100ms
 * apart, 520ms end to end. See the note on the RevealGroup below.
 */

const HERO_ID = "home-hero";

/*
 * The compact treatment, once per phase that uses it. `during` and `after`
 * are styled identically, so each pair below says the same thing twice
 * rather than a third rule existing for a third look.
 */
/*
 * This one is `data-`, not `group-data-`, and the difference is not
 * cosmetic. `group-data-*` compiles to a DESCENDANT selector — the group
 * element carries the attribute, the styled element sits inside it — so on
 * the section that carries the attribute itself it matches nothing and the
 * band silently stayed at h-svh in every phase. Everything below is on a
 * descendant and is correctly `group-data-`.
 */
const COMPACT_HERO_HEIGHT =
  "md:data-[hero-phase=during]:h-[60svh] md:data-[hero-phase=after]:h-[60svh]";
const COMPACT_SCRIM_HEIGHT =
  "group-data-[hero-phase=during]/hero:h-[var(--scrim-h-compact)] group-data-[hero-phase=after]/hero:h-[var(--scrim-h-compact)]";
// md-scoped, unlike the type rules below it: below md the text block is
// not inside the frame, so its padding is the page's business and not the
// phase's.
const COMPACT_BOTTOM_PADDING =
  "md:group-data-[hero-phase=during]/hero:pb-8 md:group-data-[hero-phase=after]/hero:pb-8";
const COMPACT_STACK_GAP =
  "group-data-[hero-phase=during]/hero:gap-2 group-data-[hero-phase=after]/hero:gap-2";
const COMPACT_TITLE =
  "group-data-[hero-phase=during]/hero:text-4xl group-data-[hero-phase=after]/hero:text-4xl";
const COMPACT_META =
  "group-data-[hero-phase=during]/hero:text-base group-data-[hero-phase=after]/hero:text-base";
const COMPACT_CTA_OFFSET =
  "group-data-[hero-phase=during]/hero:mt-0 group-data-[hero-phase=after]/hero:mt-0";

export function Hero() {
  const phase = buildTimeHeroPhase();

  return (
    <>
      <section
        id={HERO_ID}
        {...{ [HERO_PHASE_ATTRIBUTE]: phase }}
        // -mt-header pulls the band up under the sticky header by exactly
        // the header's own height, so the photograph runs full bleed behind
        // it while the content that follows the hero still starts where it
        // would have. Both sides read --spacing-header; see globals.css.
        // Below md the section is a plain block: the frame sits in flow at
        // its own aspect ratio and the text block follows it on the page
        // surface. From md the section becomes the frame — full height,
        // clipped, navy behind — and the text block is laid over the
        // bottom of it. One text block either way; see below for why that
        // matters more than it looks.
        className={`group/hero relative -mt-header md:isolate md:flex md:flex-col md:justify-end md:overflow-hidden md:bg-navy-900 md:h-svh ${COMPACT_HERO_HEIGHT}`}
        style={
          {
            "--scrim-h": HERO_SCRIM_BOTTOM_HEIGHT.before,
            "--scrim-h-compact": HERO_SCRIM_BOTTOM_HEIGHT.compact,
          } as CSSProperties
        }
      >
        {HERO_IMAGE ? (
          /*
           * THE FRAME, AND WHY ITS SHAPE CHANGES AT md.
           *
           * The source is 1634x962, a 1.70:1 landscape photograph. A
           * 390x844 phone in portrait is 0.46:1. `object-fit: cover`
           * against that frame keeps 0.46 / 1.70 = 27% of the image's
           * width: the middle third, which is roof and tarmac with the
           * building's own edges outside the frame. There is no crop of a
           * landscape photograph that survives a portrait frame, and
           * letterboxing a hero is not an answer.
           *
           * So below md the frame stops being driven by the viewport at
           * all and takes a 4:3 ratio of its own. 1.33 / 1.70 = 78% of the
           * image's width is kept, and its full height, at every phone
           * width — the crop no longer varies with the device, because the
           * frame's shape no longer does.
           *
           * From md the existing phase-driven svh behaviour is untouched.
           */
          // md:-z-10 is load-bearing. From md this becomes an absolutely
          // positioned box, and a positioned box paints above the static
          // in-flow content that follows it — which is the text block. The
          // section's md:isolate keeps the negative index contained.
          <div className="relative isolate aspect-[4/3] overflow-hidden bg-navy-900 md:absolute md:inset-0 md:-z-10 md:aspect-auto">
            <Image
              src={HERO_IMAGE.src}
              alt=""
              aria-hidden
              fill
              priority
              sizes="100vw"
              quality={90}
              // Rendered sharp: no blur filter, no transform. The building
              // and its sign are meant to be legible.
              //
              // 38% horizontal below md, centre from md. At 4:3 the crop
              // takes 22% off the width and nothing off the height, so the
              // vertical half of the value is inert there and is written
              // only because object-position needs both. 38% rather than
              // 50% moves the kept window from x 11%-89% to x 8%-87%,
              // which trades the right-hand edge of the neighbouring tower
              // block for the church's own left-hand roofline. The green
              // sign sits at x 24%-44% and is inside every possible
              // window, so it was never the thing at risk.
              className="-z-20 object-cover [object-position:38%_50%] md:[object-position:50%_50%]"
            />

            {/* Behind the header, and stopping well short of the roofline.
                Shorter below md, where it is covering the same 80px of
                header inside a frame less than a third as tall. */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 -z-10 h-32 md:h-44"
              style={{ backgroundImage: HERO_SCRIM_TOP }}
            />

            {/* Behind the text block, and therefore only from md, since
                below that the text is not on the photograph at all.
                Height is phase-dependent because the type is: the compact
                phases set a smaller title, so their footprint is smaller
                and the scrim that covers it can be shorter. See
                HERO_SCRIM_BOTTOM_HEIGHT for the measured footprints both
                values are derived from. */}
            <div
              aria-hidden
              className={`absolute inset-x-0 bottom-0 -z-10 hidden h-[var(--scrim-h)] md:block ${COMPACT_SCRIM_HEIGHT}`}
              style={{ backgroundImage: HERO_SCRIM_BOTTOM }}
            />
          </div>
        ) : null}

        {/*
          ONE TEXT BLOCK, TWO PLACES.

          Below md it sits in normal flow under the frame, set in --color-ink
          on the page surface. From md it is the same element laid over the
          bottom of the photograph in white, inside the bottom scrim.

          One block rather than a mobile copy and a desktop copy, because
          two copies means two h1 elements on the page — a real
          accessibility and structured-data fault, not a tidiness
          preference — and because the two would drift the first time the
          date range or the CTA wording changed.

          Over the photograph every string is pure white, never white/80.
          The measured ratios are the figures for white; knocking the meta
          line back to 80% opacity over the same pixels costs about a
          quarter of the contrast and fails. Hierarchy comes from size and
          weight. Off the photograph the ink tokens do the same job at
          16.56:1 and 6.32:1, so no phone reader is now depending on a
          scrim at all.

          The compact phases set a smaller title and tighter spacing. That
          is not decoration: it is what lets the bottom scrim stay at 15rem
          in a 60svh band instead of covering the whole of it.
        */}
        <div className={`shell pt-6 pb-10 md:pt-0 md:pb-16 ${COMPACT_BOTTOM_PADDING}`}>
          {/*
            THE ENTRANCE.

            Title, then meta, then call to action, each a short fade and a
            12px lift, 100ms apart. 520ms end to end. It is the first thing
            anyone sees and it used to arrive as one block, carried in by
            the page transition; sequencing it is what makes it read as
            composed rather than as switched on.

            `immediate`, not the default scroll trigger: this is on screen
            at load by definition, so observing it would be asking a
            question whose answer is already known.

            There is no eyebrow in this sequence because there is no eyebrow
            in this hero. The "Seventh-day Adventist Church Newlife" line
            was removed deliberately — the header lockup carries it, and so
            does the green sign in the photograph. PageHeader's eyebrow is a
            different component on the other twelve routes, and it is not
            animated: it opens every interior page, and the page transition
            already moves that whole block on every navigation. Two
            entrances on one element is the thing this pass is meant to
            avoid.

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
            className={`flex max-w-2xl flex-col gap-4 ${COMPACT_STACK_GAP}`}
          >
            <RevealItem>
              <h1
                className={`font-display text-hero text-balance text-ink md:text-white ${COMPACT_TITLE}`}
              >
                {eventInfo.edition}
              </h1>
            </RevealItem>

            <RevealItem>
              <p className={`text-lg text-ink-muted md:text-white ${COMPACT_META}`}>
                {eventDateRange()} at {eventInfo.church.address}
              </p>
            </RevealItem>

            <RevealItem className={`mt-2 ${COMPACT_CTA_OFFSET}`}>
              {/* Primary fill off the photograph, white fill on it. A
                  white button on the white page surface would be an
                  outline of nothing. */}
              <Link
                href="/schedule"
                className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-[background-color,translate] duration-fast ease-out-soft hover:bg-accent-600 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 md:bg-white md:text-navy-900 md:hover:bg-white/90 md:focus-visible:outline-white"
              >
                See the programme
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/* Runs during parse, immediately after the section it corrects, so
          the final height is in place before the first paint. */}
      <script dangerouslySetInnerHTML={{ __html: heroPhaseScript(HERO_ID) }} />
    </>
  );
}
