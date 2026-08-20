"use client";

import { CalendarClock } from "lucide-react";
import { NowCard } from "@/features/schedule/components/now-card";
import { SessionCard } from "@/features/schedule/components/session-card";
import { getTodayState, type TimedSession } from "@/features/schedule/lib/today";
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
 *
 * ── THEN THE HEADING SHRANK, AND THE ARITHMETIC WAS WRONG ────────────
 *
 * This page now renders NowCard in its `badge` form: the display-size
 * heading becomes a 12px eyebrow beside the dot and the section gap goes
 * 3 to 2. The obvious move was to subtract that 44px from each number
 * above and be done, and it was written that way first. It was wrong,
 * because the card's width changed in the same pass — the player block is
 * now capped and left aligned rather than filling the content column — and
 * a session card's height is mostly a function of how much it wraps.
 *
 * So it was walked again rather than reasoned about: every day of the
 * programme at twelve times each, five widths, tallest card recorded.
 *
 *   1440  card 686 wide  198px      768  card 686 wide  226px
 *   1024  card 686 wide  198px      390  card 350 wide  302px
 *                                   320  card 280 wide  332px
 *
 * 21rem (336px) below sm and 14.5rem (232px) from sm, each clearing its
 * own worst case with a few pixels to spare. The subtraction would have
 * given 256px and 192px, both of which are UNDER the real worst case and
 * would have shifted the footer on the days that hit it.
 *
 * Worth recording: the previous 288/224 was under the worst case too, by
 * 44px at 320 and 2px at 768. This is a small correctness fix as well as
 * a re-derivation.
 *
 * The drivers are unchanged — the two untimed all-block activities that
 * carry a note, Sunday's Medical Camp and the closing Sabbath's Sabbath
 * Preparation — plus the longest weekday session titles at 320.
 *
 * ── AND OFF ENTIRELY FROM xl ─────────────────────────────────────────
 *
 * From xl the card sits in the column BESIDE the player rather than under
 * it, so the row's height is the player's 441px and the card's own height
 * cannot move anything below it. There is nothing to reserve against, and
 * a reserve there would only reintroduce the dead space this whole change
 * exists to remove. The worst card in that column measures 310px against
 * the player's 441px, so it never sets the row height either.
 *
 * ── WALKED A THIRD TIME, BECAUSE THE SLOT GAINED A SECOND STATE ──────
 *
 * The slot now holds an up-next CARD when nothing is live, where it used
 * to hold one line of text, so the tallest thing it can contain is no
 * longer only the live card. Walked again with both states in it:
 *
 *   320  336px      390  306px      768  230px      1024  202px
 *
 * 336 at 320 is exactly the 21rem this was set to, i.e. no slack at all,
 * and a floor with no slack fails the first time a title gets longer. So
 * 21.5rem (344px) below 360, and a third step is added rather than
 * carrying 320's worst case all the way to 640: 390 needs only 306, and
 * 19.5rem (312px) there gives back 32px of what would otherwise be empty
 * on the commonest phone width in this congregation.
 *
 * 15rem (240px) from sm, against a 230px worst case.
 *
 * ── AND A FOURTH TIME, BECAUSE THE HEADING LINE BECAME A PILL ────────
 *
 * The line above the card — "Live now" / "Not live right now — up next" —
 * gained a tinted ground and a hairline in the livestream visual pass, so
 * it is 10px taller than it was: py-1 either side plus the 1px ring. Every
 * one of the four numbers above measures a heading PLUS a card, so all
 * four move by the same 10px, and 0.75rem (12px) is added rather than
 * 10px so each keeps the slack it was derived with.
 *
 * 22.25rem (356px) / 20.25rem (324px) / 15.75rem (252px).
 *
 * Then walked again to check the arithmetic rather than trust it — eight
 * days, seventeen times each, eight widths, tallest slot content recorded:
 *
 *   320  344px    480  260px    1024  210px
 *   360  290px    640  238px    1279  210px
 *   390  290px    768  238px
 *
 * Every step clears its own worst case: 356 > 344, 324 > 290, 252 > 238.
 *
 * The 390 reading is 16px UNDER the derivation above (306 + 10 = 316) and
 * the reserve is deliberately left at the higher number. Seventeen times a
 * day is a coarser sample than the twelve-per-day-per-width walk the
 * original numbers came from, so a lower reading here is evidence that
 * this sample missed the worst case, not that the worst case moved.
 *
 * CLS on /livestream after the change: 0.0000 median and 0.0000 max over
 * 7 cold runs at both 390x844 and 1440x900 (tools/perf/cls.mjs).
 */
