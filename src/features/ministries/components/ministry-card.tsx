import Link from "next/link";
import type { MinistryTag } from "@/data";
import { ministryCopy } from "../copy";

export function MinistryCard({
  tag,
  count,
}: {
  tag: MinistryTag;
  count: number;
}) {
  const copy = ministryCopy[tag];

  return (
    <Link
      href={`/ministries/${tag}`}
      className="flex flex-col gap-2 rounded-card bg-surface p-6 ring-1 ring-line transition-colors duration-fast hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
    >
      <p className="font-display text-lg text-ink">{copy.label}</p>
      <p className="text-sm text-ink-muted">{copy.description}</p>
      <p className="text-xs text-ink-muted">
        {count} {count === 1 ? "entry" : "entries"} in the programme
      </p>
    </Link>
  );
}
