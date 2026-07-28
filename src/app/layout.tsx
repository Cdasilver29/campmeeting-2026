import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SerwistProvider } from "@serwist/turbopack/react";
import { ThemeProvider } from "@/components/theme-provider";
import { SW_URL } from "@/lib/pwa";
import { siteUrl } from "@/lib/site-url";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageTransition } from "@/components/page-transition";
import { eventInfo } from "@/data";
import "./globals.css";

// Display: Fraunces (variable), reserved for the hero and section headings.
// Body: Inter (variable), carries everything else. Only the body face is
// preloaded — the display face is comparatively rare per page (hero + a
// handful of section headings) so preloading it would waste bandwidth on
// campground mobile data.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-var",
  display: "swap",
  preload: false,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-var",
  display: "swap",
});

const siteTitle = `${eventInfo.edition} | ${eventInfo.church.name}`;
const siteDescription = `${eventInfo.edition} at ${eventInfo.church.name}, ${eventInfo.church.address}.`;

export const metadata: Metadata = {
  // Every canonical and Open Graph URL on the site is written
  // site-relative and resolved against this. See src/lib/site-url.ts for
  // where the origin comes from on production, on a preview and locally.
  metadataBase: siteUrl,
  title: siteTitle,
  description: siteDescription,
  applicationName: eventInfo.edition,
  appleWebApp: { capable: true, statusBarStyle: "default", title: eventInfo.name },
  // The default for the home page, which has no title of its own. Pages
  // that use pageMetadata replace this wholesale.
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: eventInfo.edition,
    locale: "en_KE",
    type: "website",
  },
};

/**
 * The browser chrome follows the surface token, in both themes. The
 * manifest can only carry one theme_color, so the dark value is expressed
 * here where a media query is available. Values are --color-surface from
 * src/app/globals.css, light and dark.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#031635" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable}`}
    >
      <body className="antialiased">
        {/*
          Registers the service worker that makes the programme readable
          on the campground. reloadOnOnline is off on purpose: Serwist
          otherwise reloads the page the moment signal returns, which on
          this site would throw away a half-typed prayer request. The
          worker is disabled in development so it cannot cache a page over
          the top of a hot reload, or over the ?now= clock override.
        */}
        <SerwistProvider
          swUrl={SW_URL}
          reloadOnOnline={false}
          disable={process.env.NODE_ENV === "development"}
        >
          <ThemeProvider>
            <a
              href="#content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink focus:outline-2 focus:outline-offset-2 focus:outline-accent-500"
            >
              Skip to content
            </a>
            <SiteHeader />
            <main id="content">
              <PageTransition>{children}</PageTransition>
            </main>
            <SiteFooter />
          </ThemeProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
