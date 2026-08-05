import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { PageIdentity } from "@/lib/page-identity";

/**
 * The one Open Graph card this site draws, rendered at build time.
 *
 * Links to this site travel through WhatsApp, which shows a preview image
 * or nothing at all. Waiting for artwork would mean months of imageless
 * previews, so the card is generated from the same data the metadata
 * comes from: whatever a page calls itself is what its card says.
 *
 * The design is the site's, not a template's: the poster's plum ground,
 * the display face for the title, the accent as a single rule along the
 * top. No photography and no religious iconography, in keeping with
 * CLAUDE.md.
 *
 * Every card is prerendered during `next build` (each opengraph-image
 * route is fully static), so nothing here runs on a request and no font
 * is fetched over the network at build time.
 */

/** Facebook, WhatsApp and X all read this size; anything else gets cropped. */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

/**
 * The id of the single card each route generates.
 *
 * The routes with a dynamic segment need generateImageMetadata to give
 * their card alt text that names the day, the speaker or the ministry,
 * and that turns the route into .../opengraph-image/[__metadata_id__].
 * Their generateStaticParams has to name that segment as well, or the
 * cards fall out of the build and are rendered on the first request
 * instead. One constant so the two cannot drift apart.
 */
export const CARD_ID = "card";

/*
 * Colours are the tokens from src/app/globals.css, written as literals
 * because Satori resolves no CSS variables and has no stylesheet to read.
 *
 * THE GROUND IS THE POSTER'S GRADIENT, not a flat fill and not the navy
 * this replaces. Emperor to Grapevine is the one gradient the palette
 * actually names: globals.css calls the 500 -> 600 step "the poster's own
 * gradient", and it is a hue step between two colours that are both
 * text-safe (11.59:1 and 9.22:1 against white), so nothing on the card
 * gets weaker as it crosses. That is what makes it usable as a ground
 * rather than gradient soup: the type is scored against the WORSE of the
 * two ends and passes there.
 *
 * Ratios below are measured against Grapevine, the worse end:
 *
 *   #f2eef6 on the ground      8.05:1   the title
 *   #d2c7df on the ground      5.69:1   the meta line
 *   #ffa92d on the ground      4.81:1   the eyebrow
 *
 * The 12px bar along the top and the hairline under the title are
 * ornament, not text, so the floor for those two is 3:1 rather than 4.5.
 *
 * WARM, AND WHY IT IS ALLOWED HERE. globals.css bars Warm from light
 * surfaces in the strongest terms it uses about any colour: 1.92:1 on
 * white is not a near miss, it is invisible. What it is FOR is dark
 * grounds, and it says so. This card is a dark plum ground, which is the
 * same condition the hero satisfies, so this is the second place Warm is
 * used and the second place it belongs. It is also the poster's own warm
 * accent against the poster's own plum.
 *
 * The old card ran a two-tier blue: #2e6de7 for the rule and #7ea6f2 for
 * the eyebrow. One accent in one colour replaces it, which is closer to
 * the "the accent appears once" the card was designed around than two
 * shades of it ever were.
 */
const GROUND_FROM = "#4b207f"; /* --color-emperor, --color-accent-500 */
const GROUND_TO = "#7f264a"; /* --color-grapevine, --color-accent-600 */
const GROUND = `linear-gradient(135deg, ${GROUND_FROM} 0%, ${GROUND_TO} 100%)`;
/* The hairline under the title. White at low alpha rather than a fourth
   named colour, so it reads the same against both ends of the ground
   instead of matching one of them and disappearing into it. The navy
   version used a flat --color-navy-700, which on a gradient would be a
   stripe that agrees with the left of the card and fights the right. */
const RULE = "rgba(255, 255, 255, 0.28)";
const ACCENT = "#ffa92d"; /* --color-warm, dark grounds only */
const INK = "#f2eef6"; /* dark --color-ink */
const INK_MUTED = "#d2c7df"; /* dark --color-ink-muted */

/**
 * Static instances of the two site faces, vendored in src/assets/fonts.
 *
 * Satori cannot read a variable font's named instances and next/font
 * keeps its downloads to itself, so the files are checked in as latin
 * subsets, in the two weights the card uses. They are build-time inputs
 * only and never ship to a browser.
 */
const FONT_DIR = join(process.cwd(), "src", "assets", "fonts");

function fontData(file: string): ArrayBuffer {
  const buffer = readFileSync(join(FONT_DIR, file));
  // A Buffer is a view into a shared pool, so hand Satori a copy that
  // owns its bytes rather than the pool's whole backing store.
  return Uint8Array.from(buffer).buffer;
}

const fonts = [
  {
    name: "Fraunces",
    data: fontData("Fraunces-Regular.ttf"),
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Inter",
    data: fontData("Inter-Regular.ttf"),
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Inter",
    data: fontData("Inter-SemiBold.ttf"),
    weight: 600 as const,
    style: "normal" as const,
  },
];

/**
 * Title size by length, so a two-word ministry label and a full
 * "Sabbath 22nd August 2026" both fill the card without either
 * overflowing it. Satori wraps but does not shrink to fit.
 */
function titleSize(title: string): number {
  if (title.length <= 18) return 100;
  if (title.length <= 30) return 84;
  if (title.length <= 48) return 68;
  return 56;
}

/**
 * The card draws a PageIdentity, which is the same object the page's own
 * header draws (src/components/page-header.tsx). One shape, so a preview
 * and the page it opens cannot describe themselves differently.
 *
 * Type-only import: nothing from page-identity.ts is pulled in at runtime,
 * and this module's node:fs read stays where it is.
 */
export type OgCardProps = PageIdentity;

/**
 * The card itself. Callers are the `opengraph-image` routes, which
 * supply the three strings from the same values their page's
 * `generateMetadata` uses.
 */
export function ogCard({ eyebrow, title, meta }: OgCardProps): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          // Both, not just the gradient: backgroundColor is what shows if
          // Satori ever fails to resolve the gradient, and Emperor alone
          // is a card rather than a blank one.
          backgroundColor: GROUND_FROM,
          backgroundImage: GROUND,
          fontFamily: "Inter",
        }}
      >
        {/* The only ornament on the card. */}
        <div style={{ display: "flex", height: 12, backgroundColor: ACCENT }} />

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 80px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: ACCENT,
            }}
          >
            {eyebrow}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Fraunces",
                fontSize: titleSize(title),
                lineHeight: 1.05,
                color: INK,
              }}
            >
              {title}
            </div>

            {/* The rule and the meta line travel together, the same way
                they do in the page header. Four routes have no meta —
                see the note on PageIdentity — and on their cards the
                title simply sits on the baseline the padding gives it.

                Drawn conditionally rather than with an empty string,
                because Satori lays out a zero-height flex row as a real
                row: the card would keep the rule, keep the 28px under
                it, and read as a card whose last line failed to
                render. */}
            {meta ? (
              <>
                <div
                  style={{
                    display: "flex",
                    height: 1,
                    backgroundColor: RULE,
                    margin: "40px 0 28px",
                  }}
                />

                <div style={{ display: "flex", fontSize: 28, color: INK_MUTED }}>
                  {meta}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
