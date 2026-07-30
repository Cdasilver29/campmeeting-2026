import Link from "next/link";
import { UserX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ACTION_LINK } from "@/lib/link-styles";

/**
 * A /speakers/{id} URL for a speaker the programme does not have. Worth
 * its own page rather than the site-wide 404: the reader was after a
 * speaker, and the full list is one link away.
 */
export default function SpeakerNotFound() {
  return (
    <div className="shell band flex flex-col gap-(--space-item)">
      <h1 className="font-display text-4xl text-balance">Speaker not found</h1>
      <EmptyState
        icon={UserX}
        title="That speaker is not in this programme"
        description="The link you followed points at a speaker who is not listed, or one whose id has changed."
        action={
          <Link href="/speakers" className={ACTION_LINK}>
            See all speakers
          </Link>
        }
      />
    </div>
  );
}
