"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import {
  HERO_ROTATION,
  heroImageSizes,
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
 * render, so the first paint is one image with `priority` and nothing
 * else: no second request competing with the LCP, no third. The other two
 * mount in an effect, which by definition runs after that paint, and they
 * are not `priority`, so they are fetched lazily afterwards.
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

/**
 * The compact phase's shorter bottom scrim. It lives here rather than in
 * hero.tsx because the scrims themselves do now — they are per image, so
 * they moved into the layer that owns them.
 *
 * `group-data-`, so it is a descendant selector against `group/hero` on
 * the section. Written out as a literal string: Tailwind finds class names
 * by scanning source text, so a name assembled at runtime is a name it
 * never generates.
 */
const COMPACT_SCRIM_HEIGHT =
  "group-data-[hero-phase=during]/hero:h-[var(--scrim-h-compact)] group-data-[hero-phase=after]/hero:h-[var(--scrim-h-compact)]";

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
          key={image.src}
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
          <Image
            src={image.src}
            alt=""
            aria-hidden
            fill
            // Only the first. Preloading three photographs would take
            // bandwidth from the LCP to fetch two pictures that cannot be
            // seen for another six seconds.
            priority={i === 0}
            sizes={heroImageSizes(image)}
            quality={90}
            // Rendered sharp: no blur filter, no transform. The crop is
            // per image and lives on the image — one value could not be
            // right for three different compositions, and the compact
            // phase is where that bites: it keeps about half the height,
            // and a photograph of people standing at the top of the frame
            // loses every face to a centred window. Each value is derived
            // and rendered rather than guessed; see HeroImage.position in
            // src/lib/hero.ts.
            //
            // As a style, not a Tailwind arbitrary value: the class would
            // have to be assembled from the data at runtime, and Tailwind
            // finds class names by scanning source text.
            style={{ objectPosition: image.position ?? "50% 50%" }}
            className="object-cover"
          />

          {/* Behind the header. */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 z-10 h-44"
            style={{ backgroundImage: heroScrimTop(image.scrimBoost) }}
          />

          {/* Behind the text block. Height is phase-dependent because the
              type is: the compact phases set a smaller theme, verse and
              meta line, so their footprint is smaller and the scrim that
              covers it can be shorter. See HERO_SCRIM_BOTTOM_HEIGHT. */}
          <div
            aria-hidden
            className={`absolute inset-x-0 bottom-0 z-10 h-[var(--scrim-h)] ${COMPACT_SCRIM_HEIGHT}`}
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
            key={image.src}
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
