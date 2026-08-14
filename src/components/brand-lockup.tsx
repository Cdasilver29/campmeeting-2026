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
 * Header and footer lockup: the mark, then the church's name on three
 * fixed lines.
 *
 *     Seventh-day
 *     Adventist Church
 *     Newlife Nairobi
 *
 * ── THE SAME THREE LINES AT EVERY WIDTH ───────────────────────────────
 *
 * Header and footer, phone and desktop, no exceptions and no breakpoint
 * at which the wordmark says something else.
 *
 * That is the whole of the design, and it is worth saying why after
 * several attempts that were not. The wordmark once disappeared below
 * `sm` entirely, so a phone reader arriving from a shared link saw an
 * unfamiliar symbol and no name. It came back as "Newlife" over
 * "Nairobi" — the desktop lockup truncated — which said WHICH church and
 * never said what kind. Then it took a third form between `lg` and `xl`,
 * where the nine-link nav left it 142px of the 312 it wanted. Three
 * breakpoints, four forms, and a mark that changed identity as a window
 * was resized.
 *
 * Fixed lines end all of it. Nothing here reflows, so nothing here can be
 * crushed by whatever else is in the bar, and the break points are the
 * ones chosen in event.ts rather than the ones a container happened to
 * arrive at. The only thing that still moves is the type SIZE, 12px below
 * `sm` and 14px from it, which is the same touch/pointer split every
 * other control on the site uses.
 *
 * ── THE ACCESSIBLE NAME IS THE VISIBLE NAME ───────────────────────────
 *
 * No aria-hidden twin, no sr-only twin, no aria-label. The lines join to
 * the full church name plus the city, in order — the contract documented
 * on `church.wordmarkLines` — so what is painted and what is announced
 * are the same characters.
 *
 * That satisfies WCAG 2.5.3 outright rather than by the substring
 * shortcut the older forms leaned on, where a truncation was painted and
 * the full name spoken beside it. A voice-control user can now say any
 * part of what they can see.
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
      {/* The footer mark was size-10 against the header's size-12, on the
          reasoning that a footer is quieter than a header. It is 56px now.
          The footer lockup sits alone at the top of a three-column grid
          with the whole shell to itself and nothing competing for the
          space, and it is the last thing on every page — the one place the
          church's mark can be the size it is drawn at rather than the size
          a full bar leaves for it. The header stays 48px, where nine nav
          links and two 48px controls are the constraint. */}
      <Mark className={isFooter ? "size-14" : "size-12"} />
      {/* data-wordmark is a hook for tools/perf/phone-hero.mjs, which has
          to measure whether this wraps. Shape-sniffing is not good enough:
          `a span:not(.sr-only)` matches the 48px mask span first, and the
          harness reported a two-line wordmark for a mark that has no
          lines at all. */}
      <span
        data-wordmark
        className={cn(
          // ── THREE FIXED LINES, AT EVERY WIDTH ─────────────────────
          // The lines come from the data, one span each, and they are the
          // same three in the header and the footer, on a phone and on a
          // desktop.
          //
          // FIXED, not wrapped. A single string set to wrap breaks
          // wherever its box happens to end, which is a different place
          // on every screen — the mark would read as three lines here,
          // two there and four at 1024, and a mark that reads differently
          // at two widths is two marks. `whitespace-nowrap` on each line
          // is what guarantees the break points are the ones chosen in
          // event.ts and never the ones a container arrived at.
          //
          // The size step is the touch/pointer split every other control
          // on the site uses. The longest line is "Adventist Church"; at
          // 14px it is wider than a 320px header can give the wordmark
          // once a 48px mark, a 48px toggle and a 48px menu button have
          // taken their share, so it is 12px there and 14px from `sm`.
          "flex flex-col font-display leading-tight",
          "text-xs sm:text-sm",
        )}
      >
        {/* ── PAINTED AND ANNOUNCED, THE SAME CHARACTERS ──────────────
            "Seventh-day / Adventist Church / Newlife Nairobi".

            NO aria-hidden AND NO sr-only TWIN anywhere in here, and that
            is what the contract on `wordmarkLines` buys. This lockup used
            to paint a truncation and announce the full church name beside
            it, which WCAG 2.5.3 permits only because the visible label
            was a SUBSTRING of the spoken one. The lines below join to the
            full name plus the city, in order, so the visible label and
            the accessible name are now the same characters and 2.5.3 is
            satisfied outright rather than by that shortcut. A
            voice-control user can say any part of what they can see.

            ── THE SAME THREE LINES AT EVERY WIDTH ─────────────────────
            There were four forms before: a compact one below sm, the full
            name over "Nairobi" from sm, "Newlife" over "Nairobi" between
            lg and xl where the nine-link nav crushed the lockup, and the
            full name again above xl. Three breakpoints at which the mark
            changed identity as a window was resized. There is one form
            now, and the lg-to-xl squeeze it was managing is gone rather
            than managed: nothing here reflows, so nothing can be crushed.

            `shortName` is no longer read by this component. It stays in
            the data as the substring form for anything that needs one. */}
        {eventInfo.church.wordmarkLines.map((line) => (
          // whitespace-nowrap per line, not on the column: the column
          // must be allowed to be as wide as its widest line, and it is
          // the LINES that must not break.
          <span key={line} className="whitespace-nowrap">
            {line}
          </span>
        ))}
      </span>
    </Link>
  );
}
