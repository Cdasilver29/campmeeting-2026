import Link from "next/link";
import { ExternalLink, Video } from "lucide-react";
import {
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH,
  thumbnailUrl,
  watchUrl,
} from "../config";
import {
  archiveDays,
  type ArchiveSlot,
  type ResolvedRecording,
} from "../lib/recordings";
import { slotAnchorId } from "../lib/stream-link";

/**
 * The archive: the whole week, day 1 to day 8, morning and afternoon.
 *
 * A server component with no state and no clock. The grid is a constant
 * decided at build time, so this is markup — which matters, because the
 * page it sits on is the one a phone on campground signal opens to catch
 * up on a meeting it missed.
 *
 * ── EVERY SLOT IS DRAWN, POSTED OR NOT ───────────────────────────────
 *
 * A day with nothing posted is rendered in place and marked as not yet
 * up, rather than left out, so the page shows the shape of the week
 * filling in and a reader looking for a particular morning gets an answer
 * instead of a gap they have to interpret.
 *
 * ── EXCEPT THE TWO HALF-DAYS THAT HOLD NO SERVICE ────────────────────
 *
 * Fourteen slots, not sixteen. Sunday morning is the Medical Camp and
 * Friday afternoon is Sabbath Preparation, and neither is broadcast, so
 * neither gets a frame — "Not posted yet" would be promising a video that
 * was never going to exist. `archiveDays` works out which halves those
 * are from the programme itself; see ../lib/recordings.ts.
 *
 * The missing slot leaves plain empty space in the two-column grid, not a
 * box: the afternoon card keeps its own column through `col-start-2`, so
 * the morning column stays the morning column all the way down the page
 * rather than an afternoon sliding left into it.
 *
 * ── THE THUMBNAILS ARE THIRD-PARTY AND STAY THAT WAY ─────────────────
 *
 * A plain <img> pointing at img.youtube.com, and both halves of that are
 * deliberate. See the note on `thumbnailUrl` in ../config.ts: next/image
 * would re-serve these from this site's own origin, where the service
 * worker's default runtime rules would cache them, and the whole point is
 * that third-party bytes never enter the offline store. As a bare
 * cross-origin URL each one is matched by the NetworkOnly rule in
 * src/sw.ts and is never written to a cache; the precache manifest is
 * built from this site's output and public/ and cannot contain a URL on
 * another host at all.
 *
 * `loading="lazy"` because the archive sits below the live player during
 * the event and runs to sixteen images: none of them is on screen when
 * the page opens, and a phone on one bar should not spend its first
 * seconds fetching pictures of meetings from another host. `width` and
 * `height` are the file's real 480x360 and the frame carries its own
 * aspect-ratio, so nothing moves as they arrive.
 *
 * `referrerPolicy="no-referrer"` sends no page URL to YouTube with the
 * image request, which the embed below already cannot avoid but a
 * thumbnail has no need of.
 *
 * ── TWO LINKS PER POSTED SLOT ────────────────────────────────────────
 *
 * The video, and the programme day it is a recording OF. Someone catching
 * up on Tuesday morning wants to know what else was in that morning, and
 * that page already exists and already works offline. The day link is a
 * `Link` and the video an `<a target="_blank">`, which is the split the
 * rest of the site uses: internal navigation is prefetched and stays in
 * the app, and a YouTube URL leaves it.
 */

const FRAME =
  "relative aspect-video w-full overflow-hidden rounded-card bg-surface-muted ring-1 ring-line";

function PostedSlot({
  recording,
  partLabel,
  dayLabel,
}: {
  recording: ResolvedRecording;
  partLabel: string;
  dayLabel: string;
}) {
  return (
    <a
      href={watchUrl(recording.videoId)}
      target="_blank"
      rel="noreferrer"
      className="group/rec flex flex-col gap-2 rounded-card transition-opacity duration-fast hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
    >
      <span className={FRAME}>
        {/* eslint-disable-next-line @next/next/no-img-element -- deliberately
            not next/image: the optimizer would re-serve this from our own
            origin, where the service worker would cache it. See the note
            above and on thumbnailUrl in ../config.ts. */}
        <img
          src={thumbnailUrl(recording.videoId)}
          alt=""
          width={THUMBNAIL_WIDTH}
          height={THUMBNAIL_HEIGHT}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
      </span>
      <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
        {recording.title}
        <ExternalLink aria-hidden className="size-3.5 shrink-0" />
        {/* The day and the part are in the accessible name as well as
            beside the link, because a screen reader reading the links on
            this page out of context otherwise hears "Morning" eight
            times. */}
        <span className="sr-only">
          , {partLabel}, {dayLabel}, watch on YouTube
        </span>
      </span>
    </a>
  );
}

