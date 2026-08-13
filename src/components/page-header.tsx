import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { SectionWave } from "@/components/section-wave";
import { eventInfo } from "@/data";
import { cn } from "@/lib/utils";
import { ART_DIRECTION } from "@/lib/hero";
import type { PageIdentity } from "@/lib/page-identity";
import {
  HEADER_BAND_HEIGHT,
  HEADER_IMAGE_SIZES,
  HEADER_SCRIM_BOTTOM,
  HEADER_SCRIM_TOP,
  HEADER_SCRIM_WHOLE,
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
  imageOnly: imageOnlyProp,
  hideEyebrow,
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
  /**
   * The band is the photograph and nothing else: no eyebrow, no rule, no
   * meta, and the h1 kept but not painted. One route uses it, /contact,
   * whose picture is the church's own frontage with its green NEWLIFE SDA
   * CHURCH sign legible across it — so "Camp Meeting 2026 / Contact" set
   * over it was the nav item the reader just clicked, written a second
   * time on top of a building that names itself.
   *
   * THE H1 IS STILL RENDERED. It is `sr-only`, not deleted. Every other
   * page has one, and a page whose only heading is the h2 of its first
   * section reads to a screen reader's heading list, and to a search
   * result, as a document that starts in the middle. The two options were
   * this and a visible "Contact" heading below the band; see the note in
   * src/app/contact/page.tsx for why this one.
   *
   * `eyebrow` and `meta` are still accepted and still used — pageMetadata
   * and the share card read them off the same object, exactly as they do
   * for `lockup`. Nothing about the link preview changes.
   */
  imageOnly?: boolean;
  /**
   * Force the title to be drawn without the eyebrow above it.
   *
   * Rarely needed now: an eyebrow that is simply the edition is dropped
   * automatically, and that covered the one route this prop existed for.
   * See the note above `showEyebrow` in the body.
   */
  hideEyebrow?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  const onPhoto = Boolean(image);
  /** Only meaningful with a photograph: there is nothing else to show. */
  const imageOnly = Boolean(image) && Boolean(imageOnlyProp);
  /**
   * The eyebrow is drawn when it says something the page does not already
   * say. An eyebrow that is only the edition says nothing: see the note
   * at the element itself.
   */
  const showEyebrow = !hideEyebrow && eyebrow !== eventInfo.edition;
  /**
   * `fit: "whole"` — the band takes the photograph's aspect ratio instead
   * of being as tall as its own type. One route, /contact. The reasoning is
   * in page-header-art.ts; what is load-bearing HERE is how the height is
   * reserved, because getting that wrong is a layout shift on the one band
   * whose height is not content-driven.
   *
   * The picture stays absolutely positioned and `fill`, exactly as in the
   * other eleven bands, so it still contributes nothing to layout. What
   * reserves the height is an in-flow SPACER carrying the aspect ratio, and
   * it is a grid sibling of the content rather than a block above it, so the
   * row is as tall as whichever of the two is taller. Two consequences, both
   * wanted:
   *
   *   - The height comes from the band's own used width, not from `100vw`.
   *     `100vw` includes the classic scrollbar, so on a desktop with one
   *     showing it overshoots by about 15px, and a box 9px taller than the
   *     image's ratio makes `object-cover` scale up and crop the width —
   *     which would quietly undo the entire point of `whole`.
   *   - At a viewport narrow enough that the type is taller than the
   *     ratio's height, the row grows to the type instead of clipping it.
   *     The photograph then crops by that difference, which is the correct
   *     trade: unreadable type is a fault and a 1% crop is not.
   *
   * `-my-(--space-band)` on the spacer cancels the band's own padding for
   * that item, so the band's total height — padding included — is the
   * ratio's height rather than the ratio plus 8rem.
   */
  const whole = image?.fit === "whole";

  return (
    /*
      A fragment: the band, then the wave as its sibling.

      The wave is emitted HERE rather than by each of the thirteen pages
      that carry a band, so it is a system rather than thirteen chances
      to forget one — and it arrives on /contact's image-only band and
      /speakers' lockup band without either of them knowing about it.

      A SIBLING, not a child, and section-wave.tsx says why at length:
      inside the band it could land inside the eyebrow, title or meta box
      and change the scrim contrast those boxes were measured against,
      and it would have grown a band whose height every photograph's crop
      is computed from.
    */
    <>
    {/* data-page-header is a hook for tools/perf/align.mjs, which has to
        tell this band apart from an ordinary one. Sniffing for `main
        header` is not good enough: /offline and /styleguide both hand-roll
        a <header> inside a plain Band, and the harness scored both as
        uncentred page headers before this attribute existed.

        data-header-art is the hook for tools/perf/verify-page-header.mjs,
        which needs to know whether to measure this band's type against the
        brightest composited pixel or not measure it at all. */}
    <div
      className={cn(
        "band relative isolate overflow-hidden bg-surface-muted",
        // Grid only on a whole-fit band, so the aspect-ratio spacer and the
        // content share one cell and the row is as tall as the taller of
        // them. The other twelve bands stay ordinary block boxes.
        whole && "grid",
        /*
         * ── FULL BLEED UNDER THE HEADER ──────────────────────────────
         *
         * -mt-header pulls the band up by exactly the header's own height,
         * so the photograph runs behind it rather than starting at a hard
         * edge 80px down. This is the whole of what made the home hero
         * read as immersive and these bands read as inserted panels: the
         * hero has carried this line since session 1, and the site header
         * now goes transparent at scroll 0 on these routes too.
         *
         * Both sides read --spacing-header; see globals.css. Only on a
         * band with a photograph — a flat muted band pulled under a
         * transparent header would be a white bar over a white bar.
         */
        onPhoto && "-mt-header",
        // A photograph gets a reserved height and its type centred in what
        // is left below the header. A flat band goes on being exactly as
        // tall as its own type, which is right for a band of colour.
        // HEADER_BAND_HEIGHT is a min-height, not a height, and the reason
        // is load-bearing — see page-header-art.ts.
        onPhoto && !whole && `flex items-center ${HEADER_BAND_HEIGHT}`,
      )}
      data-page-header
      data-header-art={onPhoto ? "photo" : "flat"}
      // tools/perf/align.mjs asserts that this band's block is centred in
      // its shell, which is the band's own stated intent everywhere except
      // the one route that passes a lockup. Without this attribute the
      // harness would report a left-aligned band as a failure and send the
      // next person to centre something that is deliberately ranged left —
      // the same mistake it made before `data-page-header` existed, when it
      // scored /offline's hand-rolled header as an uncentred page header.
      // "none" on an image-only band, and it is not the same claim as
      // "start". There is no painted block in it to be centred or ranged
      // left, so the offset the harness would compute is the offset of a
      // zero-width clipped box — a number that describes nothing and reads
      // as a 600px failure. align.mjs reports the value rather than
      // skipping it silently, so a band that stops declaring itself still
      // fails.
      data-header-align={imageOnly ? "none" : lockup ? "start" : "center"}
    >
      {image ? (
        <>
          {image.mobile ? (
            /*
              THE ART-DIRECTED BAND. One route reaches this, /speakers.

              Two different CROPS of one portrait, chosen by a `media`
              query, because that band's type is ranged left and the empty
              half of the picture has to stay under it as the band goes
              from about 1:1 on a phone to 4:1 at 1440. next/image cannot
              express that — it emits one <img> with a srcset, and every
              candidate is the same picture at a different width. See
              `mobile` on PageHeaderImage.

              The other eleven bands take the next/image branch below and
              are completely unaffected by this.

              Both object-positions are handed to CSS as custom properties
              rather than set inline: an inline object-position would beat
              the media query at every width and the wide crop would be
              positioned by the phone's number. `.art-crop` in globals.css
              owns both declarations. The class is shared with the hero,
              which has the identical problem.
            */
            <picture>
              <source
                media={ART_DIRECTION.media}
                srcSet={image.src}
                width={image.width}
                height={image.height}
              />
              <img
                src={image.mobile.src}
                alt=""
                aria-hidden
                width={image.mobile.width}
                height={image.mobile.height}
                // Lazy and low priority, exactly like the next/image
                // branch below is not-`priority`: this is a decorative
                // band under the header, not the LCP.
                loading="lazy"
                decoding="async"
                style={
                  {
                    "--art-position": image.mobile.position,
                    "--art-position-md": image.position,
                  } as CSSProperties
                }
                // absolute inset-0 size-full is next/image's `fill`,
                // written out. It has to stay out of flow for the same
                // reason: the band's height is its type's, and an in-flow
                // picture would reserve space and change it.
                className="art-crop absolute inset-0 -z-20 size-full object-cover"
              />
            </picture>
          ) : (
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
            // 100vw on a whole-fit band, where the box IS the viewport
            // width and `cover` is driven by it. The 240vw phone branch
            // exists for the short bands, where a wide source filling a
            // tall-in-aspect box renders far wider than its slot; here
            // there is no such gap and asking for 240vw would fetch a
            // variant twice the size of the box for nothing.
            sizes={whole ? "100vw" : HEADER_IMAGE_SIZES}
            quality={80}
            style={{ objectPosition: image.position }}
            className="-z-20 object-cover"
          />
          )}
          {whole ? (
            /* One scrim, anchored to the top, sized to the type. The
               half-and-half pair below is right on a 286px band because
               there the type IS the middle; on a 1130px band the type is
               the top 190px and the rest is the photograph the tall band
               exists to show. See HEADER_SCRIM_WHOLE. */
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 -z-10 h-80"
              style={{ backgroundImage: HEADER_SCRIM_WHOLE }}
            />
          ) : (
            <>
              {/* Two scrims that abut at the middle rather than
                  overlapping: two 0.66 layers composite to 0.88, which is
                  a third alpha nobody chose. Together they cover the band,
                  because on a 286px band the type covers the band. */}
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
          )}
        </>
      ) : null}

      {/* The height reservation. Read the note on `whole` above before
          changing anything about it: it is in flow, it is a grid sibling of
          the content rather than a block above it, and its negative margins
          are what keep the band's total height equal to the ratio rather
          than the ratio plus the band's own 8rem of padding. */}
      {whole && image ? (
        <div
          aria-hidden
          className="col-start-1 row-start-1 -my-(--space-band) w-full"
          style={{ aspectRatio: `${image.width} / ${image.height}` }}
        />
      ) : null}

      {/*
        `mt-header` on the CONTENT, not padding on the band, and it is what
        keeps the type optically centred rather than centred on a point the
        header covers.

        The band is `flex items-center`, so what gets centred is the
        child's MARGIN box. A top margin of one header height puts the
        content's own centre at (H/2 + 40px) — precisely the middle of the
        region between the bottom of the header and the bottom of the band,
        which is the only part of the band the reader can see all of.

        Written as a margin rather than as `pt-header` deliberately. `band`
        sets `padding-block`, and `padding-top` from a utility is the same
        specificity, so which one won would be settled by Tailwind's
        stylesheet order — the same tie that once put every session time
        where its title belonged. A margin does not compete with a padding.
      */}
      <div
        className={cn(
          "shell",
          whole && "col-start-1 row-start-1",
          onPhoto && !whole && "mt-header",
        )}
      >
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
          {imageOnly ? (
            /* Kept, not deleted. sr-only is `position: absolute`, so it is
               out of flow and this band's height is now the aspect-ratio
               spacer alone — which is what it already was at every width,
               since the eyebrow and title together never reached it. */
            <h1 className="sr-only">{title}</h1>
          ) : (
            lockup ?? (
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
          {/* ── AN EYEBROW THAT IS ONLY THE EDITION IS NOT DRAWN ──────
              "CAMP MEETING 2026" sat above the title of eleven interior
              pages, and on every one of them it was the fourth place the
              reader had already been told: the header lockup names the
              church on every page, the footer names the event, and the
              browser tab carries it in the metadata title. A line
              repeated on every page teaches a reader to stop reading that
              position, on the pages where it says something real — "Day 6
              of 8", a speaker's role, a host's office.

              A rule rather than eleven edits, and NOT a change to any
              PageDefinition. `eyebrow` stays on all of them and stays
              required, because ogCard draws it and a link preview has
              room for a line this band does not: a card seen in a
              WhatsApp thread has no header lockup above it to say what
              site it came from. Same arrangement /speakers and /gallery
              already use for strings their bands do not draw. */}
          {showEyebrow ? (
            <p
              className={cn(
                "text-sm font-semibold tracking-[0.18em] uppercase",
                onPhoto ? "text-white" : "text-accent-600",
              )}
            >
              {eyebrow}
            </p>
          ) : null}

          {/* mt-3 is the gap under the eyebrow. With no eyebrow there is
              nothing above the title but the band's own padding, and 12px
              of extra space at the top of a band whose height is
              content-driven is 12px the band grows by for nothing. */}
          <h1
            className={cn(
              "font-display text-4xl text-balance sm:text-5xl",
              showEyebrow ? "mt-3" : null,
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
            )
          )}
        </header>
      </div>
    </div>

    <SectionWave />
    </>
  );
}
