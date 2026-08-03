"use client";

import { NowCard } from "@/features/schedule/components/now-card";
import { getTodayState } from "@/features/schedule/lib/today";
import { useNow } from "@/features/schedule/use-now";

/*
 * The one box on this page whose contents cannot be known until the
 * viewer's clock resolves, so it is the one box that reserves a height.
 *
 * "What is on now" is a NowCard, or a single line saying nothing is
 * scheduled, or — for the frame between first paint and mount — nothing at
 * all. Three heights in the last slot before the footer, which is exactly
 * the shape that moves a footer.
 *
 * The two numbers are measured, not guessed. The programme was walked with
 * the clock override pinned to all 258 points at which a card renders, at
 * eight widths, and the tallest card recorded at each:
 *
 *   320px 284   360px 264   390-480px 244   560-639px 224
 *   640-720px 222   768px 202   1024px+ 198
 *
 * The driver at every width is one of the two all-block activities that
 * carry a note — Sunday's Medical Camp and the closing Sabbath's Sabbath
 * Preparation — not an ordinary session card.
 *
 * So 18rem (288px) below sm and 14rem (224px) from sm, each clearing the
 * worst case in its range. Two steps rather than four: above md the reserve
 * is 26px generous, which is a quarter of a line of slack above a footer
 * and not worth a third breakpoint.
 *
 * A min-height, not a height, so a card that somehow exceeds it grows
 * rather than clips. That trades a small shift for unreadable content,
 * which is the right way round.
 */
const NOW_SLOT = "min-h-72 sm:min-h-56";

/**
 * Split out of LivestreamView so that view can be a server component
 * again. This is the only part of the page that needs the viewer's clock;
 * the three phase states around it are static markup selected by an
 * attribute, and putting them behind "use client" for this one card's sake
 * would have shipped all of them as JavaScript for nothing.
 *
 * getTodayState, not a local derivation: "what is on now" is resolved in
 * exactly one place on this site, on Africa/Nairobi wall-clock, and the
 * Today view and this page must never disagree about it.
 */
export function NowSlot() {
  const now = useNow();
  const state = now ? getTodayState(now) : undefined;

  return (
    <div className={NOW_SLOT}>
      {/* Rendered inside the during-phase branch, but the branch is chosen
          by CSS and this component is not, so it checks the phase itself
          rather than assuming the box it is in is the visible one. */}
      {!state || state.phase !== "during" ? null : state.current ? (
        <NowCard current={state.current} />
      ) : (
        <p className="text-sm text-ink-muted">
          Nothing is scheduled right now. Check the programme for the next
          session.
        </p>
      )}
    </div>
  );
}
