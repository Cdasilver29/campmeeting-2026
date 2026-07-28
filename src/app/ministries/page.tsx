import Link from "next/link";
import { eventInfo, type MinistryTag } from "@/data";
import { ministryPages, type MinistryPageTag } from "@/features/ministries/copy";
import { MinistryCard } from "@/features/ministries/components/ministry-card";
import { allEntries, programMinistries } from "@/features/schedule/lib/entries";
import { ministryLabels } from "@/features/schedule/lib/today";
import { scheduleHref } from "@/features/schedule/lib/url";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Ministries",
  description: `The ministries with their own pages at ${eventInfo.edition}, and every other ministry tag searchable on the programme.`,
});

function countFor(tag: MinistryTag): number {
  return allEntries.filter((entry) => entry.ministry === tag).length;
}

function hasOwnPage(tag: MinistryTag): tag is MinistryPageTag {
  return (ministryPages as readonly MinistryTag[]).includes(tag);
}

export default function MinistriesPage() {
  const otherTags = programMinistries.filter((tag) => !hasOwnPage(tag));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-14 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-4xl text-balance">Ministries</h1>
        <p className="text-lg text-ink-muted">
          Four ministries run enough of the programme to be worth a page
          of their own. Every other ministry is still searchable on the
          full programme.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ministryPages.map((tag) => (
            <MinistryCard key={tag} tag={tag} count={countFor(tag)} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl text-ink">More ministries</h2>
        <p className="text-sm text-ink-muted">
          These run through fewer sessions. Each link opens the full
          programme filtered to that ministry, rather than a page of its
          own.
        </p>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {otherTags
            .slice()
            .sort((a, b) => ministryLabels[a].localeCompare(ministryLabels[b]))
            .map((tag) => (
              <li key={tag}>
                <Link
                  href={scheduleHref({ ministry: tag })}
                  className="flex items-center justify-between gap-3 rounded-control border border-line px-3 py-2 text-sm text-ink transition-colors duration-fast hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
                >
                  <span>{ministryLabels[tag]}</span>
                  <span className="text-xs text-ink-muted">
                    {countFor(tag)}
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
