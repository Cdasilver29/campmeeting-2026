"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
