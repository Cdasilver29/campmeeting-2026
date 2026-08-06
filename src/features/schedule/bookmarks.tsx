"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { allSessions } from "@/data";
import {
  HINT_ATTRIBUTE,
  SHARE_PARAM,
  STORAGE_KEY,
  decodeSharedIds,
  emptySavedState,
  parseSavedState,
  serializeSavedState,
  type SavedState,
} from "./lib/saved";

/**
 * Saved sessions.
 *
 * One namespaced key holding the saved ids and the one flag that has to
 * travel with them, and nothing else in localStorage. Ids are the stable
 * {dayId}-{slug} form, so a saved schedule survives a rebuild of the
 * site; it does not survive a programme rewrite that renames sessions,
 * which is what the pruning below is for. The shape of the stored value
 * lives in lib/saved.ts, because the pre-paint hint script has to read
 * the same bytes without loading React.
 */

/** Ids the current programme actually has. Anything else is stale. */
const knownIds = new Set(allSessions.map((session) => session.id));

const EMPTY_IDS: ReadonlySet<string> = new Set();

export interface BookmarksValue {
  ids: ReadonlySet<string>;
  /** False until localStorage has been read, which cannot happen on the server. */
  ready: boolean;
  /** False when localStorage is unreadable or unwritable: saves last the session only. */
  persistent: boolean;
  has: (sessionId: string) => boolean;
  toggle: (sessionId: string) => void;
  count: number;
  /** True once the discovery hint has been dismissed on this device. */
  hintDismissed: boolean;
  dismissHint: () => void;
  /**
   * How many sessions this page load took from a share link, for the
   * one line that says so. Zero on an ordinary visit.
   */
  importedCount: number;
}

/**
 * The default is the unsaved state rather than a thrown error, so a
 * session card rendered outside the provider degrades to "nothing saved"
 * instead of taking the page down.
 */
const BookmarksContext = createContext<BookmarksValue>({
  ids: EMPTY_IDS,
  ready: false,
  persistent: true,
  has: () => false,
  toggle: () => {},
  count: 0,
  hintDismissed: false,
  dismissHint: () => {},
  importedCount: 0,
});

export function useBookmarks(): BookmarksValue {
  return useContext(BookmarksContext);
}

interface StoredBookmarks {
  state: SavedState;
  /** False only when the storage API itself refused, not when the value was junk. */
  available: boolean;
}

function readStored(): StoredBookmarks {
  try {
    return { state: parseSavedState(window.localStorage.getItem(STORAGE_KEY)), available: true };
  } catch {
    // Private browsing, or storage disabled by policy: reading throws.
    return { state: emptySavedState, available: false };
  }
}

function writeStored(state: SavedState): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeSavedState(state));
    return true;
  } catch {
    return false;
  }
}

/**
 * A selection arriving in the URL, and the same URL without it.
 *
 * Read from window.location rather than through useSearchParams: this
 * runs once, in an effect, on the client only, and useSearchParams would
 * opt the whole provider subtree out of the static render for a
 * parameter that is absent on every ordinary visit.
 *
 * The parameter is stripped with replaceState rather than a router
 * navigation, so the link a reader shares onward is their own view and
 * a reload cannot re-import a selection they have since edited.
 */
function takeSharedIds(): string[] {
  const url = new URL(window.location.href);
  const shared = decodeSharedIds(url.searchParams.get(SHARE_PARAM));
  if (shared.length === 0) return [];

  url.searchParams.delete(SHARE_PARAM);
  window.history.replaceState(window.history.state, "", url.toString());

  // Ids the programme no longer has are dropped here, exactly as a stale
  // stored id is, so a link shared before a programme update restores
  // the part of the selection that still exists.
  return shared.filter((id) => knownIds.has(id));
}

export function BookmarksProvider({ children }: { children: ReactNode }) {
  // Empty on the first render, on the server and on the client alike.
  // localStorage is not readable during SSR, so the saved state cannot
  // be part of the initial render without the two disagreeing; it is
  // read in an effect below and reconciled after mount instead.
  const [ids, setIds] = useState<ReadonlySet<string>>(EMPTY_IDS);
  const [ready, setReady] = useState(false);
  const [persistent, setPersistent] = useState(true);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  useEffect(() => {
    const stored = readStored();
    const shared = takeSharedIds();

    // Ids the programme no longer has are dropped here, before anything
    // renders, so a stale bookmark is silently forgotten rather than
    // drawn as a card with no session behind it.
    const next = new Set(stored.state.ids.filter((id) => knownIds.has(id)));

    // A shared selection is merged, never substituted. Union is the only
    // non-destructive reading of "restores that selection": on a device
    // with nothing saved it restores exactly the link's contents, which
    // is the recovery case, and on a device that already has a plan it
    // adds a family member's sessions instead of deleting the reader's.
    let added = 0;
    for (const id of shared) {
      if (!next.has(id)) added += 1;
      next.add(id);
    }

    setIds(next);
    setImportedCount(added);
    setHintDismissed(stored.state.hintDismissed);
    setPersistent(stored.available);
    setReady(true);
  }, []);

  // The single write path. It also rewrites the pruned list on the first
  // pass, so a set that lost ids to a programme update is cleaned up on
  // disk rather than re-filtered on every visit. Gated on `ready` so the
  // empty initial state never overwrites what is stored.
  useEffect(() => {
    if (!ready) return;
    setPersistent(writeStored({ ids: [...ids], hintDismissed }));
  }, [ids, hintDismissed, ready]);

  // The same attribute the pre-paint script sets, kept in step after
  // mount. Saving a first session retires the hint along with dismissing
  // it: the reader has just done the thing it was explaining. Both paths
  // are inside 500ms of a click, so the line disappearing is excluded
  // from CLS the way any input-driven change is.
  useEffect(() => {
    if (!ready) return;
    if (hintDismissed || ids.size > 0) {
      document.documentElement.setAttribute(HINT_ATTRIBUTE, "seen");
    }
  }, [ready, hintDismissed, ids]);

  const toggle = useCallback((sessionId: string) => {
    if (!knownIds.has(sessionId)) return;
    setIds((current) => {
      const next = new Set(current);
      if (!next.delete(sessionId)) next.add(sessionId);
      return next;
    });
  }, []);

  const dismissHint = useCallback(() => setHintDismissed(true), []);

  const value = useMemo<BookmarksValue>(
    () => ({
      ids,
      ready,
      persistent,
      has: (sessionId: string) => ids.has(sessionId),
      toggle,
      count: ids.size,
      hintDismissed,
      dismissHint,
      importedCount,
    }),
    [ids, ready, persistent, toggle, hintDismissed, dismissHint, importedCount],
  );

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  );
}
