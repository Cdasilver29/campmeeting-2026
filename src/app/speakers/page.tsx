import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { speakers } from "@/data";
import { SpeakerCard } from "@/features/speakers/components/speaker-card";
import { speakerDayGroups } from "@/features/speakers/lib";
import { pageMetadata } from "@/lib/metadata";
import { speakersPage } from "@/lib/page-identity";

export const metadata = pageMetadata(speakersPage);

export default function SpeakersPage() {
  return (
    <>
      <PageHeader {...speakersPage}>
        <p className="text-ink-muted">
          Photographs and biographies follow once the committee confirms
          them.
        </p>
      </PageHeader>

      <Band>
      {/* Four cards read as one set, so they stagger. This is the size of
          group the stagger is for; a long list is not.

          One column on a phone rather than two: at 390 a two-up grid gave
          each card about 160px, which is not enough for a name, a role and
          a count without every one of them wrapping. */}
      <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      </Band>
    </>
  );
}
