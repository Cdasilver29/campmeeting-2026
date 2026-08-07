"use client";

import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookmarks } from "../bookmarks";

/**
 * Save a session to My schedule.
 *
 * Renders the unsaved state on the server, because localStorage is not
 * readable there, and picks up the real state after mount. The markup is
 * identical either way — only aria-pressed, the fill and the label
 * change — so hydration matches and nothing moves when the saved state
 * arrives.
 */
export function BookmarkToggle({
  sessionId,
  title,
}: {
  sessionId: string;
  title: string;
}) {
  const { has, toggle } = useBookmarks();
  const saved = has(sessionId);

  return (
    <button
      type="button"
      onClick={() => toggle(sessionId)}
      aria-pressed={saved}
      className={cn(
        "group/bookmark relative inline-flex size-6 shrink-0 items-center justify-center rounded-control transition-colors duration-fast hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
        // 24px painted, 44px hit. A 44px control on every one of 238 rows
        // would set the row height; a pseudo-element costs no layout and
        // no DOM.
        "before:absolute before:-inset-2.5 before:content-['']",
        saved
          ? "text-bookmark"
          : "text-ink-muted/70 group-hover/entry:text-ink-muted hover:text-ink",
      )}
    >
      {/*
        The press confirmation. A bookmark that only changes on the next
        paint after a network-free state update still reads as "did that
        work?" on a phone, so the icon takes a visible step down on
        :active and the fill lands under the finger.

        A CSS :active transform, not a JS animation. It exists only while
        the control is held, so there is no animation to interrupt, nothing
        left holding a transform afterwards, and nothing for reduced motion
        to have to switch off — the global rule already collapses the
        150ms transition to an instant state change there, which is still
        confirmation, just without the travel.
      */}
      <Bookmark
        aria-hidden
        className={cn(
          // group-active on the button, not :active on the svg. The hit
          // area is a pseudo-element well outside the icon, so a press
          // that lands on it never makes the icon itself the active
          // element and a bare active: variant would silently do nothing
          // for most of the target.
          "size-4 transition-transform duration-fast ease-out-soft group-active/bookmark:scale-90",
          saved && "fill-bookmark",
        )}
      />
      <span className="sr-only">
        {saved
          ? `Remove ${title} from my schedule`
          : `Save ${title} to my schedule`}
      </span>
    </button>
  );
}
