import Link from "next/link";
import { eventInfo } from "@/data";
import { cn } from "@/lib/utils";

/**
 * The mark is painted through a CSS mask rather than an `<img>` or an
 * inlined path.
 *
 * public/brand/adventist-mark.svg is fill="currentColor", and an `<img>`
 * resolves that against the image's own root, not ours — it would come
 * out black on every surface, which is wrong the moment the lockup sits
 * on anything dark. Inlining the paths into TSX would put a second copy
 * of the artwork in the repo, and public/brand/README.md exists so there
 * is exactly one copy to swap when the official vector arrives.
 *
 * Masking keeps the single file and makes the mark inherit `color` like
 * text does. The counters (the gaps between the flame strokes and inside
 * the book) stay transparent, so the surface shows through them.
 *
 * The flame-book-cross is the church's identity mark, not decoration, so
 * it is exempt from the "no decorative religious icons" rule. It is also
 * the only such mark on the site.
 */
function Mark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("shrink-0 bg-current mask-brand-mark", className)}
    />
  );
}

/**
 * Header and footer lockup: mark, then the church name over "Nairobi".
 *
 * Below `sm` the name collapses to screen-reader-only rather than being
 * removed. The mark alone is what shows, and the accessible name of the
 * link stays the full church name and city at every width, with no
 * aria-label overriding visible text (WCAG 2.5.3).
 */
export function BrandLockup({
  size = "header",
  className,
}: {
  size?: "header" | "footer";
  className?: string;
}) {
  const isFooter = size === "footer";

  return (
    <Link
      href="/"
      className={cn(
        "group flex items-center gap-2.5 rounded-control text-ink transition-colors duration-fast ease-out-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
        isFooter && "gap-2",
        className,
      )}
    >
      <Mark className={isFooter ? "size-10" : "size-12"} />
      <span
        className={cn(
          "sr-only font-display leading-tight sm:not-sr-only sm:flex sm:flex-col",
          isFooter ? "sm:text-xs" : "sm:text-sm",
        )}
      >
        <span>{eventInfo.church.name}</span>
        {/* The city, not the street. eventInfo.church.address is the full
            postal line and belongs in the footer contact block, not here. */}
        <span className="text-ink-muted">Nairobi</span>
      </span>
    </Link>
  );
}
