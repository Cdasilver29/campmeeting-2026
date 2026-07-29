"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
} from "framer-motion";

/**
 * `m` under LazyMotion rather than `motion`.
 *
 * `motion` pulls Framer's whole feature set into the shared bundle on
 * every route — 58 KB of it, about 70% of which Lighthouse measured as
 * unused, for one opacity-and-offset transition. `m` with the DOM
 * animation set is the same transition without the gesture, drag and
 * layout-projection machinery.
 *
 * The features are imported statically, not behind a dynamic import.
 * Loading them lazily is the obvious next step and it measured worse:
 * LazyMotion re-renders its subtree when the features land, and on
 * /schedule that subtree is the whole programme, ~4,700 elements, which
 * roughly tripled total blocking time. The bytes were not worth the
 * re-render.
 *
 * What this buys is 14 KB off the shared bundle on every route. It does
 * not move the Lighthouse performance score: four runs of /schedule
 * either way landed inside each other's spread. Bytes on the wire are
 * the reason to keep it, not the score.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  // The CSS reduced-motion block in globals.css only zeroes out
  // CSS-driven animation/transition durations — it has no effect on
  // Framer's JS-driven transforms. useReducedMotion is the JS-level
  // check, so this is a genuine no-op (no wrapper, no animation) rather
  // than an animation that merely completes instantly.
  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );
}
