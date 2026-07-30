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
 * The design is the site's, not a template's — brand navy, the display
 * face for the title, the accent as a single rule along the top. No
 * gradient, no photography, no religious iconography, in keeping with
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
 * Navy carries the brand weight; the accent appears once, as a rule.
 */
const NAVY = "#052252"; /* --color-navy-900 */
const RULE = "#133c86"; /* --color-navy-700 */
const ACCENT = "#2e6de7"; /* --color-accent-500 */
const ACCENT_LIGHT = "#7ea6f2"; /* --color-accent-300 */
const INK = "#eaf0fd"; /* dark --color-ink */
const INK_MUTED = "#b6ccf7"; /* dark --color-ink-muted */

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
          backgroundColor: NAVY,
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
              color: ACCENT_LIGHT,
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
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
