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
 * Sixteen slots, always. A day with nothing posted is rendered in place
 * and marked as not yet up, rather than left out, so the page shows the
 * shape of the week filling in and a reader looking for a particular
 * morning gets an answer instead of a gap they have to interpret.
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

export function RecordingsList() {
  return (
    <ol className="flex flex-col gap-(--space-item)">
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

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {entry.slots.map((slot) => (
              <li key={slot.part}>
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
