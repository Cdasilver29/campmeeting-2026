import { RevealGroup, RevealItem } from "@/components/reveal";
import { eventInfo, speakers } from "@/data";
import { SpeakerCard } from "@/features/speakers/components/speaker-card";
import { speakerDayGroups } from "@/features/speakers/lib";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Speakers",
  description: `The speakers and presenters at ${eventInfo.edition}, ${eventInfo.church.name}, with every session they are part of.`,
  path: "/speakers",
});

export default function SpeakersPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-4xl text-balance">Speakers</h1>
        <p className="text-lg text-ink-muted">
          Presenters across the programme. Photographs and biographies
          follow once the committee confirms them.
        </p>
      </header>

      {/* Four cards read as one set, so they stagger. This is the size of
          group the stagger is for; a long list is not. */}
      <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {speakers.map((speaker) => (
          <RevealItem key={speaker.id} className="h-full">
            <SpeakerCard
              speaker={speaker}
              sessionCount={speakerDayGroups(speaker.id).reduce(
                (total, group) => total + group.sessions.length,
                0,
              )}
            />
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
