"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { eventInfo } from "@/data";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Today" },
  { href: "/schedule", label: "Schedule" },
  { href: "/speakers", label: "Speakers" },
  { href: "/ministries", label: "Ministries" },
  { href: "/livestream", label: "Livestream" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * The one route with a photographic hero behind the header. Everything
 * else keeps its own surface from the first pixel, because there is
 * nothing behind it to show through.
 */
const OVERLAY_ROUTE = "/";

/** How far down the page the header earns its own surface. */
const SCROLL_THRESHOLD_CLASS = "h-24";

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "rounded-control px-1 py-1 text-sm font-medium text-ink-muted transition-colors duration-fast hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
        isActive && "text-ink",
        // Over the photograph the muted/active pair cannot carry the
        // distinction: ink-muted on the top scrim fails AA, and dimming
        // white to signal "inactive" fails for the same reason the hero
        // never uses white/80. So every link goes pure white and the
        // active one gains weight instead. Inert outside the header,
        // which is what keeps the portalled mobile sheet on ink.
        "group-data-[header-state=transparent]/header:text-white group-data-[header-state=transparent]/header:hover:text-white",
        isActive &&
          "group-data-[header-state=transparent]/header:font-semibold",
      )}
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isOverlayRoute = pathname === OVERLAY_ROUTE;

  const [pastThreshold, setPastThreshold] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  /*
   * An IntersectionObserver on a sentinel, not a scroll handler.
   *
   * The sentinel is a zero-width strip sitting at the top of the document.
   * The browser reports when it leaves the viewport and says nothing on
   * every other frame, so there is no per-scroll callback, no scrollY
   * read, and nothing that can thrash layout. A passive throttled scroll
   * listener would also work; this costs less on the phones that will be
   * reading the programme on the campground.
   */
  useEffect(() => {
    if (!isOverlayRoute) {
      setPastThreshold(false);
      return;
    }
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setPastThreshold(!entry?.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isOverlayRoute]);

  // Transparent only at the top of the one route that has a hero. The
  // server renders this too, since usePathname resolves during SSR, so
  // the first paint is already correct and there is no flash of a solid
  // bar over the photograph.
  const state = isOverlayRoute && !pastThreshold ? "transparent" : "solid";

  return (
    <>
      {/*
        Absolutely positioned with no positioned ancestor, so it resolves
        against the initial containing block: pinned to the document
        origin, scrolling away with the page, and contributing nothing to
        layout.
      */}
      {isOverlayRoute ? (
        <div
          ref={sentinelRef}
          aria-hidden
          className={`pointer-events-none absolute top-0 left-0 w-px ${SCROLL_THRESHOLD_CLASS}`}
        />
      ) : null}

      <header
        data-header-state={state}
        className={cn(
          // h-header with box-border, so the 1px bottom rule is inside the
          // 80px rather than added to it. The hero pulls itself up by
          // exactly --spacing-header; if the border sat outside, the header
          // would be 81px, the hero would start 1px down, and a hairline of
          // page background would show above the photograph. That sliver is
          // also what made the first header contrast reading come back as
          // pure white.
          "group/header sticky top-0 z-40 box-border h-header border-b transition-[background-color,border-color] duration-fast ease-out-soft",
          // The border is always present and only changes colour, so the
          // header never changes height and the page cannot shift when
          // the state flips.
          "border-line bg-surface/95 backdrop-blur supports-backdrop-filter:bg-surface/80",
          // Transparent state: no surface, no rule, no blur. Written after
          // the solid classes so it wins on the home page at rest.
          "data-[header-state=transparent]:border-transparent data-[header-state=transparent]:bg-transparent data-[header-state=transparent]:backdrop-blur-none",
          // Where backdrop-filter is unsupported the solid branch above
          // already resolves to bg-surface/95, so the glass state is never
          // transparent type over a photograph.
        )}
      >
        {/* `shell`, the same utility every page wrapper carries, so the
            lockup's left edge and the page h1's left edge are the same
            number at every breakpoint rather than two numbers that happen
            to agree. See the width system block in globals.css. */}
        <div className="shell flex h-full items-center justify-between gap-4">
          <BrandLockup />

          <nav
            aria-label="Primary"
            className="hidden md:flex md:items-center md:gap-6"
          >
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="md:hidden group-data-[header-state=transparent]/header:text-white"
                  aria-label="Open menu"
                >
                  <Menu aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>{eventInfo.edition}</SheetTitle>
                </SheetHeader>
                <nav
                  aria-label="Primary"
                  className="flex flex-col gap-1 px-4 pb-4"
                >
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.href}
                      {...link}
                      onNavigate={() => setOpen(false)}
                    />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
