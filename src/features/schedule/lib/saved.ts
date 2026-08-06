/**
 * Everything that knows the shape of a saved schedule: the one storage
 * key, what is written into it, and the two ways a saved set travels
 * (a share link, and the pre-paint script that decides whether the
 * discovery hint is still owed).
 *
 * Deliberately free of React and of "use client", because three
 * different kinds of caller need it: the bookmarks provider, the share
 * control, and a server component that has to emit the hint script as a
 * string into the HTML.
 */

/**
 * Still one key, and still the only key this site writes.
 *
 * The value used to be a bare array of ids. It is now an object, because
 * the hint's dismissal has to persist and CLAUDE.md allows exactly one
 * localStorage entry: "alongside the bookmarks" means inside the same
 * value, not in a second key beside it. Arrays are still read, so a
 * device that saved sessions before this change keeps them.
 */
export const STORAGE_KEY = "cm2026:bookmarks";

/** The attribute the pre-paint script sets on <html>. See globals.css. */
export const HINT_ATTRIBUTE = "data-saved-hint";

/** Query parameter carrying a shared selection: /schedule?view=mine&saved=… */
export const SHARE_PARAM = "saved";

/**
 * Ids are lowercase, digits and hyphens ({dayId}-{slug}), so a dot is
 * free as a separator: it never appears inside an id and no URL encoder
 * touches it. Comma would be percent-encoded by some clients and turn a
 * readable link into %2C soup.
 */
const SHARE_SEPARATOR = ".";

export interface SavedState {
  ids: string[];
  /** True once the reader has dismissed the discovery hint. */
  hintDismissed: boolean;
}

export const emptySavedState: SavedState = { ids: [], hintDismissed: false };

function stringsOf(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

/**
 * The stored JSON back into state, tolerating both shapes and any
 * garbage. Anything unrecognised reads as "nothing saved" rather than
 * throwing: the next write replaces it.
 */
export function parseSavedState(raw: string | null): SavedState {
  if (!raw) return emptySavedState;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptySavedState;
  }

  // The pre-object format: a bare array of ids, written by every build
  // before the hint existed.
  if (Array.isArray(parsed)) {
    return { ids: stringsOf(parsed), hintDismissed: false };
  }

  if (!parsed || typeof parsed !== "object") return emptySavedState;

  const record = parsed as Record<string, unknown>;
  return {
    ids: stringsOf(record.ids),
    hintDismissed: record.hintDismissed === true,
  };
}

export function serializeSavedState(state: SavedState): string {
  return JSON.stringify(state);
}

/**
 * Saved ids into the value of `?saved=`. Sorted, so two devices holding
 * the same selection produce the same link and a link is comparable by
 * eye; a Set has no order worth preserving anyway.
 */
export function encodeSharedIds(ids: Iterable<string>): string {
  return [...ids].sort().join(SHARE_SEPARATOR);
}

/**
 * The parameter back into ids. Nothing is validated against the
 * programme here — the caller does that against its own `knownIds`, the
 * same pruning a stale stored id already goes through — so this only has
 * to split and discard empties.
 */
export function decodeSharedIds(value: string | null): string[] {
  if (!value) return [];
  return value.split(SHARE_SEPARATOR).filter(Boolean);
}

/**
 * The share link for a selection, absolute so it can be pasted into a
 * message. `view=mine` first, so the recipient lands on My schedule
 * rather than on the whole programme with an invisible import.
 */
export function shareUrl(origin: string, ids: Iterable<string>): string {
  return `${origin}/schedule?view=mine&${SHARE_PARAM}=${encodeSharedIds(ids)}`;
}

/**
 * The pre-paint hint decision, as a string for dangerouslySetInnerHTML.
 *
 * The hint is server-rendered visible, because the static HTML cannot
 * know whether this device has seen it. Correcting that on mount would
 * remove a line of text after first paint, which is a layout shift on
 * the one page whose CLS is measured. So it is corrected during parse
 * instead: this reads the same key the provider does and, if the hint is
 * owed to nobody, sets an attribute on <html> that a rule in globals.css
 * hides the hint by. Same technique as the theme and the event phase.
 *
 * Two things count as "seen": an explicit dismissal, and having saved
 * anything at all. Someone with a saved session has already found the
 * bookmark, and a hint explaining a control they are using is noise.
 *
 * The attribute goes on the document element rather than on the hint
 * itself, so React never renders the node it is written to and hydration
 * has nothing to disagree with. Wrapped in try/catch because reading
 * localStorage throws outright in some private modes: the failure mode
 * is a hint shown to someone who has seen it, not a broken page.
 */
export function savedHintScript(): string {
  return `(function(){try{
var r=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});if(!r)return;
var v=JSON.parse(r);
var seen=Array.isArray(v)?v.length>0:!!v&&(v.hintDismissed===true||(Array.isArray(v.ids)&&v.ids.length>0));
if(seen)document.documentElement.setAttribute(${JSON.stringify(HINT_ATTRIBUTE)},"seen");
}catch(_){}})();`;
}
