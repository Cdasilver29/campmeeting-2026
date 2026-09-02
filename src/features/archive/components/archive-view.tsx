"use client";

import { useState } from "react";
import { ExternalLink, ListVideo } from "lucide-react";
import type { ArchiveYear } from "@/data/archive";
import { DOC_HEADING } from "@/lib/typography";
import { playlistUrl } from "../config";
import {
  archiveSessionCount,
  archiveVideoCount,
  archiveYears,
  latestArchiveYear,
} from "../lib/entries";
import { PlaylistEmbed } from "./playlist-embed";
import { ThemedYear } from "./themed-year";

/**
 * The archive: a year selector, and one panel per year.
 *
 * ── THE MOST RECENT YEAR LEADS, AND IS NOT CALLED "CURRENT" ──────────
 *
 * First in the strip and selected on load, derived from the data rather
 * than written down — `latestArchiveYear` is the head of a list sorted by
 * year, so adding 2027 moves the default with no edit here.
 *
 * The word matters. Its tab carries a "Latest" pill and its panel opens
 * "The most recent camp meeting", never "this year's" and never
 * "current": from the moment 2027's programme goes live, the most recent
 * ARCHIVED meeting is still a finished one, and a reader has to be able to
 * tell the archive from the event.
 *
 * ── EVERY PANEL IS IN THE HTML ───────────────────────────────────────
 *
 * All seven render and `hidden` decides which is shown, rather than the
 * unselected ones being unmounted. Same reasoning as /gallery, and the
 * same payoff: with scripting off the tabs cannot switch anything, so a
 * reader would otherwise get the default panel and no way to reach the
 * other six. With every panel in the document, the noscript rule below
 * removes the tab strip and shows all of them under their own headings.
 *
 * It costs nothing at runtime. `hidden` stops a panel being painted, and
 * the thumbnails inside it carry `loading="lazy"` — a hidden element is
 * never in the viewport, so nothing in an unselected year is fetched
 * until it is selected. The six playlist panels fetch nothing either way
 * until their poster is pressed.
 *
 * ── THE HEADINGS UNDER NOSCRIPT ──────────────────────────────────────
 *
 * Each panel carries an `sr-only` year heading. With scripting on that
 * would repeat the tab that is already visible and selected, so it is
 * only in the accessibility tree; with scripting off it is the only thing
 * separating one year from another, so the rule below unsets `sr-only` on
 * exactly those elements. Written out declaration by declaration because
 * that is what `sr-only` sets.
 *
 * `[data-archive-controls]` goes with the tabs: the search box, the
 * speaker filter and the theme chips are all React state, and a control
 * that cannot do anything is worse than no control.
 */
const NOSCRIPT_CSS = `
[data-archive-tabs]{display:none}
[data-archive-controls]{display:none}
[data-archive-panel][hidden]{display:block}
[data-archive-year]{
  position:static;width:auto;height:auto;padding:0;margin:0;
  overflow:visible;clip:auto;clip-path:none;white-space:normal;
}
`;

/*
 * The tab. A real button in a `tablist` with `aria-selected` carrying the
 * state — not a link, because nothing here is a separate document.
 *
 * Selected is a filled `primary` chip: white on Emperor at 11.59:1 in
 * light, and in dark `--primary` lightens and its foreground inverts with
 * it at 7.48:1. Unselected is ink-muted on surface-muted, 5.96:1 light and
 * 10.49:1 dark. Both pairs are already asserted in tools/perf/contrast.mjs.
 *
 * min-h-11 because these are the first thing a thumb lands on. Seven tabs
 * wrap on a phone, which is why this strip is `flex-wrap` where /gallery's
 * two-tab strip is not.
 */
const TAB =
  "inline-flex min-h-11 items-center gap-2 rounded-control px-3.5 text-sm font-medium transition-colors duration-fast ease-out-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";
const TAB_ON = TAB + " bg-primary text-primary-foreground";
const TAB_OFF = TAB + " text-ink-muted hover:bg-surface-muted hover:text-ink";

/**
 * The "Latest" pill on the leading tab.
 *
 * ── OUTLINED IN currentColor, NOT FILLED ─────────────────────────────
 *
 * The first version filled it: `bg-white/20` on the selected tab and
 * `bg-surface-muted` on an unselected one. That is a new colour pairing
 * in each state — white type over white-at-20%-over-Emperor is not
 * Emperor, and it is not 11.59:1 — and it would have been two rows in
 * tools/perf/contrast.mjs asserting a composite that exists nowhere else
 * on the site.
 *
 * Outlined, it introduces none. The text is `currentColor`, so it is
 * exactly the tab's own text colour on the tab's own ground — a pairing
 * already asserted in both states and both themes (primary-foreground on
 * primary; ink-muted on surface-muted). The border is the same
 * currentColor, so it clears the 3:1 non-text floor wherever the text
 * clears 4.5:1, which is everywhere this renders.
 */
