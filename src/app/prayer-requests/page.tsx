import {
  PlaceholderPage,
  placeholderMetadata,
} from "@/components/placeholder-page";

export const metadata = placeholderMetadata("Prayer Requests");

export default function PrayerRequestsPage() {
  return (
    <PlaceholderPage
      title="Prayer Requests"
      description="The prayer request form opens in Phase 5. Requests are handled in confidence by the prayer ministry."
    />
  );
}
