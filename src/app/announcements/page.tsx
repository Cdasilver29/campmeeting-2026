import {
  PlaceholderPage,
  placeholderMetadata,
} from "@/components/placeholder-page";

export const metadata = placeholderMetadata("Announcements");

export default function AnnouncementsPage() {
  return (
    <PlaceholderPage
      title="Announcements"
      description="Programme updates and notices will appear here once camp meeting begins."
    />
  );
}
