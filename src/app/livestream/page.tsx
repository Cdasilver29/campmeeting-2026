import { eventInfo } from "@/data";
import { LivestreamView } from "@/features/livestream/components/livestream-view";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Livestream",
  description: `Watch ${eventInfo.edition} live from ${eventInfo.church.name}.`,
});

export default function LivestreamPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-4xl text-balance">Livestream</h1>
        <p className="text-lg text-ink-muted">
          Follow {eventInfo.edition} from wherever you are.
        </p>
      </header>

      <LivestreamView />
    </div>
  );
}
