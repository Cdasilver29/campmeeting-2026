import {
  PlaceholderPage,
  placeholderMetadata,
} from "@/components/placeholder-page";

export const metadata = placeholderMetadata("Ministries");

export default function MinistriesPage() {
  return (
    <PlaceholderPage
      title="Ministries"
      description="Pages for the Children, Youth, Family Life and Health programmes open in Phase 4. Every ministry session is already listed in the full programme, and can be filtered there by ministry."
    />
  );
}
