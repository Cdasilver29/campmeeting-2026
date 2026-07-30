import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { type MinistryTag } from "@/data";
import { ministryPages, type MinistryPageTag } from "@/features/ministries/copy";
import { MinistryCard } from "@/features/ministries/components/ministry-card";
import { allEntries, programMinistries } from "@/features/schedule/lib/entries";
import { ministryLabels } from "@/features/schedule/lib/today";
import { scheduleHref } from "@/features/schedule/lib/url";
import { pageMetadata } from "@/lib/metadata";
import { ministriesPage } from "@/lib/page-identity";

export const metadata = pageMetadata(ministriesPage);

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
      <PageHeader {...ministriesPage}>
        <p className="text-ink-muted">
          These run enough of the programme to be worth a page of their own.
          Every other ministry is still searchable on the full programme.
        </p>
      </PageHeader>

      <section className="flex flex-col gap-4">
        <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ministryPages.map((tag) => (
            <RevealItem key={tag} className="h-full">
              <MinistryCard tag={tag} count={countFor(tag)} />
            </RevealItem>
          ))}
        </RevealGroup>
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
