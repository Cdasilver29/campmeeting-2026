import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { LivestreamView } from "@/features/livestream/components/livestream-view";
import { pageMetadata } from "@/lib/metadata";
import { livestreamPage } from "@/lib/page-identity";

export const metadata = pageMetadata(livestreamPage);

export default function LivestreamPage() {
  return (
    <>
      <PageHeader {...livestreamPage} />

      {/*
        The player sits on the page surface under the muted header band,
        capped at the measure rather than run to the shell: a 16:9 frame at
        80rem is 720px tall,
        which is taller than the viewport it is meant to sit inside on most
        laptops. The measure puts it at roughly 620x350, which is close to
        where it already was and does not push the "what is on now" card off
        the fold.
      */}
      <Band>
        <div className="prose-column">
          <LivestreamView />
        </div>
      </Band>
    </>
  );
}
