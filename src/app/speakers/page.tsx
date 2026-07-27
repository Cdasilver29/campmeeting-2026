import {
  PlaceholderPage,
  placeholderMetadata,
} from "@/components/placeholder-page";

export const metadata = placeholderMetadata("Speakers");

export default function SpeakersPage() {
  return (
    <PlaceholderPage
      title="Speakers"
      description="Profiles arrive in Phase 4, once the committee has confirmed photographs, biographies and the spelling of every name. Each speaker's sessions are already listed in the full programme."
    />
  );
}
