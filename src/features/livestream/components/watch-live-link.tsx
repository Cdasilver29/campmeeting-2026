"use client";

import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { useNow } from "@/features/schedule/use-now";
import { currentStreamHref, LIVESTREAM_PATH } from "../lib/stream-link";

/**
 * The home hero's "Watch live" button.
 *
 * Always /livestream. During the week it carries a hash as well, so the
 * page lands on the half of the day the viewer is in: the morning stream
 * before 13:00 EAT, the afternoon stream after. The live player is still
 * at the top of that page and is still the first thing a viewer sees —
 * this only decides where the page has scrolled to by the time they look
 * past it.
 *
 * ── WHY THIS IS A CLIENT COMPONENT AND THE HERO IS NOT ───────────────
 *
 * The href depends on the viewer's clock and every page here is
 * statically generated, so the build cannot know it. This is the same
 * split now-slot.tsx makes on /livestream: one small piece takes the
 * clock, the band around it stays server-rendered markup.
 *
 * ── AND WHY IT IS NOT THE INLINE-SCRIPT TRICK ────────────────────────
 *
 * The hero's height and the livestream page's phase are both corrected
 * before first paint by an inline script, because getting those wrong for
 * one frame is a layout shift. An href is not: nothing about this button
 * moves or repaints when it changes, so resolving it on mount costs
 * nothing a reader can see. It also could not be done that way — this is
 * a next/link, and the router navigates to the href it was given as a
 * prop, not to whatever a script later wrote into the DOM attribute. A
 * mutated attribute would have changed copy-link and middle-click while
 * leaving an ordinary click going somewhere else.
 *
 * Before mount, and with JavaScript off, the href is plain /livestream.
 * That is the correct destination in its own right; the hash is a
 * refinement on top of a link that already worked.
 *
 * A minute is plenty for the poll. The href changes once a day, at the
 * 13:00 boundary, and being up to a minute late to it is invisible.
 */
export function WatchLiveLink({ className }: { className?: string }) {
  const now = useNow(60_000);
  const href = now ? currentStreamHref(now) : LIVESTREAM_PATH;

  return (
    <Link href={href} className={className}>
      <PlayCircle aria-hidden className="size-4" />
      Watch live
    </Link>
  );
}
