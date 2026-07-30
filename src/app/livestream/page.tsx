import { PageHeader } from "@/components/page-header";
import { LivestreamView } from "@/features/livestream/components/livestream-view";
import { pageMetadata } from "@/lib/metadata";
import { livestreamPage } from "@/lib/page-identity";

export const metadata = pageMetadata(livestreamPage);

export default function LivestreamPage() {
  return (
    <div className="shell flex flex-col gap-8 py-16">
      <PageHeader {...livestreamPage} />

      {/* Capped at the measure rather than run to the shell. A 16:9 player
          at 80rem is 720px tall, which is taller than the viewport it is
          meant to sit inside on most laptops. Chunk 2 gives this page a
          real two-column band at lg; until then the measure is the safe
          bound. */}
      <div className="prose-column">
        <LivestreamView />
      </div>
    </div>
  );
}
