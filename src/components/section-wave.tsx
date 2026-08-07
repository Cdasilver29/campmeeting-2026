import { cn } from "@/lib/utils";

/**
 * The layered wave that closes every hero and header band.
 *
 * Three overlapping translucent shapes in the brand's own four colours,
 * in the manner of adventist.org's section transitions: the band stops
 * being a rectangle that ends and starts being a surface that settles
 * into the page.
 *
 * ── IT SITS OUTSIDE THE BAND, AND THAT IS LOAD-BEARING ───────────────
 *
 * This renders as the band's NEXT SIBLING, never inside it. Two things
 * depend on that and neither is cosmetic:
 *
 *   1. The scrim contrast. Eleven header bands carry a photograph under
 *      two scrims whose alpha was derived by measuring the brightest
 *      composited pixel inside the eyebrow, title and meta boxes
 *      (tools/perf/verify-page-header.mjs, and the derivation in
 *      page-header-art.ts). Anything painted inside the band can land in
 *      one of those boxes and change the number. Outside it, the wave
 *      cannot touch the measurement — not "was measured and found not
 *      to", but cannot. That is the only version of this worth shipping.
 *   2. The band's height. `HEADER_BAND_HEIGHT` is a min-height and the
 *      photograph's crop is computed against the band's used height.
 *      A child would have grown it and moved every crop.
 *
 * ── NO LAYOUT SHIFT ──────────────────────────────────────────────────
 *
 * The height is a CSS class, not the SVG's intrinsic size, and there is
 * no request of any kind: no file, no font, no external reference. The
 * box is its final size on the first layout pass and there is nothing
 * still to arrive that could change it. `preserveAspectRatio="none"`
 * lets the 1440-wide viewBox stretch to any viewport, so the shapes
 * scale horizontally rather than the SVG overflowing.
 *
 * ── DARK MODE ────────────────────────────────────────────────────────
 *
 * The four fills are tokens, and `.dark` lightens all four. Raw Emperor
 * at these alphas over the dark plum surface is invisible rather than
 * subtle, which would mean the divider silently did not exist for half
 * the site's readers. See the note in globals.css.
 *
 * ── WHY THE ALPHAS ARE THIS LOW ──────────────────────────────────────
 *
 * 0.22 / 0.16 / 0.13. High enough that three layers read as three, low
 * enough that the deepest is a tint rather than a slab: the whole point
 * is a transition, and a saturated wave would be a fourth band. They
 * also stack — where all three overlap at the top the composite is
 * around 0.44, which is what gives the top edge enough weight to read as
 * the band continuing rather than as a stripe floating below it.
 *
 * Decoration and nothing else, so `aria-hidden` and `pointer-events-none`
 * and no `<title>`. `focusable="false"` is for IE-era SVG focus
 * behaviour that some assistive tech still honours.
 */

/*
 * Anchored to the TOP of the viewBox: each path fills the region between
 * y=0 and its own curve, so the shapes hang from the band above rather
 * than sitting on the page below. Three different phases and depths, so
 * the crests do not line up and the layering is visible as depth instead
 * of as one thick edge.
 *
 * The deepest reaches y=50 of 80, so the bottom ~30 is always clear page
 * surface and the divider resolves rather than butting into the content.
 */
const BACK = "M0,0 H1440 V40 C1250,70 1050,20 780,44 C520,66 260,18 0,50 Z";
const MID = "M0,0 H1440 V30 C1200,58 990,14 700,36 C430,56 210,12 0,38 Z";
const NEAR = "M0,0 H1440 V22 C1180,46 960,8 660,28 C380,46 190,6 0,28 Z";

export function SectionWave({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        // overflow-hidden is belt and braces: the SVG is width:100% and
        // cannot exceed its parent, but a full-bleed decorative element
        // is exactly the kind of thing that causes a horizontal
        // scrollbar, and this makes that impossible rather than
        // unlikely.
        "pointer-events-none w-full overflow-hidden",
        className,
      )}
    >
      <svg
        // 1440 is the design width; `none` lets it stretch to any
        // viewport, which is why one path set covers 320 to 1920.
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        focusable="false"
        // `block` kills the inline-element descender gap that would
        // otherwise leave a few pixels of page surface under the SVG.
        // The height steps with the viewport: 32px is right under a
        // 286px band on a phone and would be a hairline under a 356px
        // band at 1920.
        className="block h-8 w-full sm:h-12 lg:h-20"
      >
        <defs>
          {/*
            Emperor to Grapevine, left to right. It is the poster's own
            gradient and the same step --color-accent-500 takes to
            --color-accent-600 on hover, so the divider is made of a
            move the rest of the site already makes.

            One band per page, so this id appears once per document. If a
            page ever renders two, duplicate ids resolve to the first —
            and since both instances would reference the identical
            gradient, they would paint the same either way.
          */}
          <linearGradient id="section-wave-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" style={{ stopColor: "var(--color-wave-back)" }} />
            <stop offset="100%" style={{ stopColor: "var(--color-wave-edge)" }} />
          </linearGradient>
        </defs>

        <path d={BACK} fill="url(#section-wave-gradient)" fillOpacity="0.22" />
        <path d={MID} className="fill-wave-mid" fillOpacity="0.16" />
        <path d={NEAR} className="fill-wave-near" fillOpacity="0.13" />
      </svg>
    </div>
  );
}
