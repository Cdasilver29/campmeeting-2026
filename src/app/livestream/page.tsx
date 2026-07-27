import {
  PlaceholderPage,
  placeholderMetadata,
} from "@/components/placeholder-page";

export const metadata = placeholderMetadata("Livestream");

export default function LivestreamPage() {
  return (
    <PlaceholderPage
      title="Livestream"
      description="Services stream on the church's YouTube channel, and the player is embedded here in Phase 5. The channel is linked in the footer in the meantime."
    />
  );
}