function LatestPill() {
  return (
    <span className="rounded-full border border-current px-1.5 py-0.5 text-[0.625rem] font-semibold tracking-wide uppercase">
      Latest
    </span>
  );
}

/** One year's panel: its themed sections, its playlist, or both. */
function YearPanel({ entry }: { entry: ArchiveYear }) {
  const isLatest = entry.year === latestArchiveYear.year;
  /* Two figures, not one. A year can list a session it has no recording
     of — 2026 lists 55 and holds 54 — and rounding that away would be a
     claim about how many videos exist. See archiveVideoCount in
     src/data/archive/index.ts. */
  const sessions = archiveSessionCount(entry);
  const recordings = archiveVideoCount(entry);

  return (
    <div className="flex flex-col gap-(--space-section)">
      <div className="flex flex-col gap-2">
        {/* sr-only with scripting on — the selected tab already says the
            year. Revealed by the noscript rule above. */}
        <h2 data-archive-year className={"sr-only " + DOC_HEADING}>
          Camp Meeting {entry.year}
        </h2>
        <p className="max-w-[var(--width-prose)] text-ink-muted">
          {isLatest ? "The most recent camp meeting. " : null}
          {sessions > 0
            ? sessions +
              " sessions from " +
              entry.year +
              ", grouped by theme" +
              (recordings === sessions
                ? ". Each one opens on the church's YouTube channel."
                : " — " +
                  recordings +
                  " of them recorded. Each recording opens on the church's YouTube channel.")
            : "The " +
              entry.year +
              " sermons, as one playlist on the church's YouTube channel."}
        </p>
      </div>

      {/* Themed sections where the year has them. A year can carry both
          these and a playlist; see the note on ArchiveYear in
          src/data/archive/types.ts. */}
      {entry.themes.length > 0 ? <ThemedYear entry={entry} /> : null}

      {entry.playlistId ? (
        <section
          aria-label={"Camp Meeting " + entry.year + " playlist"}
          className="flex w-full max-w-[var(--width-prose)] flex-col gap-3"
        >
          {/* The tray the live player sits in on /livestream, so a player
              on this site is one object wherever it appears. surface-muted
              around an Emperor poster: in light a pale ground around deep
              plum, in dark a plum ground around the same plum with the
              ring separating them. The poster's own white type measures
              11.59:1 in both, because Emperor holds one value. */}
          <div className="flex flex-col gap-2 rounded-[1.25rem] bg-surface-muted p-2 ring-1 ring-line sm:gap-2.5 sm:rounded-[1.5rem] sm:p-3">
            <PlaylistEmbed playlistId={entry.playlistId} year={entry.year} />
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1.5 pb-0.5">
              <p className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                <ListVideo aria-hidden className="size-4 shrink-0" />
                {entry.year} sermons
              </p>
              <a
                href={playlistUrl(entry.playlistId)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-ink-muted underline underline-offset-4 transition-colors duration-fast hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
              >
                Open on YouTube
                <ExternalLink aria-hidden className="size-3.5 shrink-0" />
              </a>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function ArchiveView() {
  const [selected, setSelected] = useState(latestArchiveYear.year);

  return (
    <div className="flex flex-col gap-(--space-section)">
      <noscript>
        {/* A fixed string constant, no interpolation, and it only ever
            applies when scripting is off. */}
        <style dangerouslySetInnerHTML={{ __html: NOSCRIPT_CSS }} />
      </noscript>

      <div
        data-archive-tabs
        role="tablist"
        aria-label="Choose a camp meeting year"
        className="flex w-fit max-w-full flex-wrap gap-1 rounded-control bg-surface-muted p-1 ring-1 ring-line"
      >
        {archiveYears.map((entry) => {
          const on = entry.year === selected;
          const isLatest = entry.year === latestArchiveYear.year;
          return (
            <button
              key={entry.year}
              type="button"
              role="tab"
              id={"archive-tab-" + entry.year}
              aria-selected={on}
              aria-controls={"archive-panel-" + entry.year}
              onClick={() => setSelected(entry.year)}
              className={on ? TAB_ON : TAB_OFF}
            >
              <span className="tabular-figures">{entry.year}</span>
              {isLatest ? <LatestPill /> : null}
            </button>
          );
        })}
      </div>

      {archiveYears.map((entry) => (
        <div
          key={entry.year}
          data-archive-panel
          role="tabpanel"
          id={"archive-panel-" + entry.year}
          aria-labelledby={"archive-tab-" + entry.year}
          hidden={entry.year !== selected}
        >
          <YearPanel entry={entry} />
        </div>
      ))}
    </div>
  );
}
