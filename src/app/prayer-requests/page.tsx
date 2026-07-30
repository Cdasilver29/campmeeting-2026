import { PageHeader } from "@/components/page-header";
import { PrayerRequestForm } from "@/features/forms/prayer-request-form";
import { pageMetadata } from "@/lib/metadata";
import { prayerRequestsPage } from "@/lib/page-identity";

export const metadata = pageMetadata(prayerRequestsPage);

export default function PrayerRequestsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <PageHeader {...prayerRequestsPage}>
        <p className="text-ink-muted">
          Whatever you are carrying, you are welcome to share it here.
        </p>
      </PageHeader>

      <PrayerRequestForm />
    </div>
  );
}
