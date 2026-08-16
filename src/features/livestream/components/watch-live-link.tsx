import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { LIVESTREAM_PATH } from "../lib/stream-link";

/**
 * The home hero's "Watch live" button. Always /livestream.
 *
 * ── IT USED TO CARRY A HASH, AND IT NO LONGER CAN ────────────────────
 *
 * This was a client component that read the viewer's clock and appended
 * an anchor, so the page landed on the half of the day they were in. Two
 * things ended that. The anchor was only ever added in the `after` phase,
 * and that branch was unreachable: "after" starts the day the programme
 * ends, by which point the clock is never on a programme day, so the
 * lookup could not hit. And the per-day boundary it used to pick morning
 * from afternoon was removed along with the live-id system it existed to
 * serve.
 *
 * So the href is a constant, which means this needs no clock, no poll and
 * no "use client" — the button is server-rendered markup like the hero
 * around it. The live player is at the top of /livestream either way,
 * which is what the button is for.
 */
export function WatchLiveLink({ className }: { className?: string }) {
  return (
    <Link href={LIVESTREAM_PATH} className={className}>
      <PlayCircle aria-hidden className="size-4" />
      Watch live
    </Link>
  );
}
