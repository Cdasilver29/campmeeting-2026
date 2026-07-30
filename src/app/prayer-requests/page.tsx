import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { PrayerRequestForm } from "@/features/forms/prayer-request-form";
import { pageMetadata } from "@/lib/metadata";
import { prayerRequestsPage } from "@/lib/page-identity";

export const metadata = pageMetadata(prayerRequestsPage);

export default function PrayerRequestsPage() {
  return (
    <>
      <Band>
        <PageHeader {...prayerRequestsPage}>
          <p className="text-ink-muted">
            Whatever you are carrying, you are welcome to share it here.
          </p>
        </PageHeader>
      </Band>

      {/* A form field is read the way a line of prose is, so it takes the
          same measure rather than the full shell. */}
      <Band tone="muted">
        <div className="prose-column">
          <PrayerRequestForm />
        </div>
      </Band>
    </>
  );
}
