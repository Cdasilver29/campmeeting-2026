import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { ScheduleProgramme } from "@/features/schedule/components/schedule-programme";
import { pageMetadata } from "@/lib/metadata";
import { schedulePage } from "@/lib/page-identity";

export const metadata = pageMetadata(schedulePage);

/**
 * The full programme, all days at once. Individual days are pages of
 * their own at /schedule/{day}.
 *
 * Deliberately clock-free. The countdown, live and archive states live on
 * the Today view at "/", which is the page a reader opens to ask what is
 * happening now; repeating them here would make an otherwise entirely
 * static reference page depend on the clock, push the programme itself
 * below the fold on a phone, and shift the layout on mount during the
 * event, since the live and archive states are shorter than the countdown
 * the placeholder has to be sized for.
 */
export default function SchedulePage() {
  return (
    <>
      {/* The header carries its own band, so the programme below starts on
          the page surface the sticky day rail is painted in. Two bands, not
          three: the programme is one thing, 27,000px of it, and striping
          it would be the decoration this site does not do. */}
      <PageHeader {...schedulePage} />

      {/*
        NO REVEAL HERE, AND THAT IS DELIBERATE. DO NOT "FIX" IT.

        Every other content route wraps its sections in Reveal so the site
        moves as one system. This page and /schedule/[day] are the two
        exceptions, for three reasons that all point the same way:

        1. The programme is server-rendered in full, ~4,700 elements, so it
           reads offline and before hydration. That is the whole point of
           the page. Reveal starts an element at opacity 0 and brings it in
           with JavaScript, which would make the one page that must not
           need hydration depend on it.
        2. There is no "section" here to reveal at the right granularity. A
           Reveal around the whole programme would fade 27,000px of document
           as a single unit, and one per day, block or row is per-row motion,
           which this page rules out on cost and on legibility.
        3. content-visibility: auto skips offscreen subtrees, and an
           entrance animation on content the browser has been told not to
           render is work fighting work.

        The nearest thing to an exception is /ministries/[tag], which shows
        a slice of the programme small enough to move as one section.
      */}
      <Band>
        <ScheduleProgramme />
      </Band>
    </>
  );
}
