import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { PageIdentity } from "@/lib/page-identity";
import {
  HEADER_IMAGE_SIZES,
  HEADER_SCRIM_BOTTOM,
  HEADER_SCRIM_TOP,
  type PageHeaderImage,
} from "@/lib/page-header-art";

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
 * The card's colours are Emperor-on-Emperor because it sits on its own
 * background; here the tokens do the same job on the muted surface. The
 * accent carries the eyebrow in both, and in dark mode --primary resolves
 * to exactly the #b89ae0 the card uses.
 *
 * `children` is for the occasional page that needs a sentence with markup
 * in it — /faq explains its Provisional badge, /ministries/[tag] adds its
 * counts — which a plain meta string cannot hold. It sits below the rule
 * so the header itself stays the same shape everywhere. Its colour is set
 * HERE rather than by each page, because it is one of the two things that
 * has to change when the band takes a photograph.
 *
 * `media` is for the one page with something above the eyebrow: a
 * speaker's portrait. Everything else leaves it out.
 *
 * ── `image`: the band's own photograph ───────────────────────────────
 *
 * Eleven routes carry one. The record — file, intrinsic size, the crop's
 * `object-position` and what that crop keeps — is in
 * src/lib/page-header-art.ts, alongside the two scrims and the derivation
 * of their alpha. Read that file before changing anything below.
 *
 * TWO THINGS ARE LOAD-BEARING HERE.
 *
 * 1. THE BAND'S HEIGHT DOES NOT MOVE. The image and both scrims are
 *    absolutely positioned, so they are out of flow and contribute
 *    nothing: the band goes on being exactly as tall as `band`'s own
 *    padding and the type inside it, at every width, with or without a
 *    photograph. Nothing here reserves space, so nothing here can shift.
 *    That is also why the image is `fill` rather than sized: a sized
 *    image would have an intrinsic height and would want to be in flow.
 *
 * 2. THE IMAGE IS BEHIND THE CONTENT, NOT ABOVE IT. `-z-20` on the
 *    picture and `-z-10` on the scrims, against `isolate` on the band.
 *    Negative z-index is what puts a positioned element behind the static
 *    in-flow content that follows it; `isolate` is what keeps that
 *    negative index inside this band instead of dropping it behind the
 *    page. Same arrangement as the hero.
 *
 * The type goes white on a photograph, in both colour schemes, and the
 * eyebrow goes with it — Grapevine over the scrim is about 1.3:1. The
 * measurement and the alternative that was rejected are in
 * page-header-art.ts.
 *
 * `bg-surface-muted` stays underneath. If the file ever fails to load the
 * scrims still paint, over a near-white surface, which is precisely the
 * pure-white worst case their alpha was derived against — so a missing
 * photograph degrades to a plum band with legible type rather than to
 * white type on white.
 */