const NOW_SLOT =
  "min-h-[22.25rem] min-[360px]:min-h-[20.25rem] sm:min-h-[15.75rem] xl:min-h-0";

/**
 * What the slot holds when nothing is live.
 *
 * ── THE RESERVE HAD TO HOLD SOMETHING ────────────────────────────────
 *
 * This used to be one 40px line of grey text — "Nothing is scheduled right
 * now" — sitting in a box reserved for the tallest card of the week. On a
 * 390px phone that is 40px of content in 336px of box, and the other 296px
 * is exactly the empty white the page was reported for. Measured on
 * production at 21:46, when nothing was on: box 336, content 40.
 *
 * Collapsing the reserve was measured instead of assumed, cold, at 390:
 * CLS 0.0112 with nothing scheduled, 0.0540 on a typical card and 0.0860
 * on the tallest card of the week. All three are inside the 0.1 "good"
 * threshold and none of them is zero, and this project's gate is a
 * Lighthouse 100 that only a zero earns. So the reserve stays.
 *
 * If the box has to be that tall, the answer is to put something in it.
 * `state.next` is already computed — it is what the home page's Next Up
 * reads — and it crosses midnight, so there is always a next session even
 * at eleven at night on the closing Sabbath. A reader who opens this page
 * during a break now gets the thing they would otherwise have gone looking
 * for, in the space that was empty, and the slot holds a card in both
 * states rather than a card in one and a sentence in the other.
 */
function UpNext({ next }: { next: TimedSession }) {
  return (
    <section aria-labelledby="now-heading" className="flex flex-col gap-2">
      {/* The same one-line shape as the live badge, so the slot does not
          change kind between states — only what the line says and whether
          the dot is pulsing. A static grey dot rather than the live green
          one: LiveDot means "this is going out now" and it would be a
          false claim here. */}
      <h2
        id="now-heading"
        /* The same pill NowCard's badge variant now draws, kept in step by
           hand because the two are different components rendering the same
           line in the same slot. If one gains an edge the other has to. */
        className="flex w-fit items-center gap-2 rounded-control bg-surface-muted px-2.5 py-1 text-sm font-medium leading-5 text-ink ring-1 ring-line"
      >
        <span
          aria-hidden
          className="size-2.5 shrink-0 rounded-full bg-ink-muted/40"
        />
        Not live right now — up next
      </h2>
      <SessionCard session={next} />
    </section>
  );
}

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
        /* `badge`, and no action. The live player is directly above this
           card, so a display heading repeating "Happening now" and a
           button offering to take the reader to the player they are
           already looking at are both saying it twice. */
        <NowCard current={state.current} variant="badge" />
      ) : state.next ? (
        <UpNext next={state.next} />
      ) : (
        /* Unreachable in practice — `state.next` crosses midnight, so there
           is always a next session — but it is the fallback and it renders
           in the same reserved box as the two cards above. As a bare line
           of grey it looked like the card had failed to draw. The dashed
           panel is the same shape the archive's pending slots and the
           after-phase empty state use, so "nothing here yet" has one look
           across the page. */
        <div className="flex items-start gap-3 rounded-card border border-dashed border-line bg-surface-muted/50 p-4">
          <CalendarClock
            aria-hidden
            className="mt-0.5 size-5 shrink-0 text-ink-muted"
          />
          <p className="text-sm text-ink-muted">
            Nothing is scheduled right now. Check the programme for the next
            session.
          </p>
        </div>
      )}
    </div>
  );
}
