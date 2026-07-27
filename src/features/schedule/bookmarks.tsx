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

/**
 * Saved sessions.
 *
 * One namespaced key holding one array of session ids, and nothing else
 * in localStorage. Ids are the stable {dayId}-{slug} form, so a saved
 * schedule survives a rebuild of the site; it does not survive a
 * programme rewrite that renames sessions, which is what the pruning
 * below is for.
 */
const STORAGE_KEY = "cm2026:bookmarks";

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
}

/**
 * The default is the unsaved state rather than a thrown error, so a
 * session card rendered outside the provider (the Today view) degrades
 * to "nothing saved" instead of taking the page down.
 */
const BookmarksContext = createContext<BookmarksValue>({
  ids: EMPTY_IDS,
  ready: false,
  persistent: true,
  has: () => false,
  toggle: () => {},
  count: 0,
});

export function useBookmarks(): BookmarksValue {
  return useContext(BookmarksContext);
}

interface StoredBookmarks {
  ids: string[];
  /** False only when the storage API itself refused, not when the value was junk. */
  available: boolean;
}

function readStored(): StoredBookmarks {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private browsing, or storage disabled by policy: reading throws.
    return { ids: [], available: false };
  }

  if (!raw) return { ids: [], available: true };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { ids: [], available: true };
    return {
      ids: parsed.filter((value): value is string => typeof value === "string"),
      available: true,
    };
  } catch {
    // Storage works, its contents do not. Start clean; the next write
    // replaces the corrupt value.
    return { ids: [], available: true };
  }
}

function writeStored(ids: string[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    return true;
  } catch {
    return false;
  }
}

export function BookmarksProvider({ children }: { children: ReactNode }) {
  // Empty on the first render, on the server and on the client alike.
  // localStorage is not readable during SSR, so the saved state cannot
  // be part of the initial render without the two disagreeing; it is
  // read in an effect below and reconciled after mount instead.
  const [ids, setIds] = useState<ReadonlySet<string>>(EMPTY_IDS);
  const [ready, setReady] = useState(false);
  const [persistent, setPersistent] = useState(true);

  useEffect(() => {
    const stored = readStored();
    // Ids the programme no longer has are dropped here, before anything
    // renders, so a stale bookmark is silently forgotten rather than
    // drawn as a card with no session behind it.
    setIds(new Set(stored.ids.filter((id) => knownIds.has(id))));
    setPersistent(stored.available);
    setReady(true);
  }, []);

  // The single write path. It also rewrites the pruned list on the first
  // pass, so a set that lost ids to a programme update is cleaned up on
  // disk rather than re-filtered on every visit. Gated on `ready` so the
  // empty initial state never overwrites what is stored.
  useEffect(() => {
    if (!ready) return;
    setPersistent(writeStored([...ids]));
  }, [ids, ready]);

  const toggle = useCallback((sessionId: string) => {
    if (!knownIds.has(sessionId)) return;
    setIds((current) => {
      const next = new Set(current);
      if (!next.delete(sessionId)) next.add(sessionId);
      return next;
    });
  }, []);

  const value = useMemo<BookmarksValue>(
    () => ({
      ids,
      ready,
      persistent,
      has: (sessionId: string) => ids.has(sessionId),
      toggle,
      count: ids.size,
    }),
    [ids, ready, persistent, toggle],
  );

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  );
}
