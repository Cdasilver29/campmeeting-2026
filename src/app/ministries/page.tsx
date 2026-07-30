import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { type MinistryTag } from "@/data";
import { ministryPages, type MinistryPageTag } from "@/features/ministries/copy";
import { MinistryCard } from "@/features/ministries/components/ministry-card";
import { allEntries, programMinistries } from "@/features/schedule/lib/entries";
import { ministryDotClasses } from "@/features/schedule/lib/ministry-tone";
import { ministryLabels } from "@/features/schedule/lib/today";
import { scheduleHref } from "@/features/schedule/lib/url";
import { pageMetadata } from "@/lib/metadata";
import { ministriesPage } from "@/lib/page-identity";
import { DOC_BODY, DOC_HEADING } from "@/lib/typography";

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
    <div className="shell flex flex-col gap-14 py-16">
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

      <Reveal>
        <section className="flex flex-col gap-4">
          <h2 className={DOC_HEADING}>More ministries</h2>
          <p className={`text-sm ${DOC_BODY}`}>
            These run through fewer sessions. Each link opens the full
            programme filtered to that ministry, rather than a page of its
            own.
          </p>
          {/*
            Each row carries the same family tint the programme's ministry
            chips use, so a reader who has learned the four families on
            /schedule reads them here without being taught again. The tint
            is on a leading swatch rather than the whole row: it is a cue
            beside the label, never a substitute for it, and the row's own
            text stays on --color-ink at full contrast.
          */}
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {otherTags
              .slice()
              .sort((a, b) => ministryLabels[a].localeCompare(ministryLabels[b]))
              .map((tag) => (
                <li key={tag}>
                  <Link
                    href={scheduleHref({ ministry: tag })}
                    className="flex items-center gap-2.5 rounded-control border border-line px-3 py-2 text-sm text-ink transition-colors duration-fast hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
                  >
                    <span
                      aria-hidden
                      className={`size-2.5 shrink-0 rounded-full ${ministryDotClasses(tag)}`}
                    />
                    <span className="flex-1">{ministryLabels[tag]}</span>
                    <span className="tabular-figures text-xs text-ink-muted">
                      {countFor(tag)}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </Reveal>
    </div>
  );
}
