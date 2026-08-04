"use client";

import {
  Children,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
 * WHAT THIS IS NOT FOR
 * Individual session rows. /schedule renders the whole programme, several
 * hundred rows, and giving each one an IntersectionObserver and a
 * transform would be both seasick to read and expensive to run. Sections
 * only: a heading and the block under it, or a grid taken as a whole.
 *
 * ── TWO BUGS THAT MADE ALL OF THIS INERT ─────────────────────────────
 *
 * Until this was measured, no Reveal on this site had ever animated. Not
 * on /about, /faq, /contact, /downloads, /ministries or /speakers. Every
 * one of them server-rendered as `opacity:1;transform:none` and stayed
 * there. Two independent causes, and both had to be fixed:
 *
 * 1. `whileInView` needs Framer's `inView` feature. The LazyMotion
 *    provider loads `domAnimation`, which is `animation` + `exit` +
 *    hover/tap/focus gestures and nothing else. `inView` is in neither
 *    `domAnimation` nor `domMax` — those are the only two bundles the
 *    package exports — so `whileInView` was a prop nothing consumed. It
 *    fails silently: no warning, no error, no animation.
 *
 * 2. `AnimatePresence initial={false}` in page-transition.tsx blocks the
 *    initial state of every motion component beneath it, not just its own
 *    direct children. Framer reads it out of PresenceContext:
 *
 *      isInitialAnimationBlocked = presenceContext.initial === false
 *      variantToSet = isInitialAnimationBlocked ? animate : initial
 *
 *    So `initial="hidden"` was discarded site-wide and every element was
 *    born in its `shown` state. That `initial={false}` is deliberate and
 *    correct — it is what stops the whole page fading in on first load —
 *    so the fix is not to remove it.
 *
 * The fix for both is the same one: stop using `whileInView` and stop
 * relying on `initial`. The trigger is a plain IntersectionObserver below,
 * and the state is carried on the `animate` prop, which is the `animation`
 * feature and is loaded. An element mounts with `animate="hidden"`, so
 * blocking the initial animation now initialises it hidden — the blocked
 * path and the wanted path agree — and flipping `animate` to "shown" later
 * is an ordinary animation that nothing suppresses.
 *
 * Timings are repeated as literals here for the same reason
 * page-transition.tsx repeats them: these are JS-driven transforms and
 * cannot read a CSS custom property. The curve is --ease-out-soft.
 */

/**
 * Per element. The brief's ceiling is 500ms; this sits well under it,
 * because a section entrance that is legible as a duration has already
 * drawn attention to itself.
 */
const DURATION = 0.32;
const EASE = [0.22, 1, 0.36, 1] as const;
const OFFSET = 12;

/**
 * THE STAGGER, AND WHY IT IS CAPPED RATHER THAN FIXED.
 *
 * A fixed per-child delay is fine for four cards and wrong for twelve: at
 * 0.06s the fourth card starts 180ms after the first, which reads as one
 * movement with texture, and the twelfth starts 660ms after it, which
 * reads as a queue. The last card should not be visibly waiting its turn.
 *
 * So the delay is a budget, not a constant. STAGGER is the gap between two
 * adjacent children when there is room for it; STAGGER_WINDOW is the total
 * the first and last child may be separated by, whatever the count. With n
 * children the gap used is min(STAGGER, WINDOW / (n - 1)):
 *
 *   3 children   0.10 apart, last starts at 0.20   (the hero)
 *   4 children   0.06 apart, last starts at 0.18   (speakers, ministries)
 *   13 children  0.02 apart, last starts at 0.24
 *
 * The whole sequence therefore cannot exceed WINDOW + DURATION = 0.56s
 * however many children are in the group, inside the brief's ~800ms
 * ceiling with room to spare.
 */
const STAGGER = 0.06;
const STAGGER_WINDOW = 0.24;

function staggerFor(children: ReactNode, base: number): number {
  const count = Children.count(children);
  if (count < 2) return 0;
  return Math.min(base, STAGGER_WINDOW / (count - 1));
}

/*
 * Fire a little before the section is fully on screen, and only once. A
 * section that re-animates every time it is scrolled past reads as a
 * glitch rather than as an entrance.
 *
 * Bottom -8% is the trigger line: a section reveals once its top has risen
 * to within 8% of the viewport's bottom edge. A threshold of 0 with that
 * margin, rather than a fraction of the element: a ratio threshold is
 * measured against the TARGET's size, so a section taller than the
 * viewport can never reach 0.15 and would never reveal at all. /about and
 * /faq both have sections that long on a phone.
 *
 * The top margin is the correctness half, and it is not decoration. An
 * IntersectionObserver only reports THRESHOLD CROSSINGS. An element that
 * goes from below the fold to above the viewport between two rendering
 * steps has a ratio of 0 before and 0 after, crosses nothing, and receives
 * no callback at all — so it stays at opacity 0 for the rest of the visit.
 * That is not hypothetical: an in-page anchor, a restored scroll position,
 * End on a keyboard or one flick on a phone all do it, and scrolling
 * /about to the bottom in a single step left two of its five sections
 * permanently invisible.
 *
 * Expanding the root upwards by a distance no document will exceed makes
 * "anywhere above the viewport" an intersecting state, so the element gets
 * its callback and reveals. Checking `boundingClientRect.top < 0` inside
 * the callback does not work and was tried: the callback never runs.
 */
const ROOT_MARGIN = "100000px 0px -8% 0px";
/** The same 8% line, expressed for a manual measurement. */
const TRIGGER_FRACTION = 0.92;

/**
 * ── WHY THIS STARTS SHOWN AND HIDES ITSELF, RATHER THAN STARTING HIDDEN ──
 *
 * The obvious construction is to render at opacity 0 and animate up. It
 * was built that way first and measured, and it costs the thing this site
 * cares most about: content that is on screen at load cannot paint until
 * hydration has run. A/B'd on one build at 4x CPU on a 390px viewport,
 * with reduced motion as the "no animation" arm:
 *
 *   route        static   animated
 *   /about        980ms    1308ms
 *   /faq          928ms    1232ms
 *   /downloads    908ms    1328ms
 *
 * That is not only a metric. On a phone on mobile data those pages were
 * blank for an extra third of a second for no reason a reader benefits
 * from, because the section they were waiting for was already in view and
 * an entrance animation for something already on screen is not an
 * entrance.
 *
 * So the server and the first client render paint everything visible, and
 * a layout effect — which runs after hydration but BEFORE the browser
 * paints that frame — hides only what is still below the trigger line.
 * Hiding something off screen is imperceptible, and it is the only content
 * a scroll reveal was ever for.
 *
 * The consequence, stated plainly: a section already in view when the page
 * loads does not animate. That is deliberate. The hero is the one
 * exception and it opts in with `immediate`, because the brief asks for
 * that one sequence specifically and it is the page's opening statement.
 */
type RevealState = "unset" | "hidden" | "shown";

/*
 * useLayoutEffect is the whole point here — the hide has to land before the
 * browser paints the hydrated frame, and useEffect is one paint too late —
 * but React warns about it during server rendering, where it cannot run.
 * This is the standard isomorphic form: layout effect in the browser, and
 * on the server a hook that is never invoked either way.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function useRevealed<T extends HTMLElement>(immediate = false) {
  const ref = useRef<T>(null);
  // `immediate` starts hidden on the server. It is above the fold by
  // definition, so the paint-then-hide the "unset" path relies on would be
  // a visible flash: the hero appeared, vanished, and faded back in.
  // Measured at 1440x900 before this was fixed — opacity 1.00 at 589ms,
  // 0.00 at 885ms. Everything else starts painted; see the note above.
  const [state, setState] = useState<RevealState>(immediate ? "hidden" : "unset");

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (immediate) return;

    const { top } = element.getBoundingClientRect();
    // Already at or above the trigger line: leave it painted, never
    // animate it, and do not observe it.
    setState(top < window.innerHeight * TRIGGER_FRACTION ? "shown" : "hidden");
  }, [immediate]);

  useEffect(() => {
    if (state !== "hidden") return;
    const element = ref.current;
    if (!element) return;

    if (immediate) {
      // On screen by definition; the sequence starts as soon as it is
      // hidden. A frame of separation is what makes it an animation
      // rather than a jump.
      const id = requestAnimationFrame(() => setState("shown"));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState("shown");
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: ROOT_MARGIN },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [state, immediate]);

  // "unset" paints as shown: it is the server render and the first client
  // render, and both must show the content.
  return { ref, hidden: state === "hidden" };
}

/*
 * The transition lives on each variant rather than on a `transition` prop,
 * because the two directions are not the same event. Going to `hidden` is
 * the layout effect above taking an off-screen element out of view, and it
 * must be instant — animating it would burn 320ms of the budget on a fade
 * nobody can see, and on a fast scroll it could be seen. Going to `shown`
 * is the entrance and is the only part with a duration.
 */
const HIDDEN = { opacity: 0, y: OFFSET, transition: { duration: 0 } };
const shownAfter = (delay: number) => ({
  opacity: 1,
  y: 0,
  transition: { duration: DURATION, ease: EASE, ...(delay ? { delay } : {}) },
});

const itemVariants: Variants = { hidden: HIDDEN, shown: shownAfter(0) };

/*
 * data-reveal is the hook for the no-JavaScript fallback in
 * src/app/layout.tsx. These elements are born at opacity 0, so without
 * that rule a reader with scripting disabled would get a blank page.
 */
const REVEAL_ATTRIBUTE = { "data-reveal": "" };

/**
 * One section, moving as a single unit.
 *
 * Deliberately NOT a staggering parent. A parent that fades itself and
 * also staggers children multiplies the two opacities, so the children
 * arrive through a second fade and the whole thing reads as mush. The
 * staggering parent is RevealGroup, which animates nothing of its own and
 * exists for exactly that reason. A section that wants its parts sequenced
 * uses RevealGroup and RevealItem; one that wants to arrive as a single
 * thing uses this.
 *
 * Under reduced motion this is a plain `<div>` with the same class list,
 * so the DOM and the layout are identical and there is no animation to
 * complete — a real no-op, not a zero-duration one. The CSS media query in
 * globals.css cannot do this on its own: it only zeroes CSS-driven
 * durations, and none of this is CSS-driven.
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
  const { ref, hidden } = useRevealed<HTMLDivElement>();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      ref={ref}
      {...REVEAL_ATTRIBUTE}
      className={className}
      animate={hidden ? "hidden" : "shown"}
      variants={delay ? { hidden: HIDDEN, shown: shownAfter(delay) } : itemVariants}
    >
      {children}
    </m.div>
  );
}

/**
 * A group whose children come in one after another. Use it where the
 * items genuinely read as a set — a grid of speaker cards, a row of
 * ministry cards, the parts of the hero — and not as a way to animate a
 * long list.
 *
 * `immediate` skips the observer and reveals on mount. It is for content
 * that is on screen at load by definition, the hero being the only one:
 * observing an element guaranteed to be intersecting is a callback to
 * learn something already known, and it makes the start of the sequence
 * depend on observer scheduling.
 */
export function RevealGroup({
  children,
  className,
  id,
  stagger = STAGGER,
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  /**
   * An id on the group's own element. Only the hero uses it, so that
   * tools/perf/verify-hero.mjs can find the text block by name rather
   * than by walking siblings off the h1 — a walk that silently stopped
   * describing the block when the block grew a fourth line.
   *
   * It has to be set on both branches below, because the reduced-motion
   * branch renders a different element and a harness run under the
   * preference would otherwise find nothing.
   */
  id?: string;
  stagger?: number;
  immediate?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const { ref, hidden } = useRevealed<HTMLDivElement>(immediate);

  if (shouldReduceMotion) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }

  return (
    <m.div
      ref={ref}
      id={id}
      {...REVEAL_ATTRIBUTE}
      className={className}
      animate={hidden ? "hidden" : "shown"}
      // The group itself has nothing to animate. Its whole job is to hand
      // the hidden/shown label down to its RevealItem children and to
      // space them out on the way in.
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: staggerFor(children, stagger) } },
      }}
    >
      {children}
    </m.div>
  );
}

/**
 * One member of a RevealGroup. Carries no `animate` of its own: it inherits
 * the group's hidden/shown state through Framer's variant context, which is
 * what lets the group's staggerChildren sequence it.
 */
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
    <m.div {...REVEAL_ATTRIBUTE} className={className} variants={itemVariants}>
      {children}
    </m.div>
  );
}
