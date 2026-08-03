"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * The scroll-linked part of a Band: its contents sit slightly low and
 * slightly pale as the band enters, settle while it owns the viewport, and
 * release as it leaves.
 *
 * WHAT THIS IS FOR
 * The bands were reading as a stack of independent panels — each one
 * arrived, sat there, and ended. Tying a little movement to scroll position
 * rather than to an entrance is what makes the boundary between two bands
 * feel like a transition instead of a join.
 *
 * HOW SUBTLE IT IS, AND WHY THOSE NUMBERS
 * Opacity bottoms out at 0.92 and the travel is 8px. That is deliberately
 * near the threshold of perception: the brief's test is that if it is
 * noticeable as an effect it is too strong, so the numbers are set where a
 * reader registers continuity without being able to point at what moved.
 * 0.92 rather than something lower because band contents include body copy
 * and every contrast ratio on this site was measured at full opacity —
 * dropping to 0.8 would put the palest ink token under the AA floor while
 * it faded, and a contrast floor that only holds when the page is still is
 * not a contrast floor.
 *
 * The ramp is flat across the middle (0.18 to 0.82 of the band's travel)
 * rather than a straight line end to end. A linear map means the content is
 * only ever at full strength for one instant, at the exact midpoint, which
 * is both pointless and the version that reads as a wobble.
 *
 * NOTHING IS PINNED
 * No sticky, no scroll-jacking, no height taken from the document. The
 * phase-aware hero height exists so that someone opening this site during
 * the event gets the live card near the fold, and pinning a section would
 * work directly against that.
 *
 * TRANSFORM AND OPACITY ONLY
 * Both are compositor properties, so a scroll frame here cannot trigger
 * layout. `y` rather than `top` or `margin` for exactly that reason.
 *
 * REDUCED MOTION
 * A plain div with the same class list: no ref, no scroll subscription, no
 * motion values, nothing to interpolate. The CSS media query cannot do this
 * one — a scroll-linked value is not a transition or an animation, so
 * there is no duration for it to zero.
 */

/** The palest the contents get, at the very top and bottom of the travel. */
const OPACITY_FLOOR = 0.92;
/** Pixels of travel, low on the way in and high on the way out. */
const LIFT = 8;
/**
 * Where the ramps end. Between these two the contents are at rest, which is
 * most of the time a band is on screen.
 */
const RAMP = [0, 0.18, 0.82, 1];

export function BandDrift({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  /*
   * The drift is not applied until after mount, and that is a bug fix
   * rather than a nicety.
   *
   * A scroll MotionValue is 0 on the server, because there is no scroll
   * position there. Bound straight into style, that made every band on
   * every route server-render as
   *   style="opacity:0.92;transform:translateY(8px)"
   * — the entry state — so band contents painted 8px low and 8% pale on
   * first paint and then snapped into place at hydration. On every page,
   * on every load, including the ones already on screen.
   *
   * CLS could not catch it and did not: `y` is a transform, and a
   * transform is not a layout shift. It was found by byte-comparing frames
   * under reduced motion, which is the one instrument that looks at what
   * was actually painted.
   *
   * So the server and the first client render carry no inline style at
   * all, and the scroll binding is attached once there is a scroll
   * position to read. A band already in view resolves mid-ramp, at rest,
   * so nothing changes for it; a band below the fold resolves to the entry
   * state, which is exactly what it should be and nobody can see it.
   */
  const [bound, setBound] = useState(false);
  useEffect(() => setBound(true), []);

  /*
   * "start end" to "end start": progress 0 when the band's top reaches the
   * bottom of the viewport, 1 when its bottom passes the top. That is the
   * band's whole visible life, so the ramps above are fractions of
   * something real rather than of an arbitrary window.
   *
   * useScroll attaches one passive listener and one ResizeObserver per
   * target and reads its geometry off them, so this is not a
   * measure-per-frame. It is still not free, which is why the cost was
   * measured rather than assumed — see VISUAL-PASS.md.
   */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, RAMP, [
    OPACITY_FLOOR,
    1,
    1,
    OPACITY_FLOOR,
  ]);
  const y = useTransform(scrollYProgress, RAMP, [LIFT, 0, 0, -LIFT]);

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      ref={ref}
      className={className}
      style={bound ? { opacity, y } : undefined}
    >
      {children}
    </m.div>
  );
}
