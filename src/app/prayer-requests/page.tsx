import { PrayerRequestForm } from "@/features/forms/prayer-request-form";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Prayer Requests",
  description: "Share a prayer request with the pastoral team, by name or anonymously.",
});

export default function PrayerRequestsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-4xl text-balance">Prayer Requests</h1>
        <p className="text-lg text-ink-muted">
          Whatever you are carrying, you are welcome to share it here. The
          pastoral team reads every request.
        </p>
      </header>

      <PrayerRequestForm />
    </div>
  );
}
