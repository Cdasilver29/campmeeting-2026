"use client";

import Link from "next/link";
import { BookmarkPlus } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookmarks } from "../bookmarks";
import { SCHEDULE_PATH } from "../lib/url";

const linkClasses =
  "inline-flex h-8 items-center rounded-control px-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";

/**
 * The empty My schedule view.
 *
 * Until localStorage has been read there is genuinely nothing to say —
 * the server rendered an empty set because it had to, not because the
 * reader has saved nothing — so this holds a skeleton of the same height
 * rather than claiming the schedule is empty and then contradicting
 * itself a frame later.
 */
export function MyScheduleEmpty({
  otherFiltersActive,
}: {
  otherFiltersActive: boolean;
}) {
  const { ready, count } = useBookmarks();

  if (!ready) return <Skeleton className="h-44 w-full rounded-card" />;

  if (count > 0 && otherFiltersActive) {
    return (
      <EmptyState
        icon={BookmarkPlus}
        title="None of your saved sessions match"
        description={`You have ${count} saved ${count === 1 ? "session" : "sessions"}, but the other filters rule all of them out.`}
        action={
          <Link href={SCHEDULE_PATH} scroll={false} className={linkClasses}>
            Clear filters
          </Link>
        }
      />
    );
  }

  return (
    <EmptyState
      icon={BookmarkPlus}
      title="Your schedule is empty"
      description="Save any session with the bookmark button on its card and it appears here. Saved sessions stay on this device and are not sent anywhere."
      action={
        <Link href={SCHEDULE_PATH} scroll={false} className={linkClasses}>
          Browse the whole programme
        </Link>
      }
    />
  );
}
