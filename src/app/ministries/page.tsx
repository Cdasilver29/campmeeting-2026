import { eventInfo } from "@/data";
import { MinistryCard } from "@/features/ministries/components/ministry-card";
import { allEntries, programMinistries } from "@/features/schedule/lib/entries";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Ministries",
  description: `Every ministry represented in the ${eventInfo.edition} programme, and every session under each.`,
});

export default function MinistriesPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-4xl text-balance">Ministries</h1>
        <p className="text-lg text-ink-muted">
          The ministries at work across the programme, each with its own
          sessions listed by day.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {programMinistries.map((tag) => (
          <MinistryCard
            key={tag}
            tag={tag}
            count={allEntries.filter((entry) => entry.ministry === tag).length}
          />
        ))}
      </div>
    </div>
  );
}
