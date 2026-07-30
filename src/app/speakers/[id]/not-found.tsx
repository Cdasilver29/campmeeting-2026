import Link from "next/link";
import { UserX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

const linkClasses =
  "inline-flex h-8 items-center rounded-control px-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";

/**
 * A /speakers/{id} URL for a speaker the programme does not have. Worth
 * its own page rather than the site-wide 404: the reader was after a
 * speaker, and the full list is one link away.
 */
export default function SpeakerNotFound() {
  return (
    <div className="shell flex flex-col gap-8 py-16">
      <h1 className="font-display text-4xl text-balance">Speaker not found</h1>
      <EmptyState
        icon={UserX}
        title="That speaker is not in this programme"
        description="The link you followed points at a speaker who is not listed, or one whose id has changed."
        action={
          <Link href="/speakers" className={linkClasses}>
            See all speakers
          </Link>
        }
      />
    </div>
  );
}
