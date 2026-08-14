"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Menu } from "lucide-react";
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

/**
 * ── BACK, ON DESKTOP ─────────────────────────────────────────────────
 *
 * A phone has a back gesture and a hardware or system control for this;
 * a desktop browser has a button in a chrome the reader has to leave the
 * page to reach. The site now goes three levels deep in places — a
 * speaker's page from the presenter grid, a day from the programme, a
 * host's letter from the hosts section — and the only way back up was
 * the nav, which returns you to the top of a list rather than to where
 * you were in it.
 *
 * ── IT IS NOT ALWAYS `router.back()` ─────────────────────────────────
 *
 * A back control that leaves the site is worse than no back control. On
 * a page opened from a shared link the previous entry is WhatsApp, and
 * `router.back()` there is a control in this site's header that closes
 * this site. So the history length is checked after mount and the button
 * only appears when there is somewhere inside to go: `history.length > 1`
 * is true for any navigation within the app and false for a fresh tab.
 *
 * Never on the home page, which is the top and has nothing above it.
 *
 * ── WHERE IT SITS, AND WHY IT IS NOT IN THE BAR ──────────────────────
 *
 * Top right, floating just BELOW the header rather than inside it. Three
 * reasons, and the first is the one that settled it: the bar is full. It
 * holds a lockup that already wraps to three lines on a long church name,
 * nine links and the theme toggle, and a tenth control in it pushed the
 * lockup narrower still.
 *
 * The second is that it does not belong with them. Those links go
 * somewhere; this one comes back from where you are, which is a fact
 * about the page and not about the site. Below the bar it reads as the
 * page's own control.
 *
 * The third is that top right is where a reader's hand already is on a
 * wide screen, next to the scrollbar.
 *
 * ── IT HAS TO BE LEGIBLE ON A PHOTOGRAPH AND ON A PLAIN BAND ─────────
 *
 * It lands over eleven header bands that carry a picture and over a dozen
 * that do not, and it is outside the header element, so the
 * `data-header-state` trick the nav links use cannot reach it. A filled
 * pill solves both at once: the site's own surface with a hairline, which
 * is opaque enough to sit on any photograph and is already the right
 * colour on a plain band, in both themes.
 *
 * Rendered as `null` before mount and hidden below `lg`, so nothing about
 * first paint changes and no phone sees a control it does not need.
 */
function BackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // After mount only: history is not available while rendering, and
    // reading it on the server would make this component non-static.
    setCanGoBack(window.history.length > 1);
  }, [pathname]);

  if (pathname === "/" || !canGoBack) return null;

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Go back"
      // z-30, under the header's z-40: it sits below the bar and must
      // pass under it rather than over it if a page ever scrolls it
      // there. `top` is the header's own height plus a gap, read from
      // --spacing-header so the two cannot drift apart.
      //
      // ── min-h-11, AND IT IS PAINTED RATHER THAN FAKED ────────────────
      //
      // `px-3 py-2` around a 20px line measured 81x36, which is under the
      // 44px floor CLAUDE.md sets and was the last real tap-target
      // finding on the site. The pseudo-element trick the bookmark toggle
      // uses is the right answer THERE and the wrong one here: that
      // control is one of 238 in a row whose height it would set, so an
      // invisible hit area is what keeps the row from growing. This is a
      // single floating control with a whole margin to itself, and an
      // 81x36 pill with an invisible 81x44 target is a control that is
      // hit where it is not drawn. Nothing was competing for the 8px.
      //
      // py-2 stays so the box is 44 by its own padding at any text size a
      // reader has set, rather than 44 only while the line box happens to
      // be 20px. min-h-11 is the floor under that, not a replacement.
      className="fixed right-4 z-30 hidden min-h-11 items-center gap-2 rounded-control bg-surface/90 px-3 py-2 text-sm font-medium text-ink ring-1 ring-line backdrop-blur transition-[background-color,translate] duration-fast ease-out-soft hover:bg-surface active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 lg:inline-flex"
      style={{ top: "calc(var(--spacing-header) + 0.75rem)" }}
    >
      <ArrowLeft aria-hidden className="size-4" />
      Back
    </button>
  );
}

/**
 * A row in the mobile sheet.
 *
 * Its own component rather than a variant of NavLink, because almost
 * nothing is shared. NavLink is a text link sized to take no horizontal
 * room, in a bar that has none to spare, and it flips to white over a
 * photograph. This is a full-width row on an opaque panel that is never
 * over a photograph, and its whole job is to be a large, obvious target.
 * Two short components rather than one with four branches in it.
 */
