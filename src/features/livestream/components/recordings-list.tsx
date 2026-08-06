import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { INLINE_LINK } from "@/lib/link-styles";
import { watchUrl } from "../config";
import { resolvedRecordings } from "../lib/recordings";

/**
 * The curated recordings, newest first.
 *
 * A server component with no state and no clock. The list is a constant
 * decided at build time, so this is markup — which matters, because the
 * page it sits on is the one a phone on campground signal opens to catch
 * up on a meeting it missed.
 *
 * TWO LINKS PER ROW, and they are two different destinations on purpose.
 * The video is the thing being offered, so it takes the row's title. The
 * programme day beside it is what the recording is OF: someone catching up
 * on Tuesday morning wants to know what else was in that morning, and that
 * page already exists and already works offline. Linking only to YouTube
 * would make this page a list of eight URLs that the channel already is.
 *
 * The day link is a `Link` and the video an `<a>` with target="_blank",
 * which is the same split the rest of the site uses: internal navigation
 * is prefetched and stays in the app, and a YouTube URL leaves it.
 */
export function RecordingsList() {
  return (
    <ol className="flex flex-col divide-y divide-line border-y border-line">
      {resolvedRecordings.map((r) => (
        <li
          key={`${r.dayId}-${r.videoId}`}
          className="flex flex-col gap-0.5 py-3"
        >
          <a
            href={watchUrl(r.videoId)}
            target="_blank"
            rel="noreferrer"
            className={`gap-1.5 font-medium text-primary ${INLINE_LINK}`}
          >
            {r.label}
            <ExternalLink aria-hidden className="size-3.5 shrink-0" />
            {/* The day is in the accessible name as well as beside the
                link, because a screen reader reading the links on this
                page out of context otherwise hears "Divine Service" eight
                times. */}
            <span className="sr-only">, {r.dayLabel}, watch on YouTube</span>
          </a>
          <p className="text-sm text-ink-muted">
            {r.dayLabel}
            {" · "}
            <Link href={r.dayHref} className="underline underline-offset-4">
              See that day&apos;s programme
            </Link>
          </p>
        </li>
      ))}
    </ol>
  );
}
