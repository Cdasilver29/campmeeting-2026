"use client";

import { useEffect } from "react";

/** The rail element the sticky offset is written to. */
export const RAIL_ID = "day-rail";
/** The scroller inside it, which carries data-overflow. */
export const RAIL_SCROLLER_ID = "day-rail-scroller";

/**
 * The three things the day rail cannot do in CSS alone. No markup of its
 * own: it renders null and only writes attributes and custom properties
 * onto elements the server already sent.
 *
 * 1. THE STICKY OFFSET, FROM THE REAL HEADER.
 *    The rail used to sit at `top-header`, the token the header declares
 *    its own height from. That is one number in one place, which is
 *    already better than a magic 5rem — but it is still the declared
 *    height, not the rendered one, and the two part company the moment a
 *    font falls back or a browser rounds a rem differently. This measures
 *    the header and writes --rail-top. Where it agrees with the token,
 *    which is the normal case, nothing moves.
 *
 *    --scroll-offset goes on the document at the same time: it is the
 *    header plus the rail, and it is what a day section's scroll-margin
 *    needs so a deep link does not land underneath both of them. That was
 *    a hardcoded scroll-mt-40.
 *
 * 2. THE EDGE FADE, ON THE SIDE THAT HAS SOMETHING BEHIND IT.
 *    Below md the rail scrolls, and a scroller with no visible edge reads
 *    as a complete list that happens to end. A mask on the overflowing
 *    side says otherwise. It is driven by data-overflow rather than
 *    painted unconditionally, so a rail scrolled to its end does not fade
 *    out the last tile — the thing a static gradient gets wrong.
 *
 *    One passive listener on the rail itself, not on the page. It fires
 *    only while the reader is dragging nine tiles, and it reads two
 *    numbers off an element that is already in the layout.
 *
 * 3. THE SELECTED DAY, SCROLLED INTO VIEW.
 *    Written as scrollLeft on the scroller rather than scrollIntoView on
 *    the tile. scrollIntoView walks up every scrollable ancestor, and this
 *    rail is sticky inside a 28,000px document, so it can and does scroll
 *    the page as well as the rail. Setting scrollLeft cannot.
 *
 * 4. WHICH DAY IS ON SCREEN, AS THE READER SCROLLS.
 *    /schedule is 28,000px of programme under a rail that says which day
 *    you chose and nothing about which day you are looking at. One
 *    IntersectionObserver over the eight day sections fixes that.
 *
 *    One observer with eight targets, not one per entry and not a scroll
 *    handler. The 238 session rows are never observed — the day section is
 *    the unit, which is also the unit the rail navigates by.
 *
 *    The cue on the tile is a border, a background and a weight change
 *    together, so it is not carried by colour. It is deliberately not
 *    aria-current: aria-current="page" already means "this is the day you
 *    are on", and having two attributes claim two different kinds of
 *    "current" in one control would be worse than not marking it at all.
 *
 * Nothing here animates. Under reduced motion this behaves identically:
 * the scroll is instant in both cases, and there is nothing to disable.
 */
export function DayRailBehaviour() {
  useEffect(() => {
    const rail = document.getElementById(RAIL_ID);
    const scroller = document.getElementById(RAIL_SCROLLER_ID);
    const header = document.querySelector("header");
    if (!rail || !scroller) return;

    const syncOffsets = () => {
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      if (headerHeight > 0) {
        rail.style.setProperty("--rail-top", `${Math.round(headerHeight)}px`);
      }
      const railHeight = rail.getBoundingClientRect().height;
      document.documentElement.style.setProperty(
        "--scroll-offset",
        `${Math.round(headerHeight + railHeight + 16)}px`,
      );
    };

    // 1px of slack: a scroller at its end can report a sub-pixel gap on a
    // fractional device pixel ratio, and a fade that flickers on and off
    // at the end of a drag is worse than no fade.
    const syncOverflow = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      if (max <= 1) {
        scroller.dataset.overflow = "none";
        return;
      }
      const atStart = scroller.scrollLeft <= 1;
      const atEnd = scroller.scrollLeft >= max - 1;
      scroller.dataset.overflow = atStart ? "end" : atEnd ? "start" : "both";
    };

    // Centre the selected tile in the scroller, clamped to its own range
    // so the first and last day are not pulled away from the edge.
    const current = scroller.querySelector<HTMLElement>("[aria-current]");
    if (current) {
      const target =
        current.offsetLeft - (scroller.clientWidth - current.offsetWidth) / 2;
      scroller.scrollLeft = Math.max(
        0,
        Math.min(target, scroller.scrollWidth - scroller.clientWidth),
      );
    }

    syncOffsets();
    syncOverflow();

    scroller.addEventListener("scroll", syncOverflow, { passive: true });

    // One observer for both jobs: a viewport change can alter the header's
    // height, the rail's height and whether the rail overflows at all.
    const resize = new ResizeObserver(() => {
      syncOffsets();
      syncOverflow();
    });
    resize.observe(rail);
    resize.observe(scroller);
    if (header) resize.observe(header);

    /*
     * Which day is on screen. Eight targets, one observer.
     *
     * The rail is sticky, so "on screen" has to mean "below the rail":
     * a rootMargin whose top edge is pulled in by the header plus the rail
     * makes the observer agree with what the reader can actually see. The
     * bottom is pulled in hard so that only the section occupying the
     * upper part of the viewport counts, rather than every section the
     * viewport happens to touch.
     *
     * The tiles are looked up once into a Map rather than queried per
     * callback: the callback runs on every scroll that crosses a
     * threshold, and a querySelector per entry per fire on a 28,000px page
     * is work for nothing.
     */
    const sections = [
      ...document.querySelectorAll<HTMLElement>("section[id^='day-']"),
    ];
    let dayObserver: IntersectionObserver | undefined;

    if (sections.length > 1) {
      const tiles = new Map<string, HTMLElement>();
      for (const link of scroller.querySelectorAll<HTMLElement>("a[href]")) {
        const day = new URL(link.getAttribute("href")!, location.href)
          .searchParams.get("day");
        if (day) tiles.set(`day-${day}`, link);
      }

      const visible = new Set<string>();
      const paint = () => {
        // Document order, so the topmost visible day wins rather than
        // whichever section the browser reported last.
        const first = sections.find((s) => visible.has(s.id));
        for (const [id, tile] of tiles) {
          tile.dataset.inView = String(first?.id === id);
        }
      };

      dayObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) visible.add(entry.target.id);
            else visible.delete(entry.target.id);
          }
          paint();
        },
        {
          rootMargin: `-${Math.round(
            (header?.getBoundingClientRect().height ?? 80) +
              rail.getBoundingClientRect().height,
          )}px 0px -55% 0px`,
        },
      );
      for (const section of sections) dayObserver.observe(section);
    }

    return () => {
      scroller.removeEventListener("scroll", syncOverflow);
      resize.disconnect();
      dayObserver?.disconnect();
    };
  }, []);

  return null;
}
