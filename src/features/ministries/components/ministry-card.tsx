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
      // Same hover as SpeakerCard: surface tint plus a 1px lift, on the
      // --duration-fast / --ease-out-soft pair. No shadow.
      className="flex h-full flex-col gap-2 rounded-card bg-surface p-6 ring-1 ring-line transition-[background-color,translate] duration-fast ease-out-soft hover:-translate-y-px hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
    >
      <p className="font-display text-lg text-ink">{copy.label}</p>
      <p className="text-sm text-ink-muted">{copy.description}</p>
      <p className="text-xs text-ink-muted">
        {count} {count === 1 ? "entry" : "entries"} in the programme
      </p>
    </Link>
  );
}
