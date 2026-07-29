"use client";

import type { ReactNode } from "react";
import { m, useReducedMotion, type Variants } from "framer-motion";

/**
 * Reveal-on-scroll for major sections. Fade plus a small upward
 * translate, once, on the way in.
 *
 * `m`, not `motion`, and no LazyMotion of its own. The provider is the one
 * already in src/components/page-transition.tsx, which wraps every page's
 * children — read the note in that file before touching this: the dynamic
 * feature import was measured and reverted, and re-adding it here would
 * reintroduce the same subtree re-render.
 *
 * `whileInView` needs the `inView` feature, which is part of the
 * `domAnimation` bundle that provider already loads, so this costs no
 * extra bytes.
 *
 * WHAT THIS IS NOT FOR
 * Individual session rows. /schedule renders the whole programme, several
 * hundred rows, and giving each one an IntersectionObserver and a
 * transform would be both seasick to read and expensive to run. Sections
 * only: a heading and the block under it, or a grid taken as a whole.
 *
 * Timings match the tokens in globals.css — 0.25s is --duration-base and
 * the curve is --ease-out-soft. They are repeated as literals here for
 * the same reason page-transition.tsx repeats them: this is a JS-driven
 * transform and cannot read a CSS custom property.
 */
const DURATION = 0.25;
const EASE = [0.22, 1, 0.36, 1] as const;
const OFFSET = 12;

/**
 * Fire a little before the section is fully on screen, and only once. A
 * section that re-animates every time it is scrolled past reads as a
 * glitch rather than as an entrance.
 */
const VIEWPORT = { once: true, amount: 0.15, margin: "0px 0px -8% 0px" } as const;

const itemVariants: Variants = {
  hidden: { opacity: 0, y: OFFSET },
  shown: { opacity: 1, y: 0 },
};

/**
 * One section. Under reduced motion this is a plain `<div>` with the same
 * class list, so the DOM and the layout are identical and there is no
 * animation to complete — a real no-op, not a zero-duration one. The CSS
 * media query in globals.css cannot do this on its own: it only zeroes
 * CSS-driven durations, and none of this is CSS-driven.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={VIEWPORT}
      variants={itemVariants}
      transition={{ duration: DURATION, ease: EASE, delay }}
    >
      {children}
    </m.div>
  );
}

/**
 * A group whose children come in one after another. Use it where the
 * items genuinely read as a set — a grid of speaker cards, a row of
 * ministry cards — and not as a way to animate a long list.
 *
 * The stagger is deliberately short. At 0.06s a four-card grid finishes
 * 180ms after the first card starts, which reads as one movement with
 * texture rather than as four separate events.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.06,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={VIEWPORT}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </m.div>
  );
}

/** One member of a RevealGroup. Inherits the group's hidden/shown state. */
export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      variants={itemVariants}
      transition={{ duration: DURATION, ease: EASE }}
    >
      {children}
    </m.div>
  );
}
