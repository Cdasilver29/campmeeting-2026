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
import { hasPhotoHeader } from "@/lib/page-header-art";
import { cn } from "@/lib/utils";

/**
 * The desktop bar and the mobile sheet both read this, so a link is added
 * to the site once.
 *
 * `/children` sits next to Ministries because that is where somebody
 * would look for it, and it is a top-level entry rather than a page
 * inside /ministries because it is what a parent opens this site to find.
 * Nine links now; the bar is set in a size that holds them to lg, and
 * below that they are the sheet's problem, where the list is vertical and
 * a tenth would cost nothing.
 */
const navLinks = [
  { href: "/", label: "Today" },
  { href: "/schedule", label: "Schedule" },
  { href: "/speakers", label: "Speakers" },
  { href: "/ministries", label: "Ministries" },
  { href: "/children", label: "Children" },
  { href: "/livestream", label: "Livestream" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/*
 * The routes with a photograph behind the header. Everything else keeps
 * its own surface from the first pixel, because there is nothing behind it
 * to show through.
 *
 * This used to be the home page alone. It is now the home page plus every
 * interior route whose page-header band carries a picture, which is what
 * made those bands read as stuck rather than immersive: the photograph
 * began at a hard edge 80px down, under a solid white bar, so it was a
 * panel inserted into the page rather than the page opening with a
 * picture. The home hero never had that problem, and the reason was only
 * ever this header.
 *
 * `hasPhotoHeader` is an exact pathname match derived from `headerImages`
 * itself — see src/lib/page-header-art.ts, including why the check lives
 * there rather than in page-identity.ts. Exact rather than by prefix
 * because the set is arbitrary: it is whichever pages the committee has
 * supplied artwork for, and /schedule has one while /schedule/[day] does
 * not.
 */
const isPhotoRoute = (pathname: string) =>
  pathname === "/" || hasPhotoHeader(pathname);

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
        // inline-flex + min-h-11 so the link is a 44px tap target without
        // taking any more horizontal room, which the desktop bar has none
        // of to spare. The underline on hover is the non-colour half of
        // the state change: colour alone is not a signal.
        //
        // active:translate-y-px is the pressed state, and it was missing.
        // The rule here used to be `active:text-ink`, which is the same
        // value hover already sets, so pressing a nav link changed nothing
        // — the one interactive surface on the site that did not confirm a
        // press, while cards deepen a ring, the day rail returns its lift
        // and every Button translates. A 1px translate rather than a
        // colour because this link is white over the photograph, where
        // there is no darker white to go to and dimming it fails AA for
        // the same reason the hero never uses white/80.
        "inline-flex min-h-11 items-center rounded-control px-1.5 text-sm font-medium text-ink-muted underline-offset-8 transition-[color,translate] duration-fast ease-out-soft hover:text-ink hover:underline hover:decoration-2 active:translate-y-px active:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
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
  const isOverlayRoute = isPhotoRoute(pathname);

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

  // Transparent only at the top of a route with a photograph behind it.
  // The server renders this too, since usePathname resolves during SSR, so
  // the first paint is already correct and there is no flash of a solid
  // bar over the photograph.
  //
  // The 96px threshold works unchanged on the interior bands: the shortest
  // of them is 304px, so the header has earned its own surface long before
  // the picture runs out and the type below it arrives on white.
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

          {/*
            lg, not md. Eight links plus the lockup plus the theme toggle
            do not fit in a 768px viewport: measured, the bar overflowed
            the document by 126px at 768 and 74px at 820, on every route,
            which is a horizontal scrollbar on every page of the site at
            tablet width. It had been there since the nav was written and
            was invisible because nothing ever measured it.

            The gap steps rather than sitting at 6 throughout, because at
            exactly 1024 the shell's content box is 944px and the bar needs
            all of it.
          */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex lg:items-center lg:gap-4 xl:gap-6"
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
                  // 48px painted, not a 32px control with a pseudo-element
                  // hit area. See the note in theme-toggle.tsx for why the
                  // header can afford it: the brand mark next to it is
                  // already 48px, so --spacing-header's 80px was never the
                  // constraint it was recorded as. This control only
                  // exists below lg, so it needs no compact variant.
                  className="size-12 lg:hidden group-data-[header-state=transparent]/header:text-white"
                  aria-label="Open menu"
                >
                  {/* size-6, or the Button base leaves a 16px glyph in a
                      48px box. */}
                  <Menu aria-hidden className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>{eventInfo.edition}</SheetTitle>
                </SheetHeader>
                <nav
                  aria-label="Primary"
                  className="flex flex-col gap-0.5 px-4 pb-4"
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
