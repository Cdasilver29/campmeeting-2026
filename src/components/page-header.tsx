import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PageIdentity } from "@/lib/page-identity";

/**
 * The one page-header pattern, and the same one the share cards draw.
 *
 * Structure is lifted from src/lib/og.tsx: an eyebrow, the page's name in
 * the display face, a hairline rule, then one line of fact. That card was
 * the only place on the site with a designed header, while every interior
 * page opened with a bare h1 and a paragraph, which is why they all read
 * flat. Now both render the same three strings from the same object — see
 * src/lib/page-identity.ts.
 *
 * The card's colours are navy-on-navy because it sits on its own
 * background; here the tokens do the same job on the page surface. The
 * accent carries the eyebrow in both, and in dark mode --primary resolves
 * to exactly the #7ea6f2 the card uses.
 *
 * `children` is for the occasional page that needs a sentence with markup
 * in it — /faq explains its Provisional badge, /ministries/[tag] adds its
 * counts — which a plain meta string cannot hold. It sits below the rule
 * so the header itself stays the same shape everywhere.
 *
 * `media` is for the one page with something above the eyebrow: a
 * speaker's portrait. Everything else leaves it out.
 */
export function PageHeader({
  eyebrow,
  title,
  meta,
  media,
  children,
  className,
}: PageIdentity & {
  media?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col", className)}>
      {media ? <div className="mb-6">{media}</div> : null}

      {/* Tracking this wide needs the letters to be uppercase to stay
          readable, which is also what keeps it from competing with the
          title. --primary is 4.71:1 on white and 7.37:1 on the dark
          surface, so it clears AA as body-sized text in both themes. */}
      <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
        {eyebrow}
      </p>

      <h1 className="mt-3 font-display text-4xl text-balance text-ink sm:text-5xl">
        {title}
      </h1>

      {/* The card's one piece of ornament, and the only one here. */}
      <hr className="mt-6 h-px w-full border-0 bg-line" />

      <p className="mt-5 text-lg text-ink-muted">{meta}</p>

      {children ? <div className="mt-4">{children}</div> : null}
    </header>
  );
}
