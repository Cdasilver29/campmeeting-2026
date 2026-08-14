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
 * ── THE PHONE FORM IS "SDA Church Newlife Nairobi" ────────────────────
 *
 * The wordmark used to disappear below `sm` and leave the mark on its
 * own, which meant a phone reader arriving from a shared link saw an
 * unfamiliar symbol and no name. It came back as "Newlife" over
 * "Nairobi", the desktop lockup truncated, because the desktop one does
 * not fit and shrinking it further is not a fix: at 320px the content box
 * is 280px, and a 48px mark, a 48px theme toggle, a 48px menu button and
 * the gaps between them account for 158px of it.
 *
 * That form said WHICH church and it did not say what kind. It is now one
 * wrapping string that says both, plus the city: "SDA Church Newlife
 * Nairobi". It is the same information the two lines carried and the name
 * the congregation actually uses out loud, and it fits in the same box
 * because a name over a city and a phrase that wraps are the same two
 * lines.
 *
 * ── THE ACCESSIBLE NAME IS NOT THE SAME AT EVERY WIDTH ANY MORE ───────
 *
 * It was, and that was worth having while every visible form was a
 * substring of the full church name: the visible text is `aria-hidden`,
 * the full name is `sr-only`, and WCAG 2.5.3 is satisfied because the
 * label a person can see appears inside the name they can speak.
 *
 * "SDA" is not a substring of "Seventh-day Adventist Church Newlife", so
 * that arrangement would break the very rule it exists to keep — a
 * voice-control user saying "click SDA Church" would match nothing.
 * Below `sm` the visible string is therefore the accessible name as well,
 * which satisfies 2.5.3 by being the same characters rather than by
 * containing them. From `sm` up, nothing changed.
 *
 * No aria-label anywhere, so nothing overrides visible text.
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
          // ── ONE LINE, AT EVERY WIDTH ──────────────────────────────
          // The wordmark was a name over a city. It is now a single
          // string that never wraps, so the lockup is one line in the
          // header and one line in the footer, on a phone and on a
          // desktop.
          //
          // `whitespace-nowrap` is the instruction; the SIZE STEP is what
          // makes it safe. At 320px the header's content box is 280px and
          // a 48px mark, a 48px toggle, a 48px menu button and the gaps
          // between them take most of it, so the wordmark cannot have
          // 14px type and one line at the same time. It steps down to
          // 12px below `sm` and back up at it, which is the same
          // touch/pointer split every other control on the site uses.
          "font-display leading-tight whitespace-nowrap",
          "text-xs sm:text-sm",
        )}
      >
        {/* ── ONE STRING, PAINTED AND ANNOUNCED ───────────────────────
            "SDA Church Newlife Nairobi", at every width, in the header
            and the footer alike.

            NO aria-hidden AND NO sr-only TWIN, which is the part that
            matters. This lockup used to paint a truncation and announce
            the full church name beside it, because every visible form was
            a SUBSTRING of that name and WCAG 2.5.3 is satisfied by the
            visible label appearing inside the accessible one. "SDA" is
            not a substring of "Seventh-day Adventist Church Newlife", so
            that arrangement would now break the rule it exists to keep: a
            voice-control user saying "click SDA Church" would match
            nothing.

            So the visible string IS the accessible name. Identical
            characters satisfies 2.5.3 outright rather than by the
            substring shortcut. The cost, stated on the type: a screen
            reader hears the abbreviation, which is what is on the screen.

            ── AND IT IS THE SAME STRING AT EVERY WIDTH NOW ────────────
            There were four forms: the compact one below sm, the full name
            over "Nairobi" from sm, "Newlife" over "Nairobi" between lg
            and xl where the nine-link nav crushed the lockup, and the
            full name again above xl. Four forms is three breakpoints at
            which the mark changes identity as a window is resized.

            One line of one string removes all of it, and it removes the
            problem the lg-to-xl form existed to manage rather than
            managing it: at 1024 the full name wrapped to four lines and
            stood 100px tall inside an 80px header band. This string does
            not wrap at any width the site supports.

            The city is inside it, which is why there is no second line
            for "Nairobi" any more. `shortName` is no longer read by this
            component; it stays in the data as the substring form for
            anything that needs one. */}
        <span>{eventInfo.church.compactName}</span>
      </span>
    </Link>
  );
}
