import Link from "next/link";
import { ministryCopy, type MinistryPageTag } from "../copy";

export function MinistryCard({
  tag,
  count,
}: {
  tag: MinistryPageTag;
  count: number;
}) {
  const copy = ministryCopy[tag];

  return (
    <Link
      href={`/ministries/${tag}`}
      // The same three states as SpeakerCard, deliberately identical: two
      // grids of cards that respond differently to the same gesture is a
      // bug a reader feels without being able to name.
      className="flex h-full flex-col gap-2 rounded-card bg-surface p-6 ring-1 ring-line transition-[background-color,box-shadow,translate] duration-fast ease-out-soft hover:-translate-y-px hover:bg-surface-muted hover:ring-ink-muted/30 active:translate-y-0 active:ring-2 active:ring-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
    >
      <p className="font-display text-lg text-ink">{copy.label}</p>
      <p className="text-sm text-ink-muted">{copy.description}</p>
      <p className="text-xs text-ink-muted">
        {count} {count === 1 ? "entry" : "entries"} in the programme
      </p>
    </Link>
  );
}
