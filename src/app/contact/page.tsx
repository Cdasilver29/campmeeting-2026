import {
  PlaceholderPage,
  placeholderMetadata,
} from "@/components/placeholder-page";
import { eventInfo } from "@/data";

export const metadata = placeholderMetadata("Contact");

export default function ContactPage() {
  return (
    <PlaceholderPage
      title="Contact"
      description={`Directions, a map and the organising committee's details go up in Phase 4. Until then the church can be reached on ${eventInfo.contact.phone} or at ${eventInfo.contact.email}.`}
    />
  );
}
