import type { Metadata } from "next";
import { Band } from "@/components/band";
import { EmptyState } from "@/components/empty-state";
import { eventInfo } from "@/data";
import { pageMetadata } from "@/lib/metadata";

/**
 * Stand-in for routes the footer links to before their phase lands.
 * Each placeholder route stays statically generated so the sitemap and
 * the shell's link graph are complete from Phase 3 onward.
 */
export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <Band>
        <h1 className="font-display text-4xl text-balance">{title}</h1>
      </Band>
      <Band tone="muted">
        <EmptyState title="Not published yet" description={description} />
      </Band>
    </>
  );
}

/**
 * Through pageMetadata rather than a bare title, so a placeholder route
 * carries the same canonical and Open Graph pair as a finished one — it
 * is in the sitemap and linked from the shell, so it gets shared like any
 * other page.
 */
export function placeholderMetadata(title: string, path: string): Metadata {
  return pageMetadata({
    title,
    description: `${title} for ${eventInfo.edition} at ${eventInfo.church.name}. Not published yet.`,
    path,
  });
}