export function PageHeader({
  eyebrow,
  title,
  meta,
  media,
  image,
  lockup,
  children,
  className,
}: PageIdentity & {
  media?: ReactNode;
  image?: PageHeaderImage;
  /**
   * A page's own lockup, ranged LEFT, in place of the eyebrow, title, rule
   * and meta line. One route uses it: /speakers, whose band carries the
   * poster's own statement — "Main Speaker", the speaker's name, the theme
   * and the key text — with the page's h1 moved below the band.
   *
   * A slot rather than a second component, because everything else about
   * this band is load-bearing and shared: the photograph and its `sizes`,
   * the two abutting scrims and their derived alpha, `isolate` against the
   * negative z-index, the muted fallback surface, `data-page-header` for
   * tools/perf/align.mjs and `data-header-art` for
   * tools/perf/verify-page-header.mjs. A /speakers-shaped copy of all that
   * would be a second band that has to be kept in step with this one.
   *
   * `eyebrow` and `title` are still required and still used — pageMetadata
   * and the share card read them off the same object, and a link preview
   * that stopped saying "Speakers" to match a change to the page would be
   * the exact drift src/lib/page-identity.ts exists to prevent.
   */
  lockup?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const onPhoto = Boolean(image);

  return (
    // data-page-header is a hook for tools/perf/align.mjs, which has to
    // tell this band apart from an ordinary one. Sniffing for `main
    // header` is not good enough: /offline and /styleguide both hand-roll
    // a <header> inside a plain Band, and the harness scored both as
    // uncentred page headers before this attribute existed.
    //
    // data-header-art is the hook for tools/perf/verify-page-header.mjs,
    // which needs to know whether to measure this band's type against the
    // brightest composited pixel or not measure it at all.
    <div
      className="band relative isolate overflow-hidden bg-surface-muted"
      data-page-header
      data-header-art={onPhoto ? "photo" : "flat"}
      // tools/perf/align.mjs asserts that this band's block is centred in
      // its shell, which is the band's own stated intent everywhere except
      // the one route that passes a lockup. Without this attribute the
      // harness would report a left-aligned band as a failure and send the
      // next person to centre something that is deliberately ranged left —
      // the same mistake it made before `data-page-header` existed, when it
      // scored /offline's hand-rolled header as an uncentred page header.
      data-header-align={lockup ? "start" : "center"}
    >
      {image ? (
        <>
          <Image
            src={image.src}
            alt=""
            aria-hidden
            fill
            // Not `priority`. This is a below-the-header decorative band
            // on eleven interior routes; preloading eleven photographs
            // would take bandwidth from the content on a connection that
            // has none to spare. The hero keeps its priority because it
            // IS the largest contentful paint on the home page.
            sizes={HEADER_IMAGE_SIZES}
            quality={80}
            style={{ objectPosition: image.position }}
            className="-z-20 object-cover"
          />
          {/* Two scrims that abut at the middle rather than overlapping:
              two 0.66 layers composite to 0.88, which is a third alpha
              nobody chose. Together they cover the band, because on a
              286px band the type covers the band. */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 -z-10 h-1/2"
            style={{ backgroundImage: HEADER_SCRIM_TOP }}
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 -z-10 h-1/2"
            style={{ backgroundImage: HEADER_SCRIM_BOTTOM }}
          />
        </>
      ) : null}

      <div className="shell">
        <header
          className={cn(
            "flex flex-col",
            // Centred inside its own measure, or ranged left on the shell.
            // Not `mx-auto` either way in the lockup case: the whole point
            // of ranging left is that the block's left edge is the shell's,
            // which is the edge everything below the band aligns to.
            lockup
              ? "max-w-(--width-header) items-start text-left"
              : "mx-auto max-w-(--width-header) items-center text-center",
            className,
          )}
        >
          {lockup ?? (
            <>

          {/* items-center centres the media box itself; the portrait is a
              fixed-size element, so it needs the flex alignment rather than
              text-align to land in the middle. */}
          {media ? <div className="mb-6">{media}</div> : null}

          {/* Tracking this wide needs the letters to be uppercase to stay
              readable, which is also what keeps it from competing with the
              title.

              accent-600 in light, not --primary, and the reason has
              changed with the palette. It used to be a contrast fix:
              accent-500 was #2e6de7 and measured 4.39:1 on this band,
              under the AA floor for 14px semibold. Emperor measures
              10.86:1 there, so contrast no longer decides it.

              What decides it now is that Emperor is the ink's own hue at
              near-ink darkness, so an eyebrow set in it reads as slightly
              faded body text rather than as an accent. accent-600 is
              Grapevine: a different hue, 8.64:1 on this band, and legibly
              a colour rather than a shade.

              The dark override is gone. It existed because accent-600 had
              no dark value under the navy palette and would have painted
              a 2:1 mid-blue on the dark band; it now resolves to the
              lightened Grapevine and measures 7.06:1 there, so one class
              covers both modes and the eyebrow is the same hue in each.

              On a photograph none of that survives: Grapevine over the
              scrim is about 1.3:1. White, for the same measured reason
              the hero's kicker is white. */}
          <p
            className={cn(
              "text-sm font-semibold tracking-[0.18em] uppercase",
              onPhoto ? "text-white" : "text-accent-600",
            )}
          >
            {eyebrow}
          </p>

          <h1
            className={cn(
              "mt-3 font-display text-4xl text-balance sm:text-5xl",
              onPhoto ? "text-white" : "text-ink",
            )}
          >
            {title}
          </h1>

          {/* The card's one piece of ornament, and the only one here.
              It is a SEPARATOR, so it is drawn only when there is
              something under it to separate the title from — the meta
              line, or the occasional paragraph a page passes as
              children.

              /speakers, /about, /contact and /livestream now have
              neither, and there the header is eyebrow and title and
              stops. Keeping the rule as a terminal flourish was the
              other option and is worse: a full-width hairline with
              nothing after it does not read as ornament, it reads as a
              line of type that failed to render. Nothing else moves —
              the band's padding and the mt-3 / mt-6 / mt-5 rhythm are
              untouched, so those four bands are shorter by exactly the
              meta line and its own top margin and by nothing else. */}
          {meta || children ? (
            <hr
              className={cn(
                "mt-6 h-px w-full border-0",
                onPhoto ? "bg-white/45" : "bg-line",
              )}
            />
          ) : null}

          {meta ? (
            <p
              className={cn(
                "mt-5 text-lg text-pretty",
                onPhoto ? "text-white" : "text-ink-muted",
              )}
            >
              {meta}
            </p>
          ) : null}

          {/* The colour lives here, not on each page's paragraph. It used
              to be written as `text-ink-muted` inside three different
              pages, which meant three places that would each have had to
              learn about the photograph — and /faq's Provisional badge is
              `text-foreground` on a `border-border` outline, which is ink
              on a hairline and invisible on the scrim. The badge override
              is scoped by its own data-slot rather than by a class name. */}
          {children ? (
            <div
              className={cn(
                "mt-4",
                onPhoto
                  ? "text-white [&_[data-slot=badge]]:border-white/55 [&_[data-slot=badge]]:text-white"
                  : "text-ink-muted",
              )}
            >
              {children}
            </div>
          ) : null}
            </>
          )}
        </header>
      </div>
    </div>
  );
}
