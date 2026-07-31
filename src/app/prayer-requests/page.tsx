import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { PrayerRequestForm } from "@/features/forms/prayer-request-form";
import { pageMetadata } from "@/lib/metadata";
import { prayerRequestsPage } from "@/lib/page-identity";

export const metadata = pageMetadata(prayerRequestsPage);

export default function PrayerRequestsPage() {
  return (
    <>
      <PageHeader {...prayerRequestsPage}>
        <p className="text-ink-muted">
          Whatever you are carrying, you are welcome to share it here.
        </p>
      </PageHeader>

      {/* The form caps itself at the field column; this wrapper is the
          outer bound the notes and banners around it read at. */}
      <Band>
        <div className="prose-column">
          <PrayerRequestForm />
        </div>
      </Band>
    </>
  );
}
