import { PageHeader } from "@/components/page-header";
import { PrayerRequestForm } from "@/features/forms/prayer-request-form";
import { pageMetadata } from "@/lib/metadata";
import { prayerRequestsPage } from "@/lib/page-identity";

export const metadata = pageMetadata(prayerRequestsPage);

export default function PrayerRequestsPage() {
  return (
    <div className="shell flex flex-col gap-8 py-16">
      <PageHeader {...prayerRequestsPage}>
        <p className="text-ink-muted">
          Whatever you are carrying, you are welcome to share it here.
        </p>
      </PageHeader>

      {/* A form field is read the way a line of prose is, so it takes the
          same measure rather than the full shell. */}
      <div className="prose-column">
        <PrayerRequestForm />
      </div>
    </div>
  );
}
