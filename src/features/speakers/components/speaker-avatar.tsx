import Image from "next/image";
import type { Speaker } from "@/data";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

/**
 * A speaker's photo, or a dignified placeholder when none exists yet —
 * true of all four speakers today (DATA-NOTES.md). Never a broken image:
 * falls back to initials on a flat tile rather than an <img> with no src.
 *
 * The placeholder is meant to look chosen rather than missing, which is
 * three small things. Letter-spacing, because a two-letter monogram set
 * solid reads as a truncation and set open reads as a monogram. An inset
 * hairline, so the disc has an edge and sits in the card the way a
 * photograph would instead of floating as a coloured blob. And the
 * display face, which is the same face the speaker's name is set in
 * directly underneath it.
 */
export function SpeakerAvatar({
  speaker,
  size = "default",
  className,
}: {
  speaker: Pick<Speaker, "name" | "image">;
  size?: "default" | "lg";
  className?: string;
}) {
  const dimension = size === "lg" ? "size-20 text-2xl" : "size-12 text-base";

  if (speaker.image) {
    return (
      <Image
        src={speaker.image}
        alt=""
        width={size === "lg" ? 80 : 48}
        height={size === "lg" ? 80 : 48}
        className={cn(dimension, "shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        dimension,
        "flex shrink-0 items-center justify-center rounded-full bg-secondary font-display tracking-[0.08em] text-secondary-foreground ring-1 ring-secondary-foreground/15 ring-inset select-none",
        className,
      )}
    >
      {initials(speaker.name)}
    </span>
  );
}
