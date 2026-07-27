import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { eventInfo } from "@/data";
import "./globals.css";

// Typefaces are a Phase 1 decision. Until then the token fallbacks in
// globals.css (system-ui / Georgia) apply. Do not add next/font here yet.

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
