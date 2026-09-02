import { ExternalLink, Play, VideoOff } from "lucide-react";
import type { ArchiveVideo } from "@/data/archive";
import {
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH,
  thumbnailUrl,
  watchUrl,
} from "../config";
import { speakerLabel, whenLabel } from "../lib/entries";

/**
 * One recording, as a card.
 *
 * The shape is the one /livestream's archive used before this feature
 * took the archive over — a 16:9 frame flush to the top, a padded body
 * under it, one ring around the whole — so a card here and a card
 * anywhere else on the site are the same object. Posted and unavailable
 * are two STATES of that object rather than two different objects, which
 * is what keeps a theme section reading as a set.
 *
 * ── THE THUMBNAILS ARE THIRD-PARTY AND STAY THAT WAY ─────────────────
 *
 * A plain <img> pointing at img.youtube.com. See the note on
 * `thumbnailUrl` in ../config.ts: next/image would re-serve these from
 * this site's own origin, where the service worker would cache them, and
 * the whole point is that third-party bytes never enter the offline
 * store.
 *
 * `loading="lazy"` and `fetchPriority="low"` together, not either alone.
 * On /archive the first row is on screen at 1440 and lazy does not defer
 * an in-viewport image, so without the priority hint these would compete
 * with the page's own LCP. On the home page the showcase sits below the
 * hero, whose photograph IS the LCP element and must not be queued behind
 * fourteen thumbnails.
 *
 * `width` and `height` are the file's real 480x360 and the frame carries
 * its own aspect-ratio, so nothing moves as they arrive.
 *
 * `referrerPolicy="no-referrer"` sends no page URL to YouTube with the
 * image request.
 *
 * ── CONTRAST ─────────────────────────────────────────────────────────
 *
 * Title in `primary` on `surface-muted`: 10.86:1 light, 7.06:1 dark. The
 * meta lines in `ink-muted` on the same ground: 5.96:1 light, 10.49:1
 * dark. The part chip is white on Emperor, 11.59:1 in both themes —
 * a raw brand token rather than a step of the accent scale, because the
 * accent scale flips with the theme and this carries white type over an
 * unknown photograph. All asserted in tools/perf/contrast.mjs.
 */
const CARD = "flex h-full flex-col overflow-hidden rounded-card";
const FRAME = "relative aspect-video w-full overflow-hidden bg-surface-muted";
const CHIP =
  "absolute left-2 top-2 rounded-control px-2 py-0.5 text-xs font-medium";

/** The title a reader is choosing between, and the slot label above it. */
function CardText({ video }: { video: ArchiveVideo }) {
  return (
    <>
      {/* The slot name only where there is a distinct title under it.
          Where the document gave one string, that string IS the title and
          a label repeating it would be the same words twice. */}
      {video.subtitle ? (
        <span className="text-xs text-ink-muted">{video.title}</span>
      ) : null}
      <span className="text-sm font-medium text-primary underline-offset-4 group-hover/card:underline">
        {video.subtitle ?? video.title}
      </span>
      <span className="text-xs text-ink-muted">{speakerLabel(video)}</span>
      <span className="text-xs text-ink-muted">{whenLabel(video)}</span>
    </>
  );
}

export function VideoCard({ video }: { video: ArchiveVideo }) {
  /* No recording published. Not dropped and not given a dead link: the
     card states which of "not posted" and "never recorded" this is, in
     the same dashed treatment /gallery and /livestream use for a thing
     that has not arrived. ink-muted on the 50% muted ground: 6.17:1
     light, 10.79:1 dark. */
  if (!video.videoId) {
    return (
      <div
        className={`${CARD} border border-dashed border-line bg-surface-muted/50`}
      >
        <div className={`${FRAME} flex items-center justify-center bg-transparent`}>
          <VideoOff aria-hidden className="size-6 text-ink-muted/50" />
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          {video.subtitle ? (
            <span className="text-xs text-ink-muted">{video.title}</span>
          ) : null}
          <span className="text-sm font-medium text-ink">
            {video.subtitle ?? video.title}
          </span>
          <span className="text-xs text-ink-muted">{speakerLabel(video)}</span>
          <span className="text-xs text-ink-muted">{whenLabel(video)}</span>
          <span className="mt-1 text-xs text-ink-muted">
            Recording not available
          </span>
        </div>
      </div>
    );
  }

  return (
    <a
      href={watchUrl(video.videoId)}
      target="_blank"
      rel="noreferrer"
      className={`group/card ${CARD} bg-surface-muted ring-1 ring-line transition-[box-shadow] duration-fast ease-out-soft hover:ring-2 hover:ring-accent-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500`}
    >
      <span className={FRAME}>
        {/* eslint-disable-next-line @next/next/no-img-element -- deliberately
            not next/image: the optimizer would re-serve this from our own
            origin, where the service worker would cache it. See the note
            above and on thumbnailUrl in ../config.ts. */}
        <img
          src={thumbnailUrl(video.videoId)}
          alt=""
          width={THUMBNAIL_WIDTH}
          height={THUMBNAIL_HEIGHT}
          loading="lazy"
          fetchPriority="low"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-base ease-out-soft group-hover/card:scale-105"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-emperor/0 transition-colors duration-fast ease-out-soft group-hover/card:bg-emperor/25"
        />
        {video.part ? (
          <span className={`${CHIP} bg-emperor text-white`}>{video.part}</span>
        ) : null}
        {/* A disc at rest, not on hover: most of this congregation reads
            on a phone and never enters a hover state. */}
        <span
          aria-hidden
          className="absolute right-2 bottom-2 flex size-9 items-center justify-center rounded-full bg-emperor text-white ring-2 ring-white/80 transition-transform duration-fast ease-out-soft group-hover/card:scale-110"
        >
          <Play className="ml-0.5 size-4 fill-current" />
        </span>
      </span>
      <span className="flex flex-1 flex-col gap-1 p-3">
        <CardText video={video} />
        <span className="mt-1 inline-flex items-center gap-1 text-xs text-ink-muted">
          Watch on YouTube
          <ExternalLink aria-hidden className="size-3 shrink-0" />
        </span>
      </span>
    </a>
  );
}
