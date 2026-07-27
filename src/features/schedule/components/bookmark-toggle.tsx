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
        "inline-flex size-6 shrink-0 items-center justify-center rounded-control transition-colors duration-fast hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
        saved ? "text-bookmark" : "text-ink-muted hover:text-ink",
      )}
    >
      <Bookmark
        aria-hidden
        className={cn("size-4", saved && "fill-bookmark")}
      />
      <span className="sr-only">
        {saved
          ? `Remove ${title} from my schedule`
          : `Save ${title} to my schedule`}
      </span>
    </button>
  );
}
