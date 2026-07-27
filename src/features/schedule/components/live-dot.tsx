/**
 * The live indicator dot. Shared by the Today view and the schedule
 * hero so "on now" looks the same wherever it is claimed. Decorative:
 * every use pairs it with the word Live.
 */
export function LiveDot() {
  return (
    <span aria-hidden className="relative flex size-2.5 shrink-0">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-70" />
      <span className="relative inline-flex size-2.5 rounded-full bg-live" />
    </span>
  );
}
