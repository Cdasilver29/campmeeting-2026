import {
  PlaceholderPage,
  placeholderMetadata,
} from "@/components/placeholder-page";

export const metadata = placeholderMetadata("FAQ");

export default function FaqPage() {
  return (
    <PlaceholderPage
      title="Frequently Asked Questions"
      description="Answers on transport, meals, accommodation and children's programmes are being collected from the organising committee."
    />
  );
}
