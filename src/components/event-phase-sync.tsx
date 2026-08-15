"use client";

import { useEffect, useLayoutEffect } from "react";
import { eventPhase } from "@/features/schedule/lib/time";

/**
 * Re-applies the event phase whenever the element it names is mounted.
 *
 * ── WHY THE PRE-PAINT SCRIPT IS NOT ENOUGH ON ITS OWN ────────────────
 *
 * The phase attribute is resolved twice, both times deliberately: once at
 * BUILD time as the value React renders, and once during parse by the
 * inline script in @/lib/event-phase-script, which rewrites it before the
 * first paint. That pairing is what stops a cold load painting the wrong
 * height, and it works.
 *
 * What it does not survive is a CLIENT-SIDE NAVIGATION back to the page.
 * On that path there is no document request and no parse, so the inline
 * script never runs — React inserts it with innerHTML, and a script
 * inserted that way is never executed by any browser, by specification.
 * React then re-creates the element from the RSC payload, and that payload
 * carries the value the BUILD resolved. So the stale phase comes back.
 *
 * Measured on production on 15 August 2026, a day inside the event, with a
 * build made before it — desktop 1900px and mobile 390px both:
 *
 *   at DOMContentLoaded   during   600px / 464px    (script had run)
 *   after hydration       during   600px / 464px
 *   after client nav      before  1000px / 743px    (stale value restored)
 *
 * The hero was therefore correct on a cold load and wrong after visiting
 * any other page and coming back, which is the reverse of how it looked.
 *
 * ── WHY A LAYOUT EFFECT AND NOT AN EFFECT ────────────────────────────
 *
 * useLayoutEffect runs before the browser paints, so on a client
 * navigation the corrected phase is in place for the first frame of the
 * new page and nothing is ever painted at the wrong height. A plain
 * useEffect runs after paint, which is exactly the layout shift the inline
 * script exists to avoid — trading one visible jump for another.
 *
 * It reads `eventPhase`, the same function the server rendered with and
 * the same comparison the inline script performs, so there is one
 * definition of the three phases and not three of them.
 */

/* useLayoutEffect warns when it is rendered on the server, where it does
   nothing. The component is a client component but still renders during
   SSR, so the hook is chosen per environment rather than silencing the
   warning — on the server this becomes a useEffect that never fires. */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function EventPhaseSync({
  elementId,
  attribute,
}: {
  elementId: string;
  attribute: string;
}) {
  useIsomorphicLayoutEffect(() => {
    const element = document.getElementById(elementId);
    if (element) element.setAttribute(attribute, eventPhase(new Date()));
  }, [elementId, attribute]);

  return null;
}
