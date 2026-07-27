import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
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

export const metadata: Metadata = {
  title: `${eventInfo.edition} | ${eventInfo.church.name}`,
  description: `${eventInfo.edition} at ${eventInfo.church.name}, ${eventInfo.church.address}.`,
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
