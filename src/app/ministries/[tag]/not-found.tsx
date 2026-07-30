import Link from "next/link";
import { Tag } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ACTION_LINK } from "@/lib/link-styles";

/**
 * A /ministries/{tag} URL for a tag that does not exist, or one with no
 * sessions in this programme. Worth its own page rather than the
 * site-wide 404: the reader was after a ministry, and the full list is
 * one link away.
 */
export default function MinistryNotFound() {
  return (
    <div className="shell band flex flex-col gap-(--space-item)">
      <h1 className="font-display text-4xl text-balance">Ministry not found</h1>
      <EmptyState
        icon={Tag}
        title="That ministry is not in this programme"
        description="The link you followed points at a ministry tag that is not listed, or one that currently has no sessions."
        action={
          <Link href="/ministries" className={ACTION_LINK}>
            See all ministries
          </Link>
        }
      />
    </div>
  );
}
