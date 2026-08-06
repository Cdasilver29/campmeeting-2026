"use client";

import Link from "next/link";
import { BookmarkPlus } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ACTION_LINK } from "@/lib/link-styles";
import { useBookmarks } from "../bookmarks";
import { SCHEDULE_PATH } from "../lib/url";

/**
 * The explanation of what My schedule is, shown when nothing is saved.
 *
 * This is the one screen a curious tap lands on, so it explains the
 * feature rather than reporting that a list is empty. Three things, in
 * the order someone needs them: what My schedule is, the exact gesture
 * that builds it, and what becomes of it afterwards. Then a way back to
 * the programme, because a reader who now understands the feature has
 * nowhere to use it from here.
 */
function NothingSaved() {
  return (
    <EmptyState
      icon={BookmarkPlus}
      title="Build your own programme"
      description="My schedule is the part of the week you pick out for yourself. Press the bookmark beside any session in the programme and it is kept here, in the order the week runs. The list stays on this device, works offline on the campground, and is never sent anywhere."
      action={
        <Link href={SCHEDULE_PATH} scroll={false} className={ACTION_LINK}>
          Browse the whole programme
        </Link>
      }
    />
  );
}

/**
 * The placeholder, which is the real empty state made invisible with a
 * skeleton laid over it in the same grid cell.
 *
 * A fixed height was a guess and it was wrong: `h-44` reserved 176px for
 * a box that measures 406, 366, 306 and 294px at 360, 390, 768 and 1024,
 * so every visit to an empty My schedule paid a 120 to 230px shift when
 * localStorage came back. The copy above made that worse, since it is
 * longer than what it replaced. Reserving with the box itself is exact at
 * every width by construction and cannot drift when the wording changes.
 *
 * `invisible` is visibility:hidden, so the sentences underneath are out
 * of the accessibility tree as well as unpainted: nothing here claims the
 * schedule is empty before localStorage has been read.
 */
function EmptyPlaceholder() {
  return (
    <div className="grid">
      <div aria-hidden className="invisible col-start-1 row-start-1">
        <NothingSaved />
      </div>
      <Skeleton className="col-start-1 row-start-1 size-full rounded-card" />
    </div>
  );
}

/**
 * The empty My schedule view.
 *
 * Until localStorage has been read there is genuinely nothing to say —
 * the server rendered an empty set because it had to, not because the
 * reader has saved nothing — so this holds the placeholder rather than
 * claiming the schedule is empty and then contradicting itself a frame
 * later.
 */
export function MyScheduleEmpty({
  otherFiltersActive,
  clearHref,
}: {
  otherFiltersActive: boolean;
  /** Where "Clear filters" goes: this page without its filters. */
  clearHref: string;
}) {
  const { ready, count } = useBookmarks();

  if (!ready) return <EmptyPlaceholder />;

  if (count > 0 && otherFiltersActive) {
    return (
      <EmptyState
        icon={BookmarkPlus}
        title="None of your saved sessions match"
        description={`You have ${count} saved ${count === 1 ? "session" : "sessions"}, but the other filters rule all of them out.`}
        action={
          <Link href={clearHref} scroll={false} className={ACTION_LINK}>
            Clear filters
          </Link>
        }
      />
    );
  }

  return <NothingSaved />;
}
