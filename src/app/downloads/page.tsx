import {
  PlaceholderPage,
  placeholderMetadata,
} from "@/components/placeholder-page";

export const metadata = placeholderMetadata("Downloads");

export default function DownloadsPage() {
  return (
    <PlaceholderPage
      title="Downloads"
      description="The printed programme PDF and other handouts will be posted here once the committee signs off on the final draft."
    />
  );
}
