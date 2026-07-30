import Link from "next/link";
import { Tag } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

const linkClasses =
  "inline-flex h-8 items-center rounded-control px-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";

/**
 * A /ministries/{tag} URL for a tag that does not exist, or one with no
 * sessions in this programme. Worth its own page rather than the
 * site-wide 404: the reader was after a ministry, and the full list is
 * one link away.
 */
export default function MinistryNotFound() {
  return (
    <div className="shell flex flex-col gap-8 py-16">
      <h1 className="font-display text-4xl text-balance">Ministry not found</h1>
      <EmptyState
        icon={Tag}
        title="That ministry is not in this programme"
        description="The link you followed points at a ministry tag that is not listed, or one that currently has no sessions."
        action={
          <Link href="/ministries" className={linkClasses}>
            See all ministries
          </Link>
        }
      />
    </div>
  );
}
