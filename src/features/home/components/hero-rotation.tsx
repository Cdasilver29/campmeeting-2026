"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import {
  ART_DIRECTION,
  HERO_ROTATION,
  heroScrimBottom,
  heroScrimTop,
  type HeroImage,
} from "@/lib/hero";

/**
 * The hero's rotating background, its caption, and the control that stops
 * it. Three exports because the three sit in three places in the tree —
 * the backdrop is an absolutely positioned frame, the caption and the
 * control are in flow at the foot of the text block — while all three read
 * one index.
 *
 * ── WHAT ROTATES ─────────────────────────────────────────────────────
 *
 * The background image and the caption line. Nothing else. The theme, the
 * key verse, the theme song, the dates, the venue and the primary action
 * are the hero's fixed content: that block is the page's LCP element, it
 * already has a staggered entrance, and a hero whose headline changes
 * every six seconds is a hero nobody can finish reading. Those strings
 * stay in hero.tsx, server-rendered, untouched by any of this.
 *
 * ── WHY A CONTEXT AND NOT PROPS ──────────────────────────────────────
 *
 * The index has to reach two subtrees that are not each other's ancestors,
 * and the block between them is server-rendered markup that must stay
 * server-rendered. Threading a number through it would mean making
 * hero.tsx a client component, which is the one thing the hero's whole
 * structure is arranged to avoid. The provider wraps; the server children
 * pass through it as `children` and never re-render.
 *
 * ── THE FIRST IMAGE IS THE ONLY ONE THE SERVER RENDERS ───────────────
 *
 * `mounted` is false during server rendering and on the first client
 * render, so the first paint is one image, eager and at high fetch
 * priority, and nothing else: no second request competing with the LCP,
 * no third. The other two mount in an effect, which by definition runs
 * after that paint, and they carry `loading="lazy"`, so they are fetched
 * afterwards.
 *
 * Only the first image is preloaded, and it is preloaded ONCE — the pair
 * of `<link rel="preload">` tags in hero.tsx carry the same media queries
 * the `<picture>` resolves, so the crop that is fetched early is the crop
 * that is painted.
 *
 * That also means a reader with no JavaScript, or one reading before
 * hydration, gets exactly the hero that shipped before this existed.
 *
 * ── REDUCED MOTION STOPS IT DEAD ─────────────────────────────────────
 *
 * Not slowed, not crossfaded more gently: `rotating` is false, the other
 * two images are never mounted at all, no interval is ever created, and
 * the pause control is not rendered because there is nothing to pause. A
 * slowed carousel is still a carousel.
 *
 * ── THE PAUSE CONTROL IS NOT OPTIONAL ────────────────────────────────
 *
 * An auto-rotating region with no way to stop it fails WCAG 2.2.2, and it
 * fails it for readers who have not set the preference — someone who needs
 * longer with a picture, or who finds the movement distracting on this one
 * page. It is a real `button`, in flow, immediately after the call to
 * action, so it is reachable by keyboard in the order a reader would
 * expect and needs no focus management of its own.
 */

type Rotation = {
  images: HeroImage[];
  /** Index of the image currently at full opacity. */
  index: number;
  /** False before hydration and under prefers-reduced-motion. */
  rotating: boolean;
  paused: boolean;
  toggle: () => void;
};

const RotationContext = createContext<Rotation | null>(null);

function useRotation(): Rotation {
  const value = useContext(RotationContext);
  if (!value) {
    throw new Error("HeroBackdrop and HeroCaption must be inside HeroRotation");
  }
  return value;
}

