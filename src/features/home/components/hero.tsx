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
 * The top scrim is now almost entirely art direction. This photograph's
 * top three deciles have a maximum luminance of 0.027, so the header's
 * white type is at 19:1 there before anything is painted. What the
 * gradient buys is the plum reaching up over the header, which is what
 * the poster does.
 *
 * SOFTNESS
 * The source is 735x616, so at full bleed it is upscaled 2.61x at a 1920
 * viewport and 3.48x at 2560, before device pixel ratio. That is worse
 * than the church photograph this replaced, which was 1634x962. The file
 * is not upscaled to hide it. The original behind the poster is the thing
 * to ask the committee for; see src/lib/hero.ts.
 *
 * MOTION
 * The photograph does not animate: no parallax, no ken burns, no fade. The
 * text block does, once, on load — theme, then the verse and song, then
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
        // clipped, Emperor behind — and the text block is laid over the
        // bottom of it. One text block either way; see below for why that
        // matters more than it looks.
        className={`group/hero relative -mt-header md:isolate md:flex md:flex-col md:justify-end md:overflow-hidden md:bg-emperor md:h-svh ${COMPACT_HERO_HEIGHT}`}
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
          <div className="relative isolate aspect-[4/3] overflow-hidden bg-emperor md:absolute md:inset-0 md:-z-10 md:aspect-auto">
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

          The compact phases set a smaller theme, verse and meta line, and
          tighter spacing. That is not decoration: it is what lets the
          bottom scrim stay short in a 60svh band instead of covering the
          whole of it. With the poster's three new strings in the block
          both scrim heights went up; the measured footprints they are
          derived from are in src/lib/hero.ts.
        */}
        <div className={`shell pt-6 pb-10 md:pt-0 md:pb-16 ${COMPACT_BOTTOM_PADDING}`}>
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
            // The hook tools/perf/verify-hero.mjs uses to find the block.
            // It used to scan the h1 plus its next two siblings, which
            // stopped describing this block the moment it grew a fourth
            // line and quietly excluded the call to action from every
            // reading.
            id={HERO_TEXT_ID}
            className={`flex max-w-2xl flex-col gap-4 ${COMPACT_STACK_GAP}`}
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
              <h1 className="flex flex-col gap-2 text-balance text-ink md:text-white">
                {/* Not the display face. Set small and letter-spaced it
                    would only read as a serif shrunk, and the site's own
                    eyebrow convention (PageHeader) is sans. Grapevine off
                    the photograph, matching that eyebrow at 9.22:1 on
                    white; pure white over it, where Grapevine would be
                    about 1.3:1 on the scrim. */}
                <span className="text-sm font-semibold tracking-[0.18em] text-accent-600 uppercase md:text-white">
                  {eventInfo.edition}
                </span>
                <span className={`font-display text-hero ${COMPACT_THEME}`}>
                  {eventInfo.theme}
                </span>
              </h1>
            </RevealItem>

            {/* The verse and the song, one line that wraps into two rather
                than a string with punctuation in it: the separator is
                aria-hidden, so nothing announces a middle dot, and at 320px
                of content the two halves break cleanly instead of
                mid-reference. */}
            <RevealItem>
              <p
                className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 text-lg text-ink md:text-white ${COMPACT_VERSE}`}
              >
                <span>{eventInfo.keyVerse}</span>
                <span aria-hidden>&middot;</span>
                <span>Theme song {eventInfo.themeSong}</span>
              </p>
            </RevealItem>

            <RevealItem>
              <p className={`text-base text-ink-muted md:text-white ${COMPACT_META}`}>
                {eventDateRange()} at {eventInfo.church.address}
              </p>
            </RevealItem>

            <RevealItem className={`mt-2 ${COMPACT_CTA_OFFSET}`}>
              {/* Primary fill off the photograph, white fill on it. A
                  white button on the white page surface would be an
                  outline of nothing. */}
              <Link
                href="/schedule"
                className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-[background-color,translate] duration-fast ease-out-soft hover:bg-accent-600 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 md:bg-white md:text-emperor md:hover:bg-white/90 md:focus-visible:outline-white"
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
