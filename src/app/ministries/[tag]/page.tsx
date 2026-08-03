import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { BookmarksProvider } from "@/features/schedule/bookmarks";
import { ProgramView } from "@/features/schedule/components/program-view";
import { ministryCopy, ministryPages, type MinistryPageTag } from "@/features/ministries/copy";
import { ministryDayGroups } from "@/features/ministries/lib";
import { pageMetadata } from "@/lib/metadata";
import { ministryPageDefinition } from "@/lib/page-identity";

/**
 * One page per ministry with a page of its own — children, family-life,
 * health, christian-education (features/ministries/copy.ts). Every other
 * ministry tag stays reachable only through ?ministry= on the programme,
 * so an unknown or unlisted tag here is a 404.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return ministryPages.map((tag) => ({ tag }));
}

function findMinistry(tag: string): MinistryPageTag | undefined {
  return ministryPages.find((candidate) => candidate === tag);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const tag = findMinistry((await params).tag);
  if (!tag) return {};

  return pageMetadata(ministryPageDefinition(tag));
}

export default async function MinistryPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const tag = findMinistry((await params).tag);
  // Unreachable while dynamicParams is false, but the data lookup can
  // still fail and this is what makes that a 404 rather than a crash.
  if (!tag) notFound();

  const copy = ministryCopy[tag];
  const groups = ministryDayGroups(tag);
  const count = groups.reduce((total, group) => total + group.count, 0);

  return (
    <>
      <PageHeader {...ministryPageDefinition(tag)}>
        {/* No prose-column here any more: the header block is already
            capped at its own measure and centred, so a second, wider cap
            inside it would only be able to make this line longer than the
            meta line above it. */}
        <p className="text-ink-muted">
          {copy.description}{" "}
          <span className="tabular-figures">
            {count} programme {count === 1 ? "entry" : "entries"} across{" "}
            {groups.length} {groups.length === 1 ? "day" : "days"}.
          </span>
        </p>
      </PageHeader>

      {/* Gaps are only meaningful on the unfiltered block; a ministry
          view is a slice of a block, so any hole is the filter's, not
          the programme's. */}
      {/* One Reveal around the whole slice, never one per entry. This is
          programme content: the same rule that keeps /schedule out of the
          reveal system entirely applies to the rows inside it here. The
          section moves as one thing or not at all. */}
      <Band>
        <Reveal>
          <BookmarksProvider>
            <ProgramView groups={groups} showGaps={false} />
          </BookmarksProvider>
        </Reveal>
      </Band>
    </>
  );
}
