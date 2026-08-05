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
      // Three states, not one. Hover is the tint plus a 1px lift; active
      // puts the lift back and deepens the ring, so a press is confirmed
      // before the next page paints; focus-visible is the accent outline.
      // The ring moving is what makes the change legible without colour —
      // the tint alone is a two-percent shift a lot of screens will not
      // show at all.
      className="flex h-full flex-col items-start gap-4 rounded-card bg-surface p-5 ring-1 ring-line transition-[background-color,box-shadow,translate] duration-fast ease-out-soft hover:-translate-y-px hover:bg-surface-muted hover:ring-ink-muted/30 active:translate-y-0 active:ring-2 active:ring-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
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
      {/* Pushed to the bottom edge so the line sits level across the row
          however long the names above it run.

          A zero count says "to be confirmed" rather than rendering
          nothing. Four of the eight speakers are in that state today —
          they were appointed after the programme was transcribed — and a
          card that simply stops after the role reads as a card that is
          still loading, or as a data slip. The whole point of saying it
          is that it is neither. Sentence case rather than the uppercase
          the count takes, so the two are told apart at a glance. */}
      <p className="mt-auto pt-1 text-xs tracking-wide text-ink-muted">
        {sessionCount > 0 ? (
          <span className="uppercase">
            {sessionCount} {sessionCount === 1 ? "session" : "sessions"}
          </span>
        ) : (
          "Sessions to be confirmed"
        )}
      </p>
    </Link>
  );
}