function PendingSlot({ slot }: { slot: ArchiveSlot }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`${FRAME} flex items-center justify-center border border-dashed border-line bg-surface-muted/60 ring-0`}
      >
        <Video aria-hidden className="size-6 text-ink-muted/50" />
      </div>
      <p className="text-sm text-ink-muted">
        {slot.partLabel}
        {" · "}
        <span className="text-ink-muted/80">Not posted yet</span>
      </p>
    </div>
  );
}

/**
 * `anchors` gives every slot a DOM id, so the home hero's "Watch live"
 * button can land on the half of the day the viewer is in.
 *
 * OFF BY DEFAULT, and that is load-bearing rather than tidy. This page
 * carries the after-phase copy of this list and the during-phase copy in
 * the same markup — all three phases are in the HTML, one attribute
 * decides which is shown, see the note in livestream-view.tsx. Ids on both
 * copies would be sixteen duplicated ids, and a duplicated id is a broken
 * anchor rather than a redundant one: the browser would scroll to the
 * first match, which is inside the `display:none` after-phase block. So
 * only the catch-up copy is anchored, which is also the only one on screen
 * during the week the button's hash means anything.
 */
export function RecordingsList({ anchors = false }: { anchors?: boolean }) {
  return (
    /* One day per row on a phone, TWO from lg.

       This is where the page width is actually used. The list used to be
       a single column capped at the prose measure, which on a 1440px page
       was a ribbon of thumbnails down the middle with most of the shell
       empty either side. Two days to a row, each day still its own pair,
       comes to four thumbnails across — the density asked for, without
       splitting a morning from its afternoon.

       gap-x-8 against gap-y-6: the horizontal gutter separates two
       unrelated days and has to read as a bigger break than the one
       between a day and the day under it, which already has a ruled
       heading of its own doing that work. */
    <ol className="grid gap-x-8 gap-y-(--space-item) lg:grid-cols-2">
      {archiveDays.map((entry) => (
        <li key={entry.day.id} className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-2">
            <h3 className="text-sm font-medium text-ink">
              <span className="tabular-figures text-ink-muted">
                Day {entry.dayNumber}
              </span>
              {" · "}
              {entry.dayLabel}
            </h3>
            <Link
              href={entry.dayHref}
              className="text-sm text-ink-muted underline underline-offset-4 transition-colors duration-fast hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
            >
              See that day&apos;s programme
            </Link>
          </div>

          {/* Always two, because a day IS two slots. Morning and afternoon
              are a pair and they belong on one row at every width, rather
              than the afternoon hanging under the morning on a phone.

              NOT four on desktop, which was the first attempt: a day has
              only two videos, so a four-column track left every day row
              half empty. The width is won on the DAY list instead — see
              the note on the <ol> below — which puts two days on a row and
              four thumbnails across, without breaking the pairing.

              gap-3 below sm: at 320 two columns leave 140px each, and 16px
              of gutter out of that is worth more as picture than as air. */}
          <ul className="grid grid-cols-2 gap-3 sm:gap-4">
            {entry.slots.map((slot) => (
              <li
                key={slot.part}
                {...(anchors
                  ? { id: slotAnchorId(entry.day.id, slot.part) }
                  : {})}
                /* The site header is an 80px band, so an anchor landing at
                   the very top of the viewport would put the card under
                   it. scroll-mt-24 is 96px: the band plus a little air.

                   col-start-2 pins an afternoon to the second column on
                   the one day whose morning has no slot at all, so it does
                   not slide into the morning's position. Harmless on every
                   other day, where it is already the second child. */
                className={`scroll-mt-24 ${slot.part === "afternoon" ? "col-start-2" : ""}`}
              >
                {slot.recording ? (
                  <PostedSlot
                    recording={slot.recording}
                    partLabel={slot.partLabel}
                    dayLabel={entry.dayLabel}
                  />
                ) : (
                  <PendingSlot slot={slot} />
                )}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
