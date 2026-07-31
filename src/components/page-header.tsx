import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PageIdentity } from "@/lib/page-identity";

/**
 * The one page-header pattern, and the same one the share cards draw.
 *
 * Structure is lifted from src/lib/og.tsx: an eyebrow, the page's name in
 * the display face, a hairline rule, then one line of fact. That card was
 * the only place on the site with a designed header, while every interior
 * page opened with a bare h1 and a paragraph, which is why they all read
 * flat. Now both render the same three strings from the same object — see
 * src/lib/page-identity.ts.
 *
 * ── Why this is a band, and why its contents are centred ──────────────
 *
 * Ranged left in an 80rem shell, a short title is a bad shape. "Livestream"
 * set at text-5xl occupied about 40% of the column with nothing beside it,
 * and the meta line under it stranded across the full 1200px. That does not
 * read as deliberate asymmetry, it reads as a layout that lost its right
 * half.
 *
 * So the header owns a full-bleed band on --color-surface-muted and centres
 * its contents inside it. Two things make that work rather than look like
 * an arbitrary change of alignment:
 *
 *   1. The band boundary. A surface change is a hard edge, and an
 *      alignment change across a hard edge reads as two different kinds of
 *      thing rather than as one thing wobbling. Content BELOW the band
 *      returns to the page surface and stays left-aligned, on the same
 *      shell grid the header sits on. Do not centre body copy to match.
 *   2. The measure. --width-header caps the block, so the meta line breaks
 *      where a line of type should break instead of running the width of
 *      the shell.
 *
 * The band is part of the component rather than something each page wraps
 * around it, because it was the wrapping that drifted: three of thirteen
 * pages already had a muted header band and ten did not. There is now no
 * per-page decision left to get wrong. `/schedule` and `/schedule/[day]`,
 * which had the muted surface first, are unchanged in colour by this.
 *
 * The card's colours are navy-on-navy because it sits on its own
 * background; here the tokens do the same job on the muted surface. The
 * accent carries the eyebrow in both, and in dark mode --primary resolves
 * to exactly the #7ea6f2 the card uses.
 *
 * `children` is for the occasional page that needs a sentence with markup
 * in it — /faq explains its Provisional badge, /ministries/[tag] adds its
 * counts — which a plain meta string cannot hold. It sits below the rule
 * so the header itself stays the same shape everywhere.
 *
 * `media` is for the one page with something above the eyebrow: a
 * speaker's portrait. Everything else leaves it out.
 */
export function PageHeader({
  eyebrow,
  title,
  meta,
  media,
  children,
  className,
}: PageIdentity & {
  media?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    // data-page-header is a hook for tools/perf/align.mjs, which has to
    // tell this band apart from an ordinary one. Sniffing for `main
    // header` is not good enough: /offline and /styleguide both hand-roll
    // a <header> inside a plain Band, and the harness scored both as
    // uncentred page headers before this attribute existed.
    <div className="band bg-surface-muted" data-page-header>
      <div className="shell">
        <header
          className={cn(
            "mx-auto flex max-w-(--width-header) flex-col items-center text-center",
            className,
          )}
        >
          {/* items-center centres the media box itself; the portrait is a
              fixed-size element, so it needs the flex alignment rather than
              text-align to land in the middle. */}
          {media ? <div className="mb-6">{media}</div> : null}

          {/* Tracking this wide needs the letters to be uppercase to stay
              readable, which is also what keeps it from competing with the
              title.

              accent-600 in light, not --primary. --primary is accent-500,
              which the brand note above calls 4.71:1 on white and scopes
              to interactive elements for that reason. Measured on the
              muted band it is 4.39:1 — under the AA floor, since 14px
              semibold is not large text. accent-600 is the token the scale
              already provides for this and measures 5.51:1 there.

              Dark mode keeps accent-300: --primary already resolves to it
              and it measures 6.95:1 on the dark muted surface, so nothing
              needed changing on that side. */}
          <p className="text-sm font-semibold tracking-[0.18em] text-accent-600 uppercase dark:text-accent-300">
            {eyebrow}
          </p>

          <h1 className="mt-3 font-display text-4xl text-balance text-ink sm:text-5xl">
            {title}
          </h1>

          {/* The card's one piece of ornament, and the only one here. */}
          <hr className="mt-6 h-px w-full border-0 bg-line" />

          <p className="mt-5 text-lg text-pretty text-ink-muted">{meta}</p>

          {children ? <div className="mt-4">{children}</div> : null}
        </header>
      </div>
    </div>
  );
}
