import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { announcementsByDate, eventInfo } from "@/data";
import { AnnouncementsList } from "@/features/announcements/components/announcements-list";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Announcements",
  description: `Programme updates and notices for ${eventInfo.edition}.`,
  path: "/announcements",
});

export default function AnnouncementsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-4xl text-balance">Announcements</h1>
        <p className="text-lg text-ink-muted">
          Programme updates published during {eventInfo.edition}, newest first.
        </p>
      </header>

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
  );
}
