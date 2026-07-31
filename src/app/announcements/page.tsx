import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Band } from "@/components/band";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { announcementsByDate } from "@/data";
import { AnnouncementsList } from "@/features/announcements/components/announcements-list";
import { pageMetadata } from "@/lib/metadata";
import { announcementsPage } from "@/lib/page-identity";

export const metadata = pageMetadata(announcementsPage);

export default function AnnouncementsPage() {
  return (
    <>
      <PageHeader {...announcementsPage} />

      <Band>
        <div className="prose-column">
          {announcementsByDate.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Nothing has changed"
              description="No updates have been published. The programme stands as printed."
              action={
                <Link
                  href="/schedule"
                  className="rounded-control text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
                >
                  See the programme
                </Link>
              }
            />
          ) : (
            <AnnouncementsList announcements={announcementsByDate} />
          )}
        </div>
      </Band>
    </>
  );
}
