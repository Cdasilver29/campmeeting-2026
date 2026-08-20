"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { galleryCollections, defaultCollectionId } from "../lib/collections";
import { GalleryGrid } from "./gallery-grid";

/**
 * ── THE YEAR SELECTOR ────────────────────────────────────────────────
 *
 * A segmented control, 2026 first and selected. 2026 is this week's event
 * rather than an archive, so it leads; the previous camp meetings are the
 * thing you go and look for.
 *
 * ── EVERY PANEL IS IN THE HTML ───────────────────────────────────────
 *
 * All collections render and `hidden` decides which is shown, rather than
 * the unselected ones being unmounted. Two reasons, and the second is the
 * one that made the decision.
 *
 * The pictures are the page. /gallery has always rendered, scrolled and
 * read with JavaScript off — see the note in gallery-grid.tsx — and a tab
 * strip whose state lives in React would have taken that away: with
 * scripting off the tabs cannot switch anything, so a reader would get the
 * default panel and no way to reach the other one. With every panel in the
 * document, the noscript block below removes the tabs and shows all of
 * them, each under its own heading, which is what this page looked like
 * before it had years at all.
 *
 * And switching a tab then moves no images across the network. `hidden`
 * only stops the panel being painted; a browser still fetches what is in
 * it, so the previous-years set is not re-downloaded on every switch —
 * `loading="lazy"` on the thumbnails is what keeps that honest, since a
 * hidden element is never in the viewport and never triggers.
 *
 * ── THE HEADINGS UNDER NOSCRIPT ──────────────────────────────────────
 *
 * Each panel carries an `sr-only` collection heading. With scripting on
 * that heading would repeat the tab that is already visible and selected,
 * so it is only in the accessibility tree; with scripting off it is the
 * only thing separating one year from another, so the noscript rule below
 * unsets `sr-only` on exactly those elements. Written out declaration by
 * declaration because that is what `sr-only` sets.
 */
const NOSCRIPT_CSS = `
[data-gallery-tabs]{display:none}
[data-gallery-panel][hidden]{display:block}
[data-gallery-year]{
  position:static;width:auto;height:auto;padding:0;margin:0;
  overflow:visible;clip:auto;clip-path:none;white-space:normal;
}
`;

/**
 * The 2026 collection before any photographs have been added.
 *
 * "Photographs are still coming", not "no results". A reader who opens
 * this on the Tuesday of camp meeting is early, not looking at something
 * broken, and the difference between those two is entirely in whether the
 * page says so. The dashed panel is the same shape /livestream uses for
 * its pending recordings, so "a thing that has not arrived yet" has one
 * look across the site.
 *
 * ink-muted on the 50% muted ground: 6.17:1 light, 10.79:1 dark, both
 * asserted in tools/perf/contrast.mjs.
 */
function ComingSoon({ message }: { message: string }) {
  return (
    <div className="flex max-w-[var(--width-prose)] items-start gap-3 rounded-card border border-dashed border-line bg-surface-muted/50 p-5">
      <Camera aria-hidden className="mt-0.5 size-5 shrink-0 text-ink-muted" />
      <p className="text-ink-muted">{message}</p>
    </div>
  );
}

/*
 * The tab. A real button in a `tablist`, with `aria-selected` carrying the
 * state — not a link, because nothing here is a separate document.
 *
 * The selected tab is a filled `primary` chip: white on Emperor is 11.59:1
 * in light mode, and in dark mode `--primary` lightens to #b89ae0 and its
 * foreground inverts with it at 7.48:1. Both are the shipped
 * primary/primary-foreground pair the contrast tool already asserts, so
 * this control introduces no new pairing.
 *
 * The unselected tab is ink-muted on the page: 6.37:1 light, 11.12:1 dark.
 *
 * min-h-11 because these are the first thing a thumb lands on.
 */
const TAB =
  "inline-flex min-h-11 items-center rounded-control px-3.5 text-sm font-medium transition-colors duration-fast ease-out-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";
const TAB_ON = `${TAB} bg-primary text-primary-foreground`;
const TAB_OFF = `${TAB} text-ink-muted hover:bg-surface-muted hover:text-ink`;

export function GalleryView() {
  const [selected, setSelected] = useState(defaultCollectionId);

  return (
    <div className="flex flex-col gap-(--space-section)">
      <noscript>
        {/* A fixed string constant, no interpolation, and it only ever
            applies when scripting is off. */}
        <style dangerouslySetInnerHTML={{ __html: NOSCRIPT_CSS }} />
      </noscript>

      {/* A row, not a wrap: two tabs at any width this site supports.
          `w-fit` and a hairline so the pair reads as one control rather
          than as two loose buttons. */}
      <div
        data-gallery-tabs
        role="tablist"
        aria-label="Choose a camp meeting"
        className="flex w-fit max-w-full flex-wrap gap-1 rounded-control bg-surface-muted p-1 ring-1 ring-line"
      >
        {galleryCollections.map((entry) => {
          const on = entry.id === selected;
          return (
            <button
              key={entry.id}
              type="button"
              role="tab"
              id={`gallery-tab-${entry.id}`}
              aria-selected={on}
              aria-controls={`gallery-panel-${entry.id}`}
              onClick={() => setSelected(entry.id)}
              className={on ? TAB_ON : TAB_OFF}
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      {galleryCollections.map((entry) => (
        <section
          key={entry.id}
          data-gallery-panel
          hidden={entry.id !== selected}
          id={`gallery-panel-${entry.id}`}
          role="tabpanel"
          aria-labelledby={`gallery-tab-${entry.id}`}
          /* tabIndex 0 so a keyboard reader can scroll the panel after
             leaving the tab strip, which is the standard tabs pattern for
             a panel whose contents are not all focusable. */
          tabIndex={0}
          className="flex flex-col gap-(--space-item) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          <h2 data-gallery-year className="sr-only text-lg font-medium text-ink">
            {entry.description}
          </h2>
          {entry.images.length > 0 ? (
            <GalleryGrid groups={entry.groups} images={entry.images} />
          ) : (
            <ComingSoon message={entry.emptyMessage} />
          )}
        </section>
      ))}
    </div>
  );
}
