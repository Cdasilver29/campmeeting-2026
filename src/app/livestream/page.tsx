import { PageHeader } from "@/components/page-header";
import { LivestreamView } from "@/features/livestream/components/livestream-view";
import { pageMetadata } from "@/lib/metadata";
import { livestreamPage } from "@/lib/page-identity";

export const metadata = pageMetadata(livestreamPage);

export default function LivestreamPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
      <PageHeader {...livestreamPage} />

      <LivestreamView />
    </div>
  );
}
