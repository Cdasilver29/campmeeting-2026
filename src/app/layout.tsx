import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Typefaces are a Phase 1 decision. Until then the token fallbacks in
// globals.css (system-ui / Georgia) apply. Do not add next/font here yet.

export const metadata: Metadata = {
  title: "Camp Meeting 2026",
  description: "Camp Meeting 2026, Newlife SDA Church Nairobi.",
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
