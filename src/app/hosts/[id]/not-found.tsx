import Link from "next/link";
import { MailX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ACTION_LINK } from "@/lib/link-styles";

/**
 * A /hosts/{id} URL for a host who has not written a welcome letter, or
 * for an id that is not a host at all. Its own page rather than the
 * site-wide 404 for the same reason /speakers/[id] has one: the reader
 * was after a person, and the list of them is one link away.
 */
export default function HostNotFound() {
  return (
    <div className="shell band flex flex-col gap-(--space-item)">
      <h1 className="font-display text-4xl text-balance">Letter not found</h1>
      <EmptyState
        icon={MailX}
        title="There is no welcome letter at this address"
        description="The link you followed points at a host who has not written one, or at an id that has changed."
        action={
          <Link href="/speakers" className={ACTION_LINK}>
            See the hosts and elders
          </Link>
        }
      />
    </div>
  );
}
