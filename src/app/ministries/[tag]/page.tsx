import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookmarksProvider } from "@/features/schedule/bookmarks";
import { ProgramView } from "@/features/schedule/components/program-view";
import { ministryCopy, ministryPages, type MinistryPageTag } from "@/features/ministries/copy";
import { ministryDayGroups } from "@/features/ministries/lib";
import { pageMetadata } from "@/lib/metadata";

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

  const copy = ministryCopy[tag];
  const groups = ministryDayGroups(tag);
  const count = groups.reduce((total, group) => total + group.count, 0);

  return pageMetadata({
    title: copy.label,
    description: `${copy.description} ${count} programme ${count === 1 ? "entry" : "entries"} across ${groups.length} ${groups.length === 1 ? "day" : "days"}.`,
    path: `/ministries/${tag}`,
  });
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
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-4xl text-balance">{copy.label}</h1>
        <p className="text-lg text-ink-muted">{copy.description}</p>
        <p className="text-sm text-ink-muted">
          {count} programme {count === 1 ? "entry" : "entries"} across{" "}
          {groups.length} {groups.length === 1 ? "day" : "days"}.
        </p>
      </header>

      {/* Gaps are only meaningful on the unfiltered block; a ministry
          view is a slice of a block, so any hole is the filter's, not
          the programme's. */}
      <BookmarksProvider>
        <ProgramView groups={groups} showGaps={false} />
      </BookmarksProvider>
    </div>
  );
}
