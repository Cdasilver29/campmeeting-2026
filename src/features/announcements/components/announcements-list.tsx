"use client";

import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Announcement } from "@/data";
import { useNow } from "@/features/schedule/use-now";
import { cn } from "@/lib/utils";
import {
  ANNOUNCEMENT_ANCHOR_PREFIX,
  announcementAnchor,
} from "../lib/anchor";
import { relativeTime } from "../lib/relative-time";

/**
 * Urgent is marked with --color-featured, but never by colour alone: a
 * label and an icon carry the same information, so the distinction
 * survives greyscale printing and colour-blindness alike.
 */
function AnnouncementItem({
  announcement,
  now,
  targeted,
}: {
  announcement: Announcement;
  now: Date;
  /** Arrived here from an inline notice on a session card. */
  targeted: boolean;
}) {
  const urgent = announcement.priority === "urgent";

  return (
    <li
      // The link target for the inline notices on session cards. On the
      // <li> rather than the <article> so scroll-mt can clear the sticky
      // header without touching the card's own box.
      id={announcementAnchor(announcement.id)}
      className="scroll-mt-[calc(var(--spacing-header)+1rem)]"
    >
      <article
        className={cn(
          "flex flex-col gap-2 rounded-card p-4 ring-1",
          urgent
            ? "bg-featured/10 ring-featured/40"
            : "bg-surface ring-line",
          // The one the reader was sent to. A second ring, offset, so it
          // reads as "this one" without recolouring the card and without
          // competing with the urgent treatment — an urgent announcement
          // arrived at from a session card has to still look urgent.
          targeted && "outline-2 outline-offset-2 outline-accent-500",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <div className="flex items-start gap-2">
            {urgent ? (
              // text-featured-foreground, not text-white. In dark mode
              // --color-featured is a LIGHT fill, so white on it measured
              // 2.14:1 and this badge had been failing AA there since dark
              // mode was written. The token inverts with the fill: white in
              // light (9.22:1), the dark surface in dark (7.19:1).
              <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-4xl bg-featured px-2 py-0.5 text-xs font-medium text-featured-foreground">
                <TriangleAlert aria-hidden className="size-3" />
                Urgent
              </span>
            ) : null}
            <h3 className="text-base leading-snug font-medium text-ink">
              {announcement.title}
            </h3>
          </div>
          <time
            dateTime={announcement.publishedAt}
            className="shrink-0 text-xs text-ink-muted"
          >
            {relativeTime(announcement.publishedAt, now)}
          </time>
        </div>
        <p className="text-sm text-ink-muted">{announcement.body}</p>
      </article>
    </li>
  );
}

function AnnouncementsSkeleton({ count }: { count: number }) {
  return (
    <ul className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <Skeleton className="h-24 w-full rounded-card" />
        </li>
      ))}
    </ul>
  );
}

/**
 * The relative timestamps need the reader's clock, which a statically
 * generated page cannot know at build time — same reasoning as the Today
 * view: a skeleton for one frame, then the real list once mounted.
 */
export function AnnouncementsList({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const now = useNow();
  const [targeted, setTargeted] = useState<string | null>(null);

  /*
   * ── THE HASH HAS TO BE HONOURED BY HAND ──────────────────────────
   *
   * The inline notice on a session card links to /announcements#notice-x.
   * The browser resolves that hash at load, and at load this list is
   * still the skeleton above — the anchor does not exist yet, so the
   * reader lands at the top of a notice board and has to find the update
   * they just tapped.
   *
   * So the scroll is done once, after the list is real. `auto` rather
   * than `smooth`: this is completing a navigation the reader already
   * made, not an animation, and prefers-reduced-motion would have to be
   * honoured for the latter.
   *
   * Guarded on `now` rather than run once on mount, because the first
   * render after mount is still the skeleton.
   */
  useEffect(() => {
    if (!now) return;
    const hash = window.location.hash.slice(1);
    if (!hash.startsWith(ANNOUNCEMENT_ANCHOR_PREFIX)) return;
    const element = document.getElementById(hash);
    // A hash naming an announcement that has since been taken down is
    // simply nothing to scroll to, the same way a stale session id on an
    // announcement is nothing to render.
    if (!element) return;
    element.scrollIntoView({ block: "start", behavior: "auto" });
    setTargeted(hash.slice(ANNOUNCEMENT_ANCHOR_PREFIX.length));
  }, [now]);

  if (!now) return <AnnouncementsSkeleton count={announcements.length} />;

  return (
    <ul className="flex flex-col gap-3">
      {announcements.map((announcement) => (
        <AnnouncementItem
          key={announcement.id}
          announcement={announcement}
          now={now}
          targeted={announcement.id === targeted}
        />
      ))}
    </ul>
  );
}