/*
 * The compact phase's shorter bottom scrim used to be declared here, in
 * two values split at md. Both are gone with the compact BAND: the hero is
 * one height in all three phases now, so there is one footprint to protect
 * and one scrim height — --scrim-h, set on the section in ./hero.tsx.
 *
 * ONE EXCEPTION, and it is a width, not a phase height. Below 390px the
 * `before` block wraps to 478px, past the whole of the 448px default, and
 * the top of the title sat on unprotected photograph — 1.76:1 measured on
 * hands-bible and 1.42:1 on taji-choir. Those widths take --scrim-h-narrow
 * instead. The derivation, and why it is scoped to `before` and to below
 * 390 rather than applied everywhere, is on HERO_SCRIM_BOTTOM_HEIGHT in
 * src/lib/hero.ts.
 *
 * Written out as a literal string, like everything else here: Tailwind
 * finds class names by scanning source text, so a name assembled at
 * runtime is a name it never generates. `max-[390px]` compiles to
 * `width < 390px`, so 390 itself keeps the default — which is what the
 * measurements say it should, at 83% of it.
 */
const NARROW_SCRIM_HEIGHT =
  "max-[390px]:group-data-[hero-phase=before]/hero:h-[var(--scrim-h-narrow)]";

export function HeroRotation({
  images,
  children,
}: {
  images: HeroImage[];
  children: ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const rotating = mounted && !shouldReduceMotion && images.length > 1;

  useEffect(() => {
    if (!rotating || paused) return;
    // Dwell plus fade. The interval has to be the sum, not the dwell: at
    // 6000ms the next crossfade would begin 800ms before the current one
    // finished, and each image would be fully still for 5.2 seconds
    // rather than the six it is meant to hold.
    const every = HERO_ROTATION.dwellMs + HERO_ROTATION.fadeMs;
    const id = window.setInterval(
      () => setIndex((current) => (current + 1) % images.length),
      every,
    );
    return () => window.clearInterval(id);
  }, [rotating, paused, images.length]);

  // The preference can be turned on mid-session, and the reduced-motion
  // branch renders only the first image. Without this the index would keep
  // whatever value it had reached and the caption would name a photograph
  // that is no longer mounted.
  useEffect(() => {
    if (shouldReduceMotion) setIndex(0);
  }, [shouldReduceMotion]);

  return (
    <RotationContext.Provider
      value={{
        images,
        index,
        rotating,
        paused,
        toggle: () => setPaused((current) => !current),
      }}
    >
      {children}
    </RotationContext.Provider>
  );
}

/**
 * The frame: the photographs, and one pair of scrims per photograph.
 *
 * ── ONE PAIR OF SCRIMS PER IMAGE, NOT ONE PAIR OVER THE STACK ────────
 *
 * The alpha floor in src/lib/hero.ts is derived against a pure white
 * pixel, which is the worst case any photograph can present, so all three
 * of these pass at it — measured, per image, per width. The scrims are
 * still per image, because the alternative forecloses the fix: if a
 * fourth photograph one day fails, a shared scrim can only be deepened for
 * all of them, which darkens two pictures that were fine to rescue one
 * that was not. `scrimBoost` on a HeroImage is that fix, and it needs the
 * scrim to belong to the image.
 *
 * It also makes the crossfade correct rather than approximately correct: a
 * scrim that is part of the layer fades with it, so at no point in the
 * 800ms is one image sitting under another image's protection.
 *
 * ── z-index INSIDE A LAYER ───────────────────────────────────────────
 *
 * `isolate` on each layer and POSITIVE z-index on the scrims, rather than
 * the -z-20 / -z-10 pair the single-image version used. Negative indices
 * would have been a real bug here: a layer at opacity 1 creates no
 * stacking context, so its scrims would escape into the frame's context
 * and paint above the OTHER layers' images. `isolate` creates the context
 * unconditionally, and then the scrims only have to beat their own image.
 */
export function HeroBackdrop() {
  const { images, index, rotating } = useRotation();
  const layers = rotating ? images : images.slice(0, 1);

  return (
    // -z-10 is load-bearing: this is an absolutely positioned box, and a
    // positioned box paints above the static in-flow content that follows
    // it, which is the text block. The section's `isolate` keeps the
    // negative index contained.
    <div className="absolute inset-0 -z-10 overflow-hidden bg-emperor">
      {layers.map((image, i) => (
        <div
          key={image.desktop.src}
          aria-hidden
          // The hook tools/perf/verify-hero.mjs uses to force one layer
          // visible and measure that photograph's own scrims.
          data-hero-layer={i}
          className="absolute inset-0 isolate"
          style={{
            opacity: i === index ? 1 : 0,
            // Written as an inline transition rather than Tailwind's
            // `transition-opacity duration-*`, because 800ms is not on the
            // duration scale and inventing a token for one use is worse
            // than the declaration. The reduced-motion branch never
            // reaches this: it renders one layer, which never changes
            // opacity, so there is nothing for the preference to stop.
            transition: `opacity ${HERO_ROTATION.fadeMs}ms var(--ease-out-soft)`,
          }}
        >
          {/*
            A REAL <picture>, AND WHY next/image IS NOT USED HERE.

            These two files are different CROPS, not two sizes of one
            photograph, and that is the line between art direction and
            responsive sizing. next/image solves the second: it emits one
            <img> with a srcset and a `sizes`, the browser picks a width,
            and every candidate is the same picture. There is no value of
            `sizes` that means "below md show the vertical composition" —
            `sizes` describes the box, not the contents. `<source media>`
            is the element that exists for this and it is the only thing
            that expresses it.

            The optimiser is not being given up for nothing, either.
            Each file is already written at exactly the dimensions its own
            breakpoint paints it at (tools/assets/hero-photos.mjs), and
            every one of them is UNDER what the device asks for rather than
            over: the phone crops are 941px wide against the 1170 a 390px
            viewport wants at DPR 3, and the wide crops are 1672 against
            1920. There is no smaller variant worth generating, so a
            srcset would be one candidate long and /_next/image would be a
            re-encode of an already-tuned WebP.

            Two consequences to keep in mind if this is ever revisited:
            `quality` is now the converter's business rather than a prop,
            and `priority` is gone — see `fetchPriority` below and the
            preload link in hero.tsx, which together are what that prop
            was doing.
          */}
          <picture>
            <source
              media={ART_DIRECTION.media}
              srcSet={image.desktop.src}
              width={image.desktop.width}
              height={image.desktop.height}
            />
            <img
              src={image.mobile.src}
              alt=""
              aria-hidden
              width={image.mobile.width}
              height={image.mobile.height}
              // Only the first, and only ever the first. Eagerly fetching
              // three photographs would take bandwidth from the LCP to get
              // two pictures that cannot be seen for another six seconds.
              // `high` rather than `priority`: this is a plain img, so it
              // says the same thing to the browser directly, and the
              // preload that `priority` also emitted is in hero.tsx where
              // it can carry the same media query the source above does.
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              decoding="async"
              // Rendered sharp: no blur filter, no transform. The crop is
              // per SOURCE now, not per image, so there are two positions
              // to carry and the element carries both as VALUES only —
              // the object-position declarations themselves are the
              // `.art-crop` rules in globals.css.
              //
              // That split is load-bearing. <source media> swaps the file
              // and cannot swap a style, so the desktop position has to
              // come from a media query; and an inline object-position
              // would beat that media query at every width, leaving the
              // wide crop positioned by the phone's number. Handing CSS
              // two custom properties and letting it own both declarations
              // is what makes the override work by ordinary cascade order
              // rather than by !important.
              //
              // As a style, not a Tailwind arbitrary value: the class
              // would have to be assembled from the data at runtime, and
              // Tailwind finds class names by scanning source text.
              style={
                {
                  "--art-position": image.mobile.position ?? "50% 50%",
                  "--art-position-md": image.desktop.position ?? "50% 50%",
                } as CSSProperties
              }
              // absolute inset-0 size-full replaces next/image's `fill`,
              // which is the same three declarations under a prop name.
              className="art-crop absolute inset-0 size-full object-cover"
            />
          </picture>

          {/* Behind the header. */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 z-10 h-44"
            style={{ backgroundImage: heroScrimTop(image.scrimBoost) }}
          />

          {/* Behind the text block. One height in every phase, matching the
              one band height, except below 390px in `before` where the
              block outgrows it. See HERO_SCRIM_BOTTOM_HEIGHT. */}
          <div
            aria-hidden
            className={`absolute inset-x-0 bottom-0 z-10 h-[var(--scrim-h)] ${NARROW_SCRIM_HEIGHT}`}
            style={{ backgroundImage: heroScrimBottom(image.scrimBoost) }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * The caption line and the pause control, in one row at the foot of the
 * text block.
 *
 * ── WHY IT IS IN FLOW AND WHY ITS HEIGHT IS RESERVED ─────────────────
 *
 * In flow, inside the block the bottom scrim already protects, because
 * that scrim is the only place on this photograph where white type is
 * measured to survive — and a floating credit in a corner would need a
 * pill of its own to be legible, which is a second treatment for the same
 * problem.
 *
 * Its height is reserved whether or not there is a caption to show. Only
 * two of the three photographs have one, so a row that collapsed when
 * empty would move the entire text block up and down by its own height
 * every six seconds. That is layout shift caused by decoration, on the
 * page whose CLS matters most.
 *
 * ── ONE PARAGRAPH PER CAPTION, STACKED ───────────────────────────────
 *
 * A single element whose text is swapped cannot crossfade: the old string
 * is gone the moment the new one is assigned. So each caption is its own
 * absolutely positioned paragraph with its own opacity transition, on the
 * same duration as the images, which is what makes the caption arrive with
 * its photograph rather than a moment before or after it.
 *
 * No `aria-live`. The captions are ordinary text and the rotation is not
 * an update a reader asked for; announcing each one would interrupt
 * whatever is being read every six seconds. The inactive paragraphs carry
 * `aria-hidden`, so only the caption on screen is in the accessibility
 * tree.
 */
export function HeroCaption() {
  const { images, index, rotating, paused, toggle } = useRotation();
  const layers = rotating ? images : images.slice(0, 1);

  return (
    <div className="mt-6 flex items-center gap-3">
      {/* The control's SLOT, not the control. It is a fixed 20px box that
          exists whether or not there is a button in it, because the caption
          beside it is `flex-1` and a button appearing at hydration would
          otherwise narrow that box — a width change, which counts as layout
          shift even though nothing moves. Measured: this is the difference
          between CLS 0.0002 and 0.0000 on the home page, and the mover
          tools/perf/cls.mjs named was this row.

          It also means the reduced-motion branch and the rotating branch
          are the same shape, so a reader who has set the preference is not
          getting a different layout, only a stiller one. */}
      <div className="size-5 shrink-0">
      {rotating ? (
        <button
          type="button"
          onClick={toggle}
          // The state is in the label, not only in the icon. A screen
          // reader gets "Pause the background photographs" or "Play the
          // background photographs" rather than a button whose name never
          // changes.
          aria-label={
            paused
              ? "Play the background photographs"
              : "Pause the background photographs"
          }
          // A pseudo-element hit area, the same technique the bookmark
          // toggle uses: the painted control is 20px because it sits
          // beside a 12px caption and a 44px square there would read as
          // the loudest thing in the hero, but the target is 44px.
          // tools/perf/responsive.mjs reads the negative insets back and
          // scores the real target.
          className="relative block rounded-control text-white transition-opacity duration-fast ease-out-soft before:absolute before:-inset-3 before:content-[''] hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {paused ? (
            <Play aria-hidden className="size-5" />
          ) : (
            <Pause aria-hidden className="size-5" />
          )}
        </button>
      ) : null}
      </div>

      {/* min-h-5 matches the 20px line box of the captions inside it, so
          the row is exactly as tall as a caption whether one is shown or
          not. `relative` is what the absolutely positioned captions are
          positioned against. */}
      <div className="relative min-h-5 flex-1">
        {layers.map((image, i) => (
          <p
            key={image.desktop.src}
            aria-hidden={i !== index}
            // Pure white, like every other string in this block. The
            // measured ratios are the figures for white; white/80 over
            // these pixels costs about a quarter of the contrast.
            className="absolute inset-x-0 top-0 text-xs leading-5 text-white"
            style={{
              opacity: i === index ? 1 : 0,
              transition: `opacity ${HERO_ROTATION.fadeMs}ms var(--ease-out-soft)`,
            }}
          >
            {image.caption}
          </p>
        ))}
      </div>
    </div>
  );
}
