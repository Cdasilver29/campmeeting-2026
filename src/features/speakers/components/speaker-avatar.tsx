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
  const dimension = size === "lg" ? "size-24 text-2xl" : "size-12 text-base";

  if (speaker.image) {
    return (
      <Image
        src={speaker.image}
        alt=""
        width={size === "lg" ? 96 : 48}
        height={size === "lg" ? 96 : 48}
        className={cn(dimension, "shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        dimension,
        "flex shrink-0 items-center justify-center rounded-full bg-secondary font-display text-secondary-foreground",
        className,
      )}
    >
      {initials(speaker.name)}
    </span>
  );
}
