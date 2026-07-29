import Link from "next/link";
import type { Speaker } from "@/data";
import { speakerLabel } from "@/features/schedule/lib/presenters";
import { SpeakerAvatar } from "./speaker-avatar";

export function SpeakerCard({
  speaker,
  sessionCount,
}: {
  speaker: Speaker;
  sessionCount: number;
}) {
  return (
    <Link
      href={`/speakers/${speaker.id}`}
      // Hover is a surface tint and a 1px lift, both on --duration-fast
      // and --ease-out-soft. No shadow: CLAUDE.md rules out the heavy
      // drop-shadow card hover, and the ring already reads as an edge.
      className="flex h-full flex-col items-center gap-3 rounded-card bg-surface p-6 text-center ring-1 ring-line transition-[background-color,translate] duration-fast ease-out-soft hover:-translate-y-px hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
    >
      <SpeakerAvatar speaker={speaker} size="lg" />
      <div>
        <p className="font-display text-lg text-ink">{speakerLabel(speaker)}</p>
        {speaker.role ? (
          <p className="text-sm text-ink-muted">{speaker.role}</p>
        ) : null}
      </div>
      {sessionCount > 0 ? (
        <p className="text-xs text-ink-muted">
          {sessionCount} {sessionCount === 1 ? "session" : "sessions"}
        </p>
      ) : null}
    </Link>
  );
}
