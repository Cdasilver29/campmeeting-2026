import type { ReactNode } from "react";
import { BandDrift } from "@/components/band-drift";
import { cn } from "@/lib/utils";

/**
 * A full-bleed horizontal band: it spans the viewport, its contents sit on
 * the shell, and it owns the vertical air above and below them.
 *
 * This is the piece that was missing. Every page was one column of one
 * width on one white surface with one `py-16` between everything, which is
 * why they read as a single long document regardless of what was in them.
 * A band breaks the column without moving the content off the grid: the
 * background runs edge to edge, the type does not move a pixel sideways.
 *
 * Adjacent bands alternate tone, and two or three per page is the ceiling.
 * More than that and the alternation stops being rhythm and becomes
 * stripes — at which point it is decoration, which is the one thing the
 * brief for this site rules out.
 *
 * Flat colour only. No image, no gradient, no pattern, in any band.
 *
 * A plain `div`, not a `section`. An unlabelled `section` is either
 * ignored by assistive technology or announced as an anonymous region, and
 * the pages already carry properly labelled `section` elements inside
 * these bands. Adding a second, nameless one around each would be noise.
 */
export function Band({
  tone = "surface",
  children,
  className,
  innerClassName,
  drift = true,
}: {
  /** `muted` paints --color-surface-muted; `surface` leaves the page ground. */
  tone?: "surface" | "muted";
  children: ReactNode;
  /** Applied to the full-bleed element. */
  className?: string;
  /** Applied to the shell inside it. */
  innerClassName?: string;
  /**
   * Scroll-linked settle on the band's contents — see band-drift.tsx.
   *
   * On by default, because a band boundary that reads as a transition on
   * eleven routes and as a join on the twelfth is not a system. Opted out
   * on `/schedule` and `/schedule/[day]` only, for the same reasons those
   * pages are excluded from Reveal: the programme is 27,000px of
   * server-rendered content behind `content-visibility: auto`, and tying a
   * transform to the scroll position of a band that IS the document is
   * both pointless and the one place it could cost something.
   */
  drift?: boolean;
}) {
  const inner = cn("shell", innerClassName);

  return (
    /* data-tone is what lets the stylesheet see a join with no edge in
       it. Two bands of the SAME tone put 2 x --space-band between their
       contents and draw no boundary for it, which is the gap that made
       the home page read as three unrelated blocks; two bands of
       DIFFERENT tones keep both steps, because there the surface change
       is real. CSS cannot read a prop, and sniffing for the background
       utility would be a class name doing a data attribute's job. The
       rule is in globals.css beside the `band` utility. */
    <div
      data-tone={tone}
      className={cn("band", tone === "muted" && "bg-surface-muted", className)}
    >
      {drift ? (
        <BandDrift className={inner}>{children}</BandDrift>
      ) : (
        <div className={inner}>{children}</div>
      )}
    </div>
  );
}
