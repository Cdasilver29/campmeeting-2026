"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import type { ArchiveYear } from "@/data/archive";
import { DOC_HEADING } from "@/lib/typography";
import {
  filterThemes,
  matchesQuery,
  videoKey,
  yearSpeakers,
} from "../lib/entries";
import { VideoCard } from "./video-card";

/**
 * A year the archive holds session by session: its filters, and its
 * thematic sections.
 *
 * ── ONE ACTION TO "ALL THE STEWARDSHIP TALKS" ────────────────────────
 *
 * That was the requirement, and it is why the themes are a CHIP ROW
 * rather than nine collapsed panels. A row of chips with counts on them
 * puts every theme and its size on screen at once, and one press narrows
 * the page to that theme — one action, and the reader can see what the
 * other eight hold before choosing. Nine collapsed panels would have
 * hidden exactly the information needed to choose between them, and would
 * have cost an open and a scroll instead of a press.
 *
 * The sections keep their headings and their ids either way, so a deep
 * link to #stewardship still lands on the section.
 *
 * ── THE FILTERS COMPOSE, AND THE CHIPS COUNT WHAT IS LEFT ────────────
 *
 * Query and speaker narrow the set; the chip counts are computed FROM
 * that narrowed set, so a search for "faithfulness" turns the Stewardship
 * chip into "Stewardship 2" and drops the chips that now hold nothing.
 * Counts that ignored the other filters would be a promise the press
 * cannot keep.
 *
 * The theme chip is applied last and does not affect the counts, because
 * it is the selection those counts are offered for.
 *
 * ── STATE IS LOCAL, NOT IN THE URL ───────────────────────────────────
 *
 * Unlike /schedule, whose filters are URL-driven because a filtered
 * programme is a thing people send each other mid-week. This is a
 * browsing surface for a finished year; a URL parameter here would also
 * have to be added to CLIENT_ONLY_URL_PARAMS in src/lib/pwa.ts to keep
 * the precached page answering for it offline, which is real cost for a
 * link nobody sends. /gallery made the same call.
 */

/*
 * The chip. A real button with `aria-pressed`, not a link: nothing here is
 * a separate document.
 *
 * Selected is a filled `primary` chip — white on Emperor is 11.59:1 in
 * light, and in dark `--primary` lightens and its foreground inverts with
 * it at 7.48:1. Both are the shipped primary/primary-foreground pair the
 * contrast tool already asserts, so this introduces no new pairing.
 * Unselected is ink-muted on surface-muted: 5.96:1 light, 10.49:1 dark.
 *
 * min-h-11: these are the first thing a thumb lands on.
 */
const CHIP =
  "inline-flex min-h-11 items-center gap-1.5 rounded-control px-3 text-sm font-medium transition-colors duration-fast ease-out-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";
const CHIP_ON = CHIP + " bg-primary text-primary-foreground";
const CHIP_OFF =
  CHIP + " bg-surface-muted text-ink-muted ring-1 ring-line hover:text-ink";

/**
 * The count inside a chip, so it reads as a quantity rather than a word.
 *
 * ── NO OPACITY. IT WAS A REAL CONTRAST FAILURE ───────────────────────
 *
 * This carried `opacity-80`, and on an unselected chip that composites
 * ink-muted over surface-muted down to #857994 on #f8f7fa: 3.81:1 for
 * 12px normal type, against a 4.5:1 floor. Lighthouse flagged it on
 * /archive as the sole `color-contrast` failure and it is what held the
 * page's accessibility score at 97.
 *
 * The chip's own colour, undimmed, is the pairing the rest of the page
 * already asserts: ink-muted on surface-muted 5.96:1 light / 10.49:1
 * dark, and primary-foreground on primary 11.59:1 / 7.48:1 when the chip
 * is selected. Nothing new is introduced by removing the dimming.
 *
 * What made the count read as a quantity was never the opacity anyway:
 * it is the tabular figures and the size step down from the label beside
 * it, and both are still here.
 */
const COUNT = "tabular-figures text-xs";

const FIELD =
  "min-h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors duration-fast ease-out-soft placeholder:text-ink-muted focus-visible:border-accent-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";

