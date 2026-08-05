import type { MetadataRoute } from "next";
import { eventInfo } from "@/data";

/**
 * The web app manifest, generated rather than written out, so the name a
 * phone shows under the installed icon comes from the same eventInfo as
 * every page title. A future year changes event.ts and nothing here.
 *
 * Colours are the brand tokens from src/app/globals.css:
 *   theme_color      --color-surface  #ffffff, the header background, which
 *                    is the surface the browser chrome sits against
 *   background_color --color-surface  #ffffff, the splash behind the icon
 *                    before the first paint
 * The dark-mode counterpart (--color-surface #1f0d35, Emperor pushed
 * toward black) is served through the theme-color meta tag in
 * src/app/layout.tsx, which a manifest has no way to express.
 *
 * theme_color and background_color are both #ffffff and both correct:
 * --color-surface is white in light mode and was white under the navy
 * palette too, so the palette change did not move them. The stale value
 * was only ever in this comment and in the layout's dark entry.
 *
 * ── COMMITTEE OWES THIS ──────────────────────────────────────────────
 * The three icons below are geometric placeholders, not artwork. Replace
 * the files in public/icons/ with the real mark at the same paths and
 * sizes; no code change is needed.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${eventInfo.edition} — ${eventInfo.church.name}`,
    short_name: eventInfo.name,
    description: `The programme for ${eventInfo.edition} at ${eventInfo.church.name}, ${eventInfo.church.address}. Readable offline.`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "en-KE",
    theme_color: "#ffffff",
    background_color: "#ffffff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