function SheetNavLink({
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
        // min-h-12: a row in a sheet is the most-tapped control on the
        // site and takes the 48px floor, not the 44px minimum.
        "group/row flex min-h-12 items-center justify-between gap-3 rounded-card px-3 text-base font-medium",
        "transition-[background-color,translate] duration-fast ease-out-soft active:translate-y-px",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-500",
        isActive
          ? // A tinted ground AND a left edge. The edge is the part that
            // works without colour vision: it changes the shape of the
            // row, not only its fill.
            "bg-accent-50 text-ink shadow-[inset_3px_0_0_0_var(--color-accent-500)]"
          : "text-ink-muted hover:bg-surface-muted hover:text-ink",
      )}
    >
      {label}
      <ChevronRight
        aria-hidden
        className={cn(
          "size-4 shrink-0 transition-[translate] duration-fast ease-out-soft group-hover/row:translate-x-0.5",
          isActive ? "text-accent-500" : "text-ink-muted/60",
        )}
      />
    </Link>
  );
}

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
            ── xl, AND IT WAS lg UNTIL THE LOCKUP BECAME ONE LINE ───────

            It was md once, and moved to lg because eight links plus the
            lockup plus the theme toggle overflowed the document by 126px
            at 768 and 74px at 820 — a horizontal scrollbar on every page
            at tablet width, invisible for months because nothing measured
            it.

            lg then held only by crushing the lockup. At exactly 1024 the
            shell's content box is 944px, the nine-link nav takes 738 and
            the toggle-and-menu cluster plus two flex gaps take 64, which
            left the wordmark 142px of the 312 it wants. While the
            wordmark could wrap, that was survivable-looking: it wrapped
            to four lines and stood 100px tall inside an 80px band, which
            is a bug but not a collision.

            The wordmark is one non-wrapping string now, so there is no
            wrapping left to absorb the squeeze. Measured at 1024 with it:
            the lockup box is 141px and the text inside it is 188px, so
            the name spills out of its own box and under the first nav
            link. Nothing about that is fixable with a gap — nav at gap-1
            still leaves the bar 8px short of fitting.

            So the desktop bar starts at xl. At 1280 the content box is
            1200 and the bar needs 1112, which leaves 88px spare. Between
            1024 and 1279 the links are in the sheet, which is where they
            already are on every narrower screen.

            The trade, stated: a 1024-1279 laptop now opens a menu to
            navigate instead of reading a bar. That is the cost of the
            church's name being legible and whole at that width, and the
            sheet is a real navigation rather than a fallback.
          */}
          <nav
            aria-label="Primary"
            className="hidden xl:flex xl:items-center xl:gap-6"
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
                  // xl, matching the nav above it. These two are one
                  // decision: the menu button exists exactly where the
                  // bar does not.
                  className="size-12 xl:hidden group-data-[header-state=transparent]/header:text-white"
                  aria-label="Open menu"
                >
                  {/* size-6, or the Button base leaves a 16px glyph in a
                      48px box. */}
                  <Menu aria-hidden className="size-6" />
                </Button>
              </SheetTrigger>
              {/* ── THE SHEET ────────────────────────────────────────
                  It was the desktop nav turned on its side: nine 44px
                  text links at gap-0.5, ranged left in a column, with
                  nothing but colour marking the current page. On a phone
                  that is the whole of the navigation and it read as a
                  list of words rather than as a place to go.

                  Three changes, and each is doing one thing. Every row is
                  a full-width surface with a chevron, so the target is
                  the row and not the four characters in it. The current
                  page takes a tinted ground and an accent left edge
                  rather than a shade of ink, which is legible at a glance
                  and does not depend on comparing two greys. And the
                  header carries the brand lockup instead of the edition
                  as plain text, so opening the sheet does not replace the
                  thing you were just looking at with a paraphrase of it.

                  No new colour: surface-muted for the row, accent-50 and
                  accent-500 for the current one, all four already in the
                  palette. */}
              <SheetContent side="right" className="w-[19rem] sm:w-[21rem]">
                <SheetHeader className="border-b border-line p-4">
                  <SheetTitle className="text-left">
                    <span className="sr-only">{eventInfo.edition}</span>
                    <BrandLockup aria-hidden />
                  </SheetTitle>
                </SheetHeader>
                <nav
                  aria-label="Primary"
                  className="flex flex-col gap-1 overflow-y-auto p-3"
                >
                  {navLinks.map((link) => (
                    <SheetNavLink
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

      {/* Outside the <header> landmark on purpose. It is not site
          navigation — it acts on the page you are on — and putting it in
          the landmark would announce it as a tenth nav item. */}
      <BackButton />
    </>
  );
}
