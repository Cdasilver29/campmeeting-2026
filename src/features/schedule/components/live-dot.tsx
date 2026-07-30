/**
 * The live indicator dot. Shared by the Today view and the schedule
 * hero so "on now" looks the same wherever it is claimed. Decorative:
 * every use pairs it with the word Live.
 *
 * The pulse is on this 10px dot and on nothing else. A card that breathes
 * is ambient animation, which this site does not do; the only thing that
 * has to say "this is happening right now, not an hour ago" is the
 * indicator, so the indicator is the only thing that moves.
 *
 * `live-pulse`, not Tailwind's `animate-ping`. `ping` scales to 2x and
 * drops to zero opacity in one second on a hard ease-out, which at this
 * size reads as a notification badge demanding attention. This reaches
 * 1.6x, never exceeds 0.45 alpha and takes 2.4s, which reads as a
 * heartbeat. Keyframes and the reduced-motion rule that removes it are in
 * globals.css.
 */
export function LiveDot() {
  return (
    <span aria-hidden className="relative flex size-2.5 shrink-0">
      <span className="live-pulse absolute inline-flex size-full rounded-full bg-live" />
      <span className="relative inline-flex size-2.5 rounded-full bg-live" />
    </span>
  );
}
