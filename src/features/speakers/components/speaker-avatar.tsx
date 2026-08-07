import Image from "next/image";
import type { Speaker } from "@/data";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

/** The subset of a Speaker either shape here needs. */
type Sitter = Pick<Speaker, "name" | "image" | "imagePosition">;

/**
 * The monogram, and why it is still here.
 *
 * Seven of the eight speakers now have a photograph. Eld. Ken Ochuka does
 * not, and the committee may yet add a ninth name before they send a
 * ninth picture, so the fallback is not dead code waiting to be deleted —
 * it is the state this list is in whenever it grows.
 *
 * It is meant to look chosen rather than missing, which is three small
 * things. Letter-spacing, because a two-letter monogram set solid reads as
 * a truncation and set open reads as a monogram. An inset hairline, so the
 * shape has an edge and sits in the card the way a photograph would
 * instead of floating as a coloured blob. And the display face, which is
 * the same face the speaker's name is set in directly underneath it.
 */
function Monogram({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center bg-secondary font-display tracking-[0.08em] text-secondary-foreground ring-1 ring-secondary-foreground/15 ring-inset select-none",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

/**
 * A speaker's photograph as a round avatar, or the monogram.
 *
 * ── WHY object-position IS PER SPEAKER ───────────────────────────────
 *
 * Every file in public/speakers is a 3:4 portrait (see
 * tools/assets/speaker-photos.mjs for why it is a crop and not the
 * supplied file). A circle is 1:1, so `cover` keeps the full width and
 * three quarters of the height, and the avatar is a question of WHICH
 * three quarters. The supplied artwork frames each person differently —
 * Dr. Munda's is a close head-and-shoulders, Eld. Bosire's is a
 * three-quarter body — so one shared value crops through a face on some
 * of them. The value comes from the data with the photograph it belongs
 * to; there is no default worth having here.
 *
 * It is written as an inline style rather than a Tailwind class because
 * it is per-record data. Tailwind finds class names by scanning source
 * text, so an interpolated `[object-position:...]` is a class it never
 * generates and a rule that silently does not exist.
 */
export function SpeakerAvatar({
  speaker,
  size = "default",
  className,
}: {
  speaker: Sitter;
  size?: "default" | "lg";
  className?: string;
}) {
  const px = size === "lg" ? 80 : 48;
  const dimension = size === "lg" ? "size-20 text-2xl" : "size-12 text-base";

  if (speaker.image) {
    return (
      <Image
        src={speaker.image}
        alt=""
        width={px}
        height={px}
        style={{ objectPosition: speaker.imagePosition }}
        className={cn(dimension, "shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return <Monogram name={speaker.name} className={cn(dimension, "rounded-full", className)} />;
}

/**
 * The larger portrait, for the one place a speaker IS the page: the media
 * slot in their own page header.
 *
 * 3:4, which is the shape of the file, so `cover` crops nothing and the
 * frame shows the whole portrait as it was cropped. That is the reason
 * the files are 3:4 rather than square — the round avatar can take a
 * square out of a portrait, but a portrait cannot be recovered from a
 * square once the poster's caption has been cut off the bottom of it.
 *
 * 160px wide, which is what makes the 720px file the right size: 160x213
 * at device pixel ratio 3 is 480x640.
 *
 * ── WHY THIS EXISTS AND THE 80px CIRCLE DID NOT SURVIVE ──────────────
 *
 * The header's media slot was carrying the same size-20 circle the cards
 * use. That was right while every speaker was a monogram — an 80px
 * monogram repeated at 160px is just a bigger absence. It stopped being
 * right once the photographs arrived and these pages had a picture and
 * nothing else on them about the person.
 *
 * Eight of the ten now carry a biography below the band as well, so the
 * portrait is no longer the only thing on the page that is about its
 * subject. It stays this size anyway: at 160px it sets the top of the
 * page, and shrinking it back to a circle would make the two pages that
 * still have no biography look like the other eight, minus something.
 */
export function SpeakerPortrait({
  speaker,
  className,
}: {
  speaker: Sitter;
  className?: string;
}) {
  const frame = "w-40 overflow-hidden rounded-card ring-1 ring-line";

  if (!speaker.image) {
    return (
      <Monogram
        name={speaker.name}
        className={cn(frame, "aspect-3/4 text-4xl", className)}
      />
    );
  }

  return (
    <div className={cn(frame, className)}>
      <Image
        src={speaker.image}
        alt=""
        // The file's own dimensions, not the rendered ones, so the ratio
        // Next reserves the box with is exactly the file's and the frame
        // cannot be a third of a pixel off it. `sizes` is what decides
        // which variant is actually fetched.
        width={540}
        height={720}
        sizes="160px"
        style={{ objectPosition: speaker.imagePosition }}
        // h-auto: the reserved ratio drives the height, so nothing shifts
        // when the file decodes.
        className="h-auto w-full object-cover"
      />
    </div>
  );
}
