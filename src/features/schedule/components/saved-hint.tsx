"use client";

import { Bookmark } from "lucide-react";
import { useBookmarks } from "../bookmarks";

/**
 * The one line that makes the bookmark discoverable.
 *
 * Bookmarks worked before this and nobody found them: a 16px outline icon
 * in a 238-row timeline explains nothing about what pressing it does. So
 * the page says it once, in words, next to the control it is about.
 *
 * Rendered visible in the static HTML and hidden before first paint by
 * the script in lib/saved.ts when this device has already seen it, so it
 * costs no layout shift in either direction — see the rule in globals.css
 * for why the decision cannot be made on mount. The dismissal is written
 * into the same localStorage value as the saved ids, which is what keeps
 * the site's one-key rule intact.
 *
 * `saved-hint` is what that rule selects, and it has to stay on the
 * outermost element here. A hand-written class rather than a data
 * attribute, because a rule whose key selector is a bare attribute is
 * tested against every element in the document and this page has 4,864
 * of them: measured, that cost 265ms of style, layout and paint. See the
 * rule in globals.css.
 */
export function SavedHint() {
  const { dismissHint } = useBookmarks();

  return (
    <div className="saved-hint flex flex-wrap items-center gap-x-3 gap-y-1 rounded-card border border-line bg-surface-muted px-3 py-1.5 text-sm text-ink-muted">
      <Bookmark aria-hidden className="size-4 shrink-0 text-bookmark" />
      <p className="min-w-0 flex-1">
        Tap the bookmark on any session to build your own schedule. It is kept
        on this device and works offline.
      </p>
      <button
        type="button"
        onClick={dismissHint}
        className="inline-flex min-h-11 w-fit shrink-0 items-center rounded-control px-2 text-sm font-medium text-primary underline-offset-4 transition-colors duration-fast hover:underline active:text-accent-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 lg:h-8 lg:min-h-0"
      >
        Got it
      </button>
    </div>
  );
}
