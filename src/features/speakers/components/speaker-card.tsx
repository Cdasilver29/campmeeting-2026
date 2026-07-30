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
      // Left-aligned, not centred. Centring a large monogram over a name
      // makes the absent photograph the subject of the card; ranging the
      // card left makes the name the subject and lets the avatar sit
      // beside it as one element among several. It also gives four cards
      // a shared left edge, which is what makes the row read as a grid.
      className="flex h-full flex-col items-start gap-4 rounded-card bg-surface p-5 ring-1 ring-line transition-[background-color,translate] duration-fast ease-out-soft hover:-translate-y-px hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
    >
      <SpeakerAvatar speaker={speaker} size="lg" />
      <div className="flex flex-col gap-1">
        <p className="font-display text-lg leading-tight text-ink">
          {speakerLabel(speaker)}
        </p>
        {speaker.role ? (
          <p className="text-sm text-ink-muted">{speaker.role}</p>
        ) : null}
      </div>
      {sessionCount > 0 ? (
        // Pushed to the bottom edge so the count sits on one line across
        // the row however long the names above it run.
        <p className="mt-auto pt-1 text-xs tracking-wide text-ink-muted uppercase">
          {sessionCount} {sessionCount === 1 ? "session" : "sessions"}
        </p>
      ) : null}
    </Link>
  );
}
