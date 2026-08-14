import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { allSessions, getDay } from "@/data";
import { SessionCard } from "@/features/schedule/components/session-card";
import { ShareSession } from "@/features/schedule/components/share-session";
import { sessionIdFromSlug, sessionSlug } from "@/features/schedule/lib/url";
import { ACTION_LINK } from "@/lib/link-styles";
import { pageMetadata } from "@/lib/metadata";
import { sessionPageDefinition } from "@/lib/page-identity";

/**
 * ── ONE SESSION, AT ITS OWN ADDRESS ──────────────────────────────────
 *
 * The target of the share control. Somebody drops "come to this" into a
 * WhatsApp group; this is what opens.
 *
 * ── WHY IT IS A ROUTE AND NOT A HASH ON THE DAY PAGE ─────────────────
 *
 * /schedule/{day}#{sessionId} was the obvious answer and it cannot work,
 * for one reason that is not obvious: a crawler does not send the
 * fragment. WhatsApp fetches /schedule/friday-21 and gets the DAY's share
 * card, so every one of the day's 18 sessions would preview identically —
 * and a preview that names the session, its time and its presenter was
 * the whole point of sharing one. The session has to be in the path for
 * the card to know about it.
 *
 * ── WHY IT DOES NOT RENDER THE WHOLE DAY ─────────────────────────────
 *
 * The first design did, so the URL literally opened the programme
 * focused on that session. It was measured before it was written:
 * a built day page is 231-385 KB of HTML plus 104-171 KB of flight data,
 * and there are 238 sessions. That is about 114 MB of static output to
 * publish eight days of programme 238 times over, on a project whose
 * gallery was kept out of the precache to save 3 MB.
 *
 * So the scope is the BLOCK, which is the unit the programme itself is
 * printed in: the session in full, the rest of its block around it in
 * order, and the whole day one link away. A reader arriving here sees
 * what they were sent, what comes before and after it, and how to get to
 * everything else — which is what "focused" was asking for — at about
 * 6% of the cost.
 *
 * ── NOT IN THE PRECACHE AND NOT IN THE SITEMAP ───────────────────────
 *
 * `siteRoutes` is deliberately not extended. It feeds both the service
 * worker's precache and the sitemap, and 238 more entries would take the
 * precache from 109 to 347 — which is the campground phone downloading
 * the programme 30 times before it opens anything. These pages are
 * arrival points for a shared link, not something to browse offline; the
 * day pages are precached and are where the programme is read.
 */

/** One page per session, and nothing else: an unknown slug is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return allSessions.map((session) => ({
    day: session.dayId,
    session: sessionSlug(session.dayId, session.id),
  }));
}

type Params = { params: Promise<{ day: string; session: string }> };

function resolve(day: string, slug: string) {
  const programDay = getDay(day);
  if (!programDay) return undefined;
  const id = sessionIdFromSlug(day, slug);
  const session = allSessions.find((s) => s.id === id);
  if (!session) return undefined;
  return { day: programDay, session };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { day, session } = await params;
  const found = resolve(day, session);
  if (!found) return {};

  return pageMetadata(sessionPageDefinition(found.session, found.day));
}

export default async function SessionPage({ params }: Params) {
  const { day, session } = await params;
  const found = resolve(day, session);
  if (!found) notFound();

  const definition = sessionPageDefinition(found.session, found.day);

  /* The rest of the block, in printed order. `blockId` rather than
     `blockLabel`: two days can print the same label and this must not
     pull Monday's Evening Service into Tuesday's page. */
  const siblings = allSessions.filter(
    (s) =>
      s.dayId === found.session.dayId &&
      s.blockId === found.session.blockId &&
      s.id !== found.session.id,
  );

  return (
    <>
      <PageHeader {...definition} />

      <Band drift={false}>
        <div className="flex flex-col gap-(--space-item)">
          {/* The session itself, at the emphasis the live card uses on the
              home page: a 2px accent ring rather than the hairline every
              row below it carries. That is what makes it obvious on
              arrival without a highlight colour washed over it — the
              reader was sent one thing and it is the only thing on the
              page drawn like this. */}
          <SessionCard
            session={found.session}
            headingLevel="h2"
            className="bg-primary/[0.06] p-5 ring-2 ring-primary sm:p-6 [&>h2]:text-xl"
            meta={
              <ShareSession
                dayId={found.session.dayId}
                sessionId={found.session.id}
                title={found.session.title}
              />
            }
          />

          {siblings.length > 0 ? (
            <section
              aria-labelledby="block-heading"
              className="flex flex-col gap-3"
            >
              <h2
                id="block-heading"
                className="border-b border-line pb-1.5 font-display text-xl text-ink"
              >
                Rest of {found.session.blockLabel}
              </h2>
              {/* Compact: time and title only. The full cards are on the
                  day page, which is one link below, and repeating them
                  here would be the day page with one row emphasised —
                  which is the design this route exists to avoid paying
                  for 238 times. */}
              <ol className="flex flex-col divide-y divide-line">
                {siblings.map((sibling) => (
                  <li key={sibling.id}>
                    <Link
                      href={`/schedule/${sibling.dayId}/${sessionSlug(sibling.dayId, sibling.id)}`}
                      className="flex min-h-11 items-baseline gap-4 py-2 text-ink-muted transition-colors duration-fast hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-500"
                    >
                      <span className="tabular-figures w-24 shrink-0 text-sm">
                        {sibling.start ?? "All block"}
                      </span>
                      <span className="text-sm">{sibling.title}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <p>
            <Link href={`/schedule/${found.day.id}`} className={ACTION_LINK}>
              All of {found.day.displayLabel}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </p>
        </div>
      </Band>
    </>
  );
}
