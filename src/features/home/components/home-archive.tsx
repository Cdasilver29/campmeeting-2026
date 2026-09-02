import Link from "next/link";
import { Library } from "lucide-react";
import { EventPhaseSync } from "@/components/event-phase-sync";
import { eventPhaseScript } from "@/lib/event-phase-script";
import { eventPhase } from "@/features/schedule/lib/time";
import { ARCHIVE_PATH } from "@/features/archive/config";
import { ArchiveShowcase } from "@/features/archive/components/archive-showcase";
import {
  archiveVideoCount,
  earliestArchiveYear,
} from "@/features/archive/lib/entries";
import { getShowcase, showcaseVideos } from "@/features/archive/lib/showcase";

const VIEW_ID = "home-archive";
const PHASE_ATTRIBUTE = "data-archive-phase";

/*
 * Every variant is a literal class string. Tailwind finds class names by
 * scanning source text, so a name assembled at runtime is a name it never
 * generates and the rule silently does not exist. Same rule the hero's and
 * /livestream's phase variants are written under.
 */
const SHOW_AFTER = "hidden group-data-[archive-phase=after]/archive:flex";
const SHOW_BEFORE = "hidden group-data-[archive-phase=before]/archive:flex";

/**
 * The archive on the home page, and how much of it each phase gets.
 *
 * ── THREE PHASES, THREE ANSWERS ──────────────────────────────────────
 *
 * AFTER — the whole moving showcase, immediately under the hero. This is
 * the state the site is in now and the state it is in for eleven and a
 * half months of every year: there is no live session, there is no
 * "today" in the programme, and seven years of recordings are the most
 * useful thing this page has. It is high on the page because in this
 * phase nothing above it except the hero has a stronger claim.
 *
 * BEFORE — one line and a link. In the run-up to a camp meeting the page
 * belongs to the countdown and the coming programme, but last year's
 * sermons are a real answer to "what is this going to be like", so the
 * route stays and the fourteen thumbnails go. It is one row, no
 * cross-origin images, and nothing that moves.
 *
 * DURING — nothing at all in this slot. During the week the live session
 * and today's programme are what the page is for, and an archive strip
 * above them would be competing with the thing it is an archive OF. The
 * route to /archive is still one tap away in the nav, and /livestream
 * carries it under the player for anyone who missed a session.
 *
 * ── ALL OF IT IS IN THE HTML, AND ONE ATTRIBUTE DECIDES ──────────────
 *
 * Not a clock read on mount. Every page here is statically generated, so
 * the served HTML can only carry the phase the BUILD was made in, and a
 * deploy made in July would show the whole showcase to every visitor
 * during camp meeting week. Correcting that on mount is too late — mount
 * is after first paint, so a block this tall appearing or disappearing
 * then is a large layout shift on the site's front page.
 *
 * So both states are rendered, `data-archive-phase` on the group decides
 * which is shown, and the attribute is resolved at build time and
 * corrected during parse by the script below — before the first paint.
 * `EventPhaseSync` covers the client-navigation path, where no document
 * is parsed and the script therefore never runs. This is the same
 * machinery, and literally the same generator, that the hero above and
 * /livestream use; see src/lib/event-phase-script.ts.
 *
 * The `during` phase has no block of its own because it renders nothing:
 * neither variant matches, and the wrapper collapses to zero height.
 *
 * ── AND IT FOLLOWS THE DATA INTO NEXT YEAR ───────────────────────────
 *
 * `getShowcase()` returns the most recent archived year that names a
 * showcase theme. Nothing here says 2026. When src/data/archive/year-2027.ts
 * is added, this strip shows 2027's sermons and this file is not touched.
 * When no year qualifies it returns undefined and the component renders
 * nothing at all rather than an empty frame.
 */
export function HomeArchive() {
  const showcase = getShowcase();
  if (!showcase) return null;

  const videos = showcaseVideos(showcase);
  if (videos.length === 0) return null;

  const { year, theme } = showcase;

  return (
    <>
      <div
        id={VIEW_ID}
        {...{ [PHASE_ATTRIBUTE]: eventPhase(new Date()) }}
        className="group/archive"
      >
        <div className={`${SHOW_AFTER} flex-col`}>
          <ArchiveShowcase
            year={year.year}
            themeId={theme.id}
            themeLabel={theme.label}
            videos={videos}
            totalInYear={archiveVideoCount(year)}
          />
        </div>

        {/* The minimal form. One row, no images, no motion.
            ink on surface-muted 15.76:1 light / 14.83:1 dark; ink-muted on
            the same ground 5.96:1 / 10.49:1. Both already asserted. */}
        <div className={`${SHOW_BEFORE} flex-col`}>
          <Link
            href={ARCHIVE_PATH}
            className="flex max-w-[var(--width-prose)] items-center gap-3 rounded-card bg-surface-muted p-4 ring-1 ring-line transition-[box-shadow] duration-fast ease-out-soft hover:ring-2 hover:ring-accent-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            <Library aria-hidden className="size-5 shrink-0 text-ink-muted" />
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-ink">
                Watch a previous camp meeting
              </span>
              <span className="text-sm text-ink-muted">
                {archiveVideoCount(year)} recordings from {year.year}, and
                every year back to {earliestArchiveYear.year}.
              </span>
            </span>
          </Link>
        </div>
      </div>

      {/* Runs during parse, immediately after the element it corrects, so
          the final state is in place before the first paint — on a COLD
          load. A client-side navigation to this page never parses a
          document, so React restores the build-time phase; the sync below
          covers that path. */}
      <script
        dangerouslySetInnerHTML={{
          __html: eventPhaseScript(VIEW_ID, PHASE_ATTRIBUTE),
        }}
      />
      <EventPhaseSync elementId={VIEW_ID} attribute={PHASE_ATTRIBUTE} />
    </>
  );
}
