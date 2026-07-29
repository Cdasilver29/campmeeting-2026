import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { eventInfo } from "@/data";
import { eventDateRange } from "@/lib/event-dates";
import { HERO_IMAGE } from "@/lib/hero";

/**
 * The home hero band.
 *
 * Server component. Everything in it is fixed at build time; the
 * clock-dependent countdown / live / archive states are unchanged and
 * still render below this, from TodayView. The hero wraps them, it does
 * not replace them.
 *
 * The photographic treatment is gated on HERO_IMAGE (src/lib/hero.ts).
 * When that constant is undefined this renders as a solid navy band with
 * the same copy, the same height and the same spacing — a deliberate
 * treatment rather than an empty frame. See the comment in hero.ts for
 * why the switch exists.
 *
 * Height is fixed per breakpoint rather than derived from the content, so
 * the band reserves its own space and nothing shifts when the image
 * decodes. Nothing in here animates: no parallax, no ken burns, no
 * fade-in on the photograph.
 */
export function Hero() {
  return (
    <section className="relative isolate flex h-80 items-center overflow-hidden bg-navy-900 sm:h-96 lg:h-[28rem]">
      {HERO_IMAGE ? (
        <>
          <Image
            src={HERO_IMAGE.src}
            alt=""
            aria-hidden
            fill
            priority
            sizes="100vw"
            quality={85}
            className="-z-20 object-cover"
            // The scale is not decoration. A blur samples past the edge of
            // its own box, so a blurred element that exactly fills its
            // frame feathers to transparent at all four sides and lets the
            // navy show through as a halo. Oversizing by 10% pushes the
            // feathered edge outside the band, where overflow-hidden clips
            // it.
            style={{
              filter: `blur(${HERO_IMAGE.blurPx}px)`,
              transform: "scale(1.1)",
            }}
          />
          {/*
            Flat navy at a measured alpha, not a gradient. The photograph's
            bright region is the sun flare in the upper right, which is not
            where a top-to-bottom or bottom-to-top gradient puts its dense
            end, so a gradient would have had to be heavier overall to
            protect the same text.
          */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-navy-900"
            style={{ opacity: HERO_IMAGE.overlayOpacity }}
          />
        </>
      ) : null}

      {/*
        Every string here is pure white, never white/80 or white/90. The
        measured 5.36:1 is the figure for white; knocking the eyebrow back
        to 80% opacity over the same pixels drops it to 4.15:1 and fails.
        Hierarchy comes from size and tracking instead of from opacity.
      */}
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6">
        <p className="text-sm tracking-wide text-white uppercase">
          {eventInfo.church.name}
        </p>
        <h1 className="font-display text-5xl text-balance text-white sm:text-6xl">
          {eventInfo.edition}
        </h1>
        <p className="text-lg text-white">
          {eventDateRange()} at {eventInfo.church.address}
        </p>
        <div className="mt-2">
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 rounded-control bg-white px-5 py-2.5 text-sm font-medium text-navy-900 transition-colors duration-fast ease-out-soft hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            See the programme
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
