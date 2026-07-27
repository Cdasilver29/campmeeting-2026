import {
  PlaceholderPage,
  placeholderMetadata,
} from "@/components/placeholder-page";

export const metadata = placeholderMetadata("Gallery");

export default function GalleryPage() {
  return (
    <PlaceholderPage
      title="Gallery"
      description="Photographs from the week are published here as camp meeting goes on. The gallery opens in Phase 5."
    />
  );
}
