"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { eventInfo } from "@/data";
import { useBookmarks } from "../bookmarks";
import { shareUrl } from "../lib/saved";

type ShareResult =
  | { kind: "idle" }
  | { kind: "shared" }
  | { kind: "copied" }
  /** Neither API was available or both refused: the link is shown to copy by hand. */
  | { kind: "manual"; url: string };

/**
 * Share the saved selection as a link.
 *
 * There is no backend and there is never going to be one, so the
 * selection travels in the URL itself: /schedule?view=mine&saved=a.b.c,
 * with the same stable {dayId}-{slug} ids the programme already uses in
 * localStorage. That buys two things a static site otherwise cannot
 * have. A reader who clears their browsing data can get their schedule
 * back from a link they sent themselves, and a family can agree on a
 * plan by sending one message.
 *
 * Ids are dropped silently on the way in if the programme no longer has
 * them, exactly as a stale stored id already is, so a link shared before
 * a programme update restores the part of it that still exists rather
 * than failing whole.
 *
 * The share sheet first, because on a phone it reaches WhatsApp, which
 * is how this will actually be sent. Then the clipboard. Then the link
 * itself, in text, because a control that says it shared something and
 * did not is worse than one that hands you the link.
 */
export function ShareSchedule() {
  const { ids, count, ready } = useBookmarks();
  const [result, setResult] = useState<ShareResult>({ kind: "idle" });

  const empty = !ready || count === 0;

  async function share() {
    const url = shareUrl(window.location.origin, ids);

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: `My ${eventInfo.name} schedule`, url });
        setResult({ kind: "shared" });
        return;
      } catch {
        // Includes the reader dismissing the sheet, which is not a
        // failure and must not fall through to copying something they
        // just declined to send.
        setResult({ kind: "idle" });
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setResult({ kind: "copied" });
      return;
    } catch {
      setResult({ kind: "manual", url });
    }
  }

  return (
    <>
      {/*
        Rendered whenever My schedule is the view, and disabled rather
        than absent when nothing is saved. The view comes from the URL, so
        the button is in the static HTML and only its disabled state
        changes when localStorage arrives: appearing after mount would
        have added a third chip to a wrapping row and pushed the whole
        programme down. Disabled, it also tells a reader looking at the
        empty state that the feature is there.
      */}
      <button
        type="button"
        onClick={share}
        disabled={empty}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-control border border-line px-3 text-sm font-medium whitespace-nowrap text-ink-muted transition-colors duration-fast hover:bg-surface-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 disabled:pointer-events-none disabled:opacity-50 lg:h-8 lg:min-h-0"
      >
        <Share2 aria-hidden className="size-4" />
        Share
      </button>

      {/*
        Announced, because the button's own label does not change and a
        copy that landed is otherwise invisible.

        Always in the DOM, because a live region added at the same moment
        as its first message is announced unreliably, and `empty:hidden`
        so that an empty one costs no row in this wrapping flex line.
        basis-full puts the message on its own line when there is one; it
        appears within 500ms of the click that caused it, so the layout
        change is excluded from CLS the way any input-driven one is.
      */}
      <p
        role="status"
        className="basis-full text-xs text-ink-muted empty:hidden"
      >
        {result.kind === "shared" ? "Schedule shared." : null}
        {result.kind === "copied"
          ? "Link copied. Anyone opening it gets these sessions added to their own schedule."
          : null}
        {result.kind === "manual" ? (
          <>
            Copy this link to share your schedule:{" "}
            <span className="break-all text-ink select-all">{result.url}</span>
          </>
        ) : null}
      </p>
    </>
  );
}
