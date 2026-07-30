import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
 * Full bleed before the event, when the countdown is the point. Roughly
 * 60svh during and after it, so the live session card clears the fold.
 * svh rather than vh or dvh: vh ignores mobile browser chrome and overflows
 * behind it, dvh changes as that chrome retracts and would resize the band
 * mid-scroll. svh is the one of the three that is both correct and stable.
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
 * Nothing here animates: no parallax, no ken burns, no fade-in.
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
  "data-[hero-phase=during]:h-[60svh] data-[hero-phase=after]:h-[60svh]";
const COMPACT_SCRIM_HEIGHT =
  "group-data-[hero-phase=during]/hero:h-[var(--scrim-h-compact)] group-data-[hero-phase=after]/hero:h-[var(--scrim-h-compact)]";
const COMPACT_BOTTOM_PADDING =
  "group-data-[hero-phase=during]/hero:pb-8 group-data-[hero-phase=after]/hero:pb-8";
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
        className={`group/hero relative isolate -mt-header flex flex-col justify-end overflow-hidden bg-navy-900 h-svh ${COMPACT_HERO_HEIGHT}`}
        style={
          {
            "--scrim-h": HERO_SCRIM_BOTTOM_HEIGHT.before,
            "--scrim-h-compact": HERO_SCRIM_BOTTOM_HEIGHT.compact,
          } as CSSProperties
        }
      >
        {HERO_IMAGE ? (
          <>
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
              className="-z-20 object-cover"
            />

            {/* Behind the header, and stopping well short of the roofline. */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 -z-10 h-44"
              style={{ backgroundImage: HERO_SCRIM_TOP }}
            />

            {/* Behind the text block. Height is phase-dependent because
                the type is: the compact phases set a smaller title, so
                their footprint is smaller and the scrim that covers it can
                be shorter. See HERO_SCRIM_BOTTOM_HEIGHT for the measured
                footprints both values are derived from. */}
            <div
              aria-hidden
              className={`absolute inset-x-0 bottom-0 -z-10 h-[var(--scrim-h)] ${COMPACT_SCRIM_HEIGHT}`}
              style={{ backgroundImage: HERO_SCRIM_BOTTOM }}
            />
          </>
        ) : null}

        {/*
          Bottom-left, inside the bottom scrim.

          Every string is pure white, never white/80. The measured ratios
          are the figures for white; knocking the meta line back to 80%
          opacity over the same pixels costs about a quarter of the
          contrast and fails. Hierarchy comes from size and weight.

          The compact phases set a smaller title and tighter spacing. That
          is not decoration: it is what lets the bottom scrim stay at 45%
          of a 60svh band instead of covering the whole of it.
        */}
        <div
          className={`mx-auto w-full max-w-5xl px-6 pb-16 ${COMPACT_BOTTOM_PADDING}`}
        >
          <div className={`flex max-w-2xl flex-col gap-4 ${COMPACT_STACK_GAP}`}>
            <h1
              className={`font-display text-hero text-balance text-white ${COMPACT_TITLE}`}
            >
              {eventInfo.edition}
            </h1>

            <p className={`text-lg text-white ${COMPACT_META}`}>
              {eventDateRange()} at {eventInfo.church.address}
            </p>

            <div className={`mt-2 ${COMPACT_CTA_OFFSET}`}>
              <Link
                href="/schedule"
                className="inline-flex items-center gap-2 rounded-control bg-white px-5 py-2.5 text-sm font-medium text-navy-900 transition-colors duration-fast ease-out-soft hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                See the programme
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Runs during parse, immediately after the section it corrects, so
          the final height is in place before the first paint. */}
      <script dangerouslySetInnerHTML={{ __html: heroPhaseScript(HERO_ID) }} />
    </>
  );
}
