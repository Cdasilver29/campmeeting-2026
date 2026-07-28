"use client";

import { TriangleAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Announcement } from "@/data";
import { useNow } from "@/features/schedule/use-now";
import { cn } from "@/lib/utils";
import { relativeTime } from "../lib/relative-time";

/**
 * Urgent is marked with --color-featured, but never by colour alone: a
 * label and an icon carry the same information, so the distinction
 * survives greyscale printing and colour-blindness alike.
 */
function AnnouncementItem({
  announcement,
  now,
}: {
  announcement: Announcement;
  now: Date;
}) {
  const urgent = announcement.priority === "urgent";

  return (
    <li>
      <article
        className={cn(
          "flex flex-col gap-2 rounded-card p-4 ring-1",
          urgent
            ? "bg-featured/10 ring-featured/40"
            : "bg-surface ring-line",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <div className="flex items-start gap-2">
            {urgent ? (
              <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-4xl bg-featured px-2 py-0.5 text-xs font-medium text-white">
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

  if (!now) return <AnnouncementsSkeleton count={announcements.length} />;

  return (
    <ul className="flex flex-col gap-3">
      {announcements.map((announcement) => (
        <AnnouncementItem key={announcement.id} announcement={announcement} now={now} />
      ))}
    </ul>
  );
}
