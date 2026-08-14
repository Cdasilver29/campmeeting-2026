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
      <Mark className={isFooter ? "size-10" : "size-12"} />
      {/* data-wordmark is a hook for tools/perf/phone-hero.mjs, which has
          to measure whether this wraps. Shape-sniffing is not good enough:
          `a span:not(.sr-only)` matches the 48px mask span first, and the
          harness reported a two-line wordmark for a mark that has no
          lines at all. */}
      <span
        data-wordmark
        className={cn(
          "font-display leading-tight",
          isFooter ? "text-xs" : "text-sm",
        )}
      >
        {/* ── THE PHONE LOCKUP: ONE STRING, PAINTED AND ANNOUNCED ─────
            "SDA Church Newlife Nairobi", below `sm`, in the header and
            the footer alike.

            NO aria-hidden AND NO sr-only TWIN, which is the part that
            matters. Everywhere else in this lockup the visible short form
            is hidden from assistive technology and the full church name
            is announced in its place, because those forms are substrings
            of it and WCAG 2.5.3 is satisfied by the visible label
            appearing inside the accessible name. "SDA" is not a substring
            of "Seventh-day Adventist Church Newlife". Pairing it with an
            sr-only full name would leave a voice-control user saying
            "click SDA Church" matching nothing at all.

            So here the visible string IS the accessible name. Identical
            characters satisfies 2.5.3 outright rather than by the
            substring shortcut. The cost is stated on the type: a screen
            reader on a phone hears the abbreviation, which is what is on
            the screen.

            It replaces "Newlife" over "Nairobi", which this file argued
            for at length and which was right on its own terms — it was
            the desktop lockup truncated rather than a second lockup. What
            it did not do is say WHICH Newlife or name the denomination,
            and both fit once the two lines are allowed to be one wrapping
            string instead of a name over a city. */}
        <span className="sm:hidden">{eventInfo.church.compactName}</span>

        {/* From `sm`: the name over the city, as before. */}
        <span className="hidden sm:flex sm:flex-col">
          <span>
            {/* ── THE SHORT FORM FROM lg TO xl, THE MEASURED PART ─────
                Not symmetry for its own sake: that is exactly where the
                desktop nav appears and the bar is fullest. Measured at
                1024 on five routes: the shell's content box is 944px, the
                nine-link nav takes 738px, the toggle and menu cluster 32,
                the two flex gaps 32 — which leaves the lockup 142px of a
                natural 312. It did not overflow. It wrapped "Seventh-day
                Adventist Church Newlife" to FOUR lines and made the
                lockup 100px tall inside an 80px header band.

                So the bar fitting at lg was only ever true because the
                wordmark was being crushed to pay for it. 1100 is two
                lines, 1152 is two, and it is one line again at 1280 —
                which is where xl is and why that is the breakpoint the
                full name comes back at.

                Between sm and lg the nav is in the sheet and the lockup
                has the whole bar, so the full name stays there. This
                branch keeps the aria-hidden / sr-only pair, because
                `shortName` IS a substring of `name` and the accessible
                name stays the full church name throughout it.

                ── HEADER ONLY, AND THAT WAS A BUG ─────────────────────
                This whole band is a response to ONE pressure: nine nav
                links, a lockup and a theme toggle in an 80px bar. The
                footer has none of it — the lockup is alone at the top of
                a three-column grid with the whole shell to itself. When
                this was first written the classes were shared, so the
                footer took the squeeze too and printed "Newlife" over
                "Nairobi" at 1024 to solve a problem it does not have.
                Measured at 91px wide where it has 266px available. */}
            <span
              aria-hidden
              className={cn("hidden", !isFooter && "lg:inline xl:hidden")}
            >
              {eventInfo.church.shortName}
            </span>
            <span className={isFooter ? undefined : "lg:sr-only xl:not-sr-only"}>
              {eventInfo.church.name}
            </span>
          </span>
          {/* The city, not the street. eventInfo.church.address is the
              full postal line and belongs in the footer contact block,
              not here. Below `sm` the city is inside compactName instead,
              which is why this line does not repeat there.

              Muted ink would fail against the hero's top scrim, so over
              the photograph this line is white like the rest of the
              lockup and stays subordinate by size alone. */}
          <span className="text-ink-muted group-data-[header-state=transparent]/header:text-white">
            Nairobi
          </span>
        </span>
      </span>
    </Link>
  );
}
