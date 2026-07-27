import {
  PlaceholderPage,
  placeholderMetadata,
} from "@/components/placeholder-page";

export const metadata = placeholderMetadata("About");

export default function AboutPage() {
  return (
    <PlaceholderPage
      title="About Camp Meeting"
      description="Background on camp meeting, the venue and what to expect through the week goes up in Phase 4."
    />
  );
}
