import Link from "next/link";
import { Band } from "@/components/band";
import { eventInfo, program } from "@/data";
import { dayPath } from "@/features/schedule/lib/url";
import { pageMetadata } from "@/lib/metadata";
import { OFFLINE_ROUTE } from "@/lib/pwa";

export const metadata = {
  ...pageMetadata({
    title: "Offline",
    description: `What you can still read from ${eventInfo.edition} without a connection.`,
    path: OFFLINE_ROUTE,
  }),
  // The fallback the service worker shows when a page is not cached. It
  // is not part of the site's content and should never be a result.
  robots: { index: false, follow: false },
};

const linkClassName =
  "rounded-control text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";

/** Needs the network, and says so rather than failing silently. */
const needsSignal = [
  "The livestream, which is a YouTube player",
  "The map on the contact page",
  "Sending a prayer request or a contact message",
  "Photos in the gallery",
];

/**
 * Shown for any page the cache cannot answer.
 *
 * The useful thing to say here is not "you are offline" — the phone has
 * already made that clear — but which parts of the programme are sitting
 * on the device and can be opened right now. Every link below is
 * precached, so all of them work from this page with no signal at all.
 */
export default function OfflinePage() {
  return (
    <>
      <Band>
        <header className="prose-column flex flex-col gap-(--space-item)">
          <h1 className="font-display text-4xl text-balance">
            This page needs a connection
          </h1>
          <p className="text-lg text-ink-muted">
            The programme itself does not. It was saved to this device on your
            first visit, so everything below opens with no signal.
          </p>
        </header>
      </Band>

      <Band
        tone="muted"
        innerClassName="flex flex-col gap-(--space-section)"
      >
        <section
          aria-labelledby="offline-programme"
          className="prose-column flex flex-col gap-(--space-item)"
        >
          <h2 id="offline-programme" className="font-display text-2xl">
            Available now
          </h2>
          <ul className="flex flex-col gap-2 text-base">
            <li>
              <Link href="/" className={linkClassName}>
                Today
              </Link>{" "}
              <span className="text-ink-muted">
                — what is on, on {eventInfo.timezone.split("/")[1]} time
              </span>
            </li>
            <li>
              <Link href="/schedule" className={linkClassName}>
                The full programme
              </Link>
              <span className="text-ink-muted">, all {program.length} days</span>
            </li>
            <li>
              <Link href="/schedule?view=mine" className={linkClassName}>
                My schedule
              </Link>
              <span className="text-ink-muted">, the sessions you saved</span>
            </li>
            <li>
              <Link href="/speakers" className={linkClassName}>
                Speakers
              </Link>{" "}
              <span className="text-ink-muted">and</span>{" "}
              <Link href="/ministries" className={linkClassName}>
                ministries
              </Link>
            </li>
          </ul>
        </section>

        <section
          aria-labelledby="offline-days"
          className="prose-column flex flex-col gap-(--space-item)"
        >
          <h2 id="offline-days" className="font-display text-2xl">
            Go straight to a day
          </h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-base">
            {program.map((day) => (
              <li key={day.id}>
                <Link href={dayPath(day.id)} className={linkClassName}>
                  {day.displayLabel}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="offline-limits"
          className="prose-column flex flex-col gap-(--space-item)"
        >
          <h2 id="offline-limits" className="font-display text-2xl">
            Waiting on signal
          </h2>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-base text-ink-muted">
            {needsSignal.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </Band>
    </>
  );
}
