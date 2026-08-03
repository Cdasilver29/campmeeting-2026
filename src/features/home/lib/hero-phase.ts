import { eventPhase, type EventPhase } from "@/features/schedule/lib/time";
import { eventPhaseScript } from "@/lib/event-phase-script";

/**
 * Which phase the hero is drawn in, resolved without a layout shift.
 *
 * The problem this solves. The brief wants the hero's height to follow the
 * event phase and to reserve that height with no shift. Those two pull
 * against each other on this site: every page is statically generated, so
 * the server HTML cannot know the viewer's clock, which is exactly why
 * useNow() returns undefined on the first render and TodayView paints a
 * skeleton. Sizing the hero from that hook would mean the band changed
 * height on mount — a layout shift, and a large one, since the difference
 * between full bleed and 60svh is 40% of the viewport.
 *
 * So the phase is resolved twice, and never on mount:
 *
 *   1. At build time, on the server, as the rendered attribute value.
 *      Correct for every visit inside the phase the build was made in,
 *      and the only value a client with JavaScript disabled ever sees.
 *   2. Before first paint, by the tiny script below, which re-reads the
 *      Africa/Nairobi date and corrects the attribute if the build has
 *      outlived its phase. It runs during parse, so the element carries
 *      its final height before anything is painted.
 *
 * Step 2 is what keeps a July deploy from showing a full-bleed countdown
 * hero during the event in August. Without it the fix would be "remember
 * to redeploy", which is not a fix.
 *
 * This is the same technique next-themes already uses in this app to avoid
 * a flash of the wrong theme, for the same reason.
 */

/** The two heights the hero is drawn at. `during` and `after` share one. */
export type HeroPhase = EventPhase;

export const HERO_PHASE_ATTRIBUTE = "data-hero-phase";

/** The phase baked into the HTML. See point 1 above. */
export function buildTimeHeroPhase(): HeroPhase {
  return eventPhase(new Date());
}

/**
 * The pre-paint correction, as a string for dangerouslySetInnerHTML.
 *
 * The generator moved to src/lib/event-phase-script.ts when /livestream
 * turned out to need exactly the same correction for exactly the same
 * reason — see the note there. This is the hero's binding of it.
 */
export function heroPhaseScript(elementId: string): string {
  return eventPhaseScript(elementId, HERO_PHASE_ATTRIBUTE);
}
