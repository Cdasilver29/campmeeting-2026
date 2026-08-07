"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * The page transition: the incoming page fades up, and nothing fades out.
 *
 * ── WHAT THIS REPLACED, AND THE BUG THAT MADE IT ─────────────────────
 *
 * This was Framer's `AnimatePresence mode="wait"` around an `m.div` keyed
 * on the pathname, with `initial`, `animate` and `exit`. It put a visible
 * white gap on every navigation and a long one on /schedule.
 *
 * `mode="wait"` runs the outgoing animation to completion before the
 * incoming one starts, so the shortest possible blank is the exit plus
 * the enter — 500ms of a 250ms transition. Worse, the App Router updates
 * `usePathname()` and the `children` prop in the same render, so the node
 * that plays the EXIT animation is already holding the INCOMING page's
 * markup: the new page painted, faded itself out to opacity 0, waited,
 * and faded back in.
 *
 * On /schedule that is 27,000px and ~4,700 elements mounting while the
 * animation sits at opacity 0 and is starved of frames. Measured on a
 * built server at a 4x CPU throttle, clicking the nav link from "/":
 *
 *     near-blank for 1431ms      / -> /schedule
 *     near-blank for  252ms      / -> /speakers
 *     near-blank for  310ms      /schedule -> /
 *
 * The page every reader opens first and returns to most was blank for
 * about a second and a half on a mid-range phone.
 *
 * ── WHY CSS RATHER THAN FRAMER ───────────────────────────────────────
 *
 * There is no exit animation to coordinate any more, so there is nothing
 * left for a JS animation library to do that a keyframe cannot. Going to
 * CSS buys three things beyond the fix:
 *
 *   1. It cannot starve. A compositor-driven keyframe on opacity and
 *      transform runs off the main thread, so mounting 4,700 elements no
 *      longer holds the animation at zero.
 *   2. `prefers-reduced-motion` is honoured by the global block in
 *      globals.css, which zeroes every animation duration. The Framer
 *      version needed `useReducedMotion` because that block has no
 *      effect on JS-driven transforms — a whole branch of this component
 *      existed only to work around not being CSS.
 *   3. One fewer client component doing JS animation work on every
 *      navigation, on the route where the main thread is scarcest.
 *
 * It does NOT take framer-motion out of the bundle, and an earlier
 * version of this note claimed it did. Reveal and BandDrift both still
 * import `m` under the same LazyMotion feature set, so the library ships
 * either way. The reason to do this is the bug, not the bytes.
 *
 * ── THE FIRST PAINT IS NOT ANIMATED, DELIBERATELY ────────────────────
 *
 * `hasNavigated` stays false until after the first commit, so the class
 * is absent on the server-rendered HTML and on hydration. Two reasons,
 * and the second is the one that matters:
 *
 *   - An `opacity: 0` start on first paint delays the largest contentful
 *     paint by the length of the animation, on every route, for a fade
 *     nobody asked for. The old component avoided this too, with
 *     `AnimatePresence initial={false}`.
 *   - If the stylesheet were ever slow or blocked, an element that
 *     starts at `opacity: 0` in the markup is an invisible page. Nothing
 *     here is invisible until JavaScript has run at least once, so the
 *     server-rendered document is readable on its own — which is the
 *     property /schedule is built around.
 *
 * The `key` is what makes it fire: a changed key remounts the div, and a
 * fresh element runs its animation from the start. Without it the class
 * would already be applied and the browser would have nothing to do.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hasNavigated = useRef(false);

  useEffect(() => {
    // After the first commit every subsequent render is a navigation.
    hasNavigated.current = true;
  }, []);

  return (
    <div key={pathname} className={hasNavigated.current ? "page-enter" : undefined}>
      {children}
    </div>
  );
}
