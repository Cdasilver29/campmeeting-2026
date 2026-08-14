import Link from "next/link";
import { eventInfo } from "@/data";
import { cn } from "@/lib/utils";

/**
 * The mark is painted through a CSS mask rather than an `<img>` or an
 * inlined path.
 *
 * public/brand/adventist-mark.svg is fill="currentColor", and an `<img>`
 * resolves that against the image's own root, not ours — it would come
 * out black on every surface, which is wrong the moment the lockup sits
 * on anything dark. Inlining the paths into TSX would put a second copy
 * of the artwork in the repo, and public/brand/README.md exists so there
 * is exactly one copy to swap when the official vector arrives.
 *
 * Masking keeps the single file and makes the mark inherit `color` like
 * text does. The counters (the gaps between the flame strokes and inside
 * the book) stay transparent, so the surface shows through them.
 *
 * The flame-book-cross is the church's identity mark, not decoration, so
 * it is exempt from the "no decorative religious icons" rule. It is also
 * the only such mark on the site.
 */
function Mark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("shrink-0 bg-current mask-brand-mark", className)}
    />
  );
}

/**
 * Header and footer lockup: mark, then the church name over "Nairobi".
 *
 * ── THE SHORT FORM, AND WHY IT IS "Newlife" OVER "Nairobi" ────────────
 *
 * The wordmark used to disappear below `sm` and leave the mark on its
 * own, which meant a phone reader arriving from a shared link saw an
 * unfamiliar symbol and no name. It is back, in a deliberately designed
 * short form rather than a shrunk copy of the desktop one, because the
 * desktop one does not fit and shrinking it further is not a fix: at
 * 320px the content box is 280px, and a 48px mark, a 48px theme toggle,
 * a 48px menu button and the gaps between them account for 158px of it.
 * "Seventh-day Adventist Church Newlife" cannot be set in the 106px
 * that leaves at any size a person would read.
 *
 * The two candidates were "Newlife" over "Camp Meeting 2026" and
 * "Newlife" over "Nairobi". This is the second, for three reasons:
 *
 *   1. It is the desktop lockup truncated, not a different lockup. The
 *      second line means the same thing at every width, so nothing about
 *      the mark's identity changes as the viewport does.
 *   2. Every page on this site is about the camp meeting. What the header
 *      can usefully add is WHICH CHURCH, which is the one thing the rest
 *      of the page does not say.
 *   3. On the home page "Camp Meeting 2026" would sit directly above an
 *      h1 whose kicker is "Camp Meeting 2026".
 *
 * The accessible name is the full church name at every width. The short
 * form is `aria-hidden` and the full name is `sr-only` below `sm`, so
 * the announced name never contains the truncation twice, and the
 * visible "Newlife" is a substring of what is announced, which is what
 * WCAG 2.5.3 asks. No aria-label is used, so nothing overrides visible
 * text.
 */
export function BrandLockup({
  size = "header",
  className,
}: {
  size?: "header" | "footer";
  className?: string;
}) {
  const isFooter = size === "footer";

  return (
    <Link
      href="/"
      className={cn(
        // w-fit and min-h-11: in the footer this was a 379x40 link running
        // the full width of its column, which is both under the tap-target
        // floor and a mis-hit magnet — a click anywhere in that band went
        // to the home page.
        "group flex w-fit min-h-11 min-w-11 items-center gap-2.5 rounded-control text-ink transition-colors duration-fast ease-out-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
        isFooter && "gap-2",
        // Over the hero photograph the lockup goes pure white, mark
        // included: the mark is painted with `bg-current` so it follows
        // the same colour as the wordmark. Keyed to the header's state
        // attribute, so it is inert in the footer, which has neither the
        // group nor the attribute.
        "group-data-[header-state=transparent]/header:text-white",
        className,
      )}
    >
      <Mark className={isFooter ? "size-10" : "size-12"} />
      {/* data-wordmark is a hook for tools/perf/phone-hero.mjs, which has
          to measure whether this wraps. Shape-sniffing is not good enough:
          `a span:not(.sr-only)` matches the 48px mask span first, and the
          harness reported a two-line wordmark for a mark that has no
          lines at all. */}
      <span
        data-wordmark
        className={cn(
          "flex flex-col font-display leading-tight",
          isFooter ? "text-xs" : "text-sm",
        )}
      >
        <span>
          {/* Below sm the short form is what is painted and the full name
              is what is announced. aria-hidden on the visible one so the
              accessible name is not "Newlife Seventh-day Adventist Church
              Newlife".

              ── AND AGAIN FROM lg TO xl, WHICH IS THE MEASURED PART ─────
              The short form comes BACK for one band, 1024 to 1279, and
              this is not symmetry for its own sake. That is exactly where
              the desktop nav appears and the bar is fullest. Measured at
              1024 on five routes: the shell's content box is 944px, the
              nine-link nav takes 738px, the toggle and menu cluster 32,
              the two flex gaps 32 — which leaves the lockup 142px of a
              natural 312. It did not overflow. It wrapped "Seventh-day
              Adventist Church Newlife" to FOUR lines and made the lockup
              100px tall inside an 80px header band.

              So the bar fitting at lg was only ever true because the
              wordmark was being crushed to pay for it. 1100 is two lines,
              1152 is two, and it is one line again at 1280 — which is
              where xl is and why that is the breakpoint the full name
              comes back at.

              Between sm and lg the nav is in the sheet and the lockup has
              the whole bar, so the full name stays there. The accessible
              name is the full church name at every width, unchanged: the
              hidden branch is `sr-only`, not `hidden`. */}
          <span aria-hidden className="sm:hidden lg:inline xl:hidden">
            {eventInfo.church.shortName}
          </span>
          <span className="sr-only sm:not-sr-only lg:sr-only xl:not-sr-only">
            {eventInfo.church.name}
          </span>
        </span>
        {/* The city, not the street. eventInfo.church.address is the full
            postal line and belongs in the footer contact block, not here.

            Muted ink would fail against the hero's top scrim, so over the
            photograph this line is white like the rest of the lockup and
            stays subordinate by size alone. */}
        <span className="text-ink-muted group-data-[header-state=transparent]/header:text-white">
          Nairobi
        </span>
      </span>
    </Link>
  );
}
