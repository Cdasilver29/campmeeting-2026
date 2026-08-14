"use client";

import { useEffect, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { sessionPath } from "../lib/url";

/**
 * ── SEND ONE SESSION ─────────────────────────────────────────────────
 *
 * "Come to this." Nothing else on this site could do that: the saved
 * schedule could be shared whole and a day could be linked, but the unit
 * a person actually recommends to a WhatsApp group is one session.
 *
 * ── THE SAME THREE STEPS AS ShareSchedule, AND ON PURPOSE ────────────
 *
 * The share sheet first, because on a phone it reaches WhatsApp, which is
 * how this will actually be sent. Then the clipboard. Then the link
 * itself in text, because a control that says it shared something and did
 * not is worse than one that hands you the link. A dismissed share sheet
 * is not a failure and must not fall through to copying something the
 * reader just declined to send — that is why the catch resets to idle
 * rather than continuing.
 *
 * Not extracted into a hook shared with ShareSchedule. The two differ in
 * what they share, what they say afterwards and what disables them, and
 * the common part is fifteen lines of branching that would need three
 * parameters to be reused. Two short components beat one with three
 * flags in it, which is the same call SheetNavLink and NavLink make.
 */
export function ShareSession({
  dayId,
  sessionId,
  title,
  className,
}: {
  dayId: string;
  sessionId: string;
  title: string;
  className?: string;
}) {
  const [result, setResult] = useState<"idle" | "shared" | "copied" | "failed">(
    "idle",
  );

  /*
   * ── THE CONFIRMATION HAS TO BE SEEN, NOT ONLY ANNOUNCED ────────────
   *
   * The share sheet is its own confirmation: it opens, the reader picks
   * WhatsApp, they watch it happen. The clipboard path is the one with
   * nothing to see, and it is the desktop path — press a button, and if
   * nothing changes you press it again.
   *
   * So the glyph itself becomes a tick for two and a half seconds. Same
   * box, same 16px, so nothing moves and this cannot contribute to CLS on
   * a page of 33 of these. The live region below says it in words at the
   * same time; neither is doing the job alone.
   */
  useEffect(() => {
    if (result === "idle") return;
    const timer = setTimeout(() => setResult("idle"), 2500);
    return () => clearTimeout(timer);
  }, [result]);

  const confirmed = result === "shared" || result === "copied";

  async function share() {
    const url = `${window.location.origin}${sessionPath(dayId, sessionId)}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        setResult("shared");
        return;
      } catch {
        setResult("idle");
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setResult("copied");
    } catch {
      setResult("failed");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={share}
        className={cn(
          // Sized and hit-targeted exactly like the bookmark it sits
          // beside: 24px painted, 44px hit through a pseudo-element, so
          // the pair reads as one control cluster and neither sets the
          // row height. See the note in bookmark-toggle.tsx.
          "group/share relative inline-flex size-6 shrink-0 items-center justify-center rounded-control text-ink-muted/70 transition-colors duration-fast hover:bg-surface-muted hover:text-ink group-hover/entry:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
          "before:absolute before:-inset-2.5 before:content-['']",
          confirmed && "text-primary",
          className,
        )}
      >
        {confirmed ? (
          <Check aria-hidden className="size-4" />
        ) : (
          <Share2
            aria-hidden
            className="size-4 transition-transform duration-fast ease-out-soft group-active/share:scale-90"
          />
        )}
        <span className="sr-only">Share {title}</span>
      </button>

      {/*
        The confirmation, announced rather than drawn as a toast. The
        button's own label does not change and a copy that landed is
        otherwise invisible.

        Always in the DOM — a live region added at the same moment as its
        first message is announced unreliably — and `empty:hidden` so an
        empty one costs no line in the rail it sits in. It is sr-only for
        the same reason the control is 24px: this appears on every row of
        a day page, and a visible line of text under one of 33 rows would
        move the 32 below it.
      */}
      <span role="status" className="sr-only empty:hidden">
        {result === "shared" ? `${title} shared.` : null}
        {result === "copied" ? `Link to ${title} copied.` : null}
        {result === "failed"
          ? `Could not copy the link. Open the session and copy the address instead.`
          : null}
      </span>
    </>
  );
}