export function ThemedYear({ entry }: { entry: ArchiveYear }) {
  const [query, setQuery] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [themeId, setThemeId] = useState("");

  const speakers = useMemo(() => yearSpeakers(entry), [entry]);

  const total = useMemo(
    () => entry.themes.reduce((sum, theme) => sum + theme.videos.length, 0),
    [entry.themes],
  );

  /* Narrowed by query and speaker only. The chip counts are read off this,
     and the theme selection is applied to it afterwards. */
  const matched = useMemo(
    () =>
      filterThemes(
        entry.themes,
        (video) =>
          matchesQuery(video, query) &&
          (!speaker || video.speakers.includes(speaker)),
      ),
    [entry.themes, query, speaker],
  );

  const matchedCount = matched.reduce(
    (sum, theme) => sum + theme.videos.length,
    0,
  );

  /* A theme selection that survives its own disappearance would leave the
     page empty with a chip selected that no longer counts anything, so a
     selection that no longer matches is ignored rather than enforced. */
  const shown =
    themeId && matched.some((theme) => theme.id === themeId)
      ? matched.filter((theme) => theme.id === themeId)
      : matched;

  const filtering = Boolean(query.trim() || speaker || themeId);

  return (
    <div className="flex flex-col gap-(--space-section)">
      {/* data-archive-controls: removed with scripting off, where none of
          it can do anything. See the noscript rule in ./archive-view.tsx. */}
      <div data-archive-controls className="flex flex-col gap-(--space-item)">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles and speakers"
              aria-label={"Search the " + entry.year + " recordings"}
              className={FIELD + " pl-9"}
            />
          </div>

          <div className="w-full sm:max-w-xs">
            <select
              value={speaker}
              onChange={(event) => setSpeaker(event.target.value)}
              aria-label={
                "Filter the " + entry.year + " recordings by speaker"
              }
              className={FIELD}
            >
              <option value="">All speakers</option>
              {speakers.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* The themes, with what each holds under the current search. */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setThemeId("")}
            aria-pressed={themeId === ""}
            className={themeId === "" ? CHIP_ON : CHIP_OFF}
          >
            All themes
            <span className={COUNT}>{matchedCount}</span>
          </button>
          {matched.map((theme) => {
            const on = theme.id === themeId;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setThemeId(on ? "" : theme.id)}
                aria-pressed={on}
                className={on ? CHIP_ON : CHIP_OFF}
              >
                {theme.label}
                <span className={COUNT}>{theme.videos.length}</span>
              </button>
            );
          })}
        </div>

        {/* aria-live so a keyboard or screen reader user hears the result
            of a filter they cannot see the effect of. Only rendered while
            filtering, so it does not announce on load. */}
        {filtering ? (
          <p aria-live="polite" className="text-sm text-ink-muted">
            {matchedCount === 0
              ? "No recordings match."
              : matchedCount + " of " + total + " recordings match."}
          </p>
        ) : null}
      </div>

      {shown.length === 0 ? (
        /* The same dashed panel /gallery and /livestream use for a thing
           that is not there, rather than a bare grey sentence — which is
           indistinguishable from content that failed to arrive. ink-muted
           on the 50% muted ground: 6.17:1 light, 10.79:1 dark. */
        /* mx-auto, which is the site's own rule for a prose-width box
           sitting directly on the shell — see MEASURE_CENTRED in
           src/lib/typography.ts. Ranged left it was a 34rem panel with
           46rem of empty page beside it, standing exactly where a
           four-column grid had just been: it read as the last fragment of
           a page that failed to load rather than as an answer. Centred in
           the space the grid vacated, it reads as the state it is. */
        <div className="mx-auto flex max-w-[var(--width-prose)] items-start gap-3 rounded-card border border-dashed border-line bg-surface-muted/50 p-5">
          <SearchX aria-hidden className="mt-0.5 size-5 shrink-0 text-ink-muted" />
          <p className="text-ink-muted">
            Nothing in {entry.year} matches that. Clear the search, or choose a
            different theme.
          </p>
        </div>
      ) : (
        /* ── ONE THEME IS A BIGGER BREAK THAN A SECTION ────────────────
           `--space-band`, not `--space-section`, between one theme and
           the next.

           2026 is fifty-five sessions in nine themes, and at the section
           step the page was one uninterrupted field of thumbnails: the
           gap between "Bible Study" and the last row of "Sermons" above
           it was 40px, while the gap between two rows of cards inside a
           theme is 16px. Two and a half times is not enough of a
           difference to group anything when the things being grouped are
           fifty-five identically shaped cards, and half of them carry the
           same title as their own theme — every card in Bible Study is
           called "Bible Study".

           At the band step the ratio inside a theme becomes 4:1 — heading
           to grid at `--space-item`, theme to theme at `--space-band` —
           which is the ratio the whole spacing scale was built around,
           and it is what turns nine headings into nine places rather than
           nine more lines of type. No rule, no fill, no colour: the air
           is the identity.

           The headings keep their ids and their `scroll-mt-24`, so
           /archive#stewardship still lands where it did. */
        <div className="flex flex-col gap-(--space-band)">
          {shown.map((theme) => (
            <section
              key={theme.id}
              id={theme.id}
              aria-labelledby={theme.id + "-heading"}
              /* The site header is an 80px band, so an anchor landing at
                 the very top of the viewport would put the heading under
                 it. scroll-mt-24 is 96px: the band plus a little air. */
              className="flex scroll-mt-24 flex-col gap-(--space-item)"
            >
              <div className="flex flex-col gap-1 border-b border-line pb-2">
                <h3
                  id={theme.id + "-heading"}
                  className={
                    "flex flex-wrap items-baseline gap-x-3 gap-y-1 " +
                    DOC_HEADING
                  }
                >
                  {theme.label}
                  <span className="tabular-figures rounded-control bg-surface-muted px-1.5 py-0.5 font-sans text-xs font-medium text-ink-muted ring-1 ring-line">
                    {theme.videos.length}
                  </span>
                </h3>
                {theme.blurb ? (
                  <p className="max-w-[var(--width-prose)] text-sm text-ink-muted">
                    {theme.blurb}
                  </p>
                ) : null}
              </div>

              {/* Two up on a phone, four across from xl — the density the
                  page width is there for. gap-3 below sm: at 320 two
                  columns leave 140px each, and 16px of gutter out of that
                  is worth more as picture than as air. */}
              <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {theme.videos.map((video) => (
                  <li key={videoKey(video)}>
                    <VideoCard video={video} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
