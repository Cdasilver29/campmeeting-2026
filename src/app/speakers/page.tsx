import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { speakers } from "@/data";
import { SpeakerCard } from "@/features/speakers/components/speaker-card";
import { SpeakersLockup } from "@/features/speakers/components/speakers-lockup";
import { speakerDayGroups } from "@/features/speakers/lib";
import { pageMetadata } from "@/lib/metadata";
import { speakersPage } from "@/lib/page-identity";
import { DOC_HEADING } from "@/lib/typography";

export const metadata = pageMetadata(speakersPage);

export default function SpeakersPage() {
  return (
    <>
      {/* The one band on the site that draws neither the eyebrow nor the
          title. It carries the poster's own statement instead — role, name,
          theme, key text, ranged left over Pr. Kennedy Mfune's photograph —
          and the page's h1 moves below it, where the list it names begins.

          The eyebrow is gone from the BAND and not from the definition: the
          hero text replaces it here, but pageMetadata and the share card
          still read `eyebrow` and `title` off speakersPage, so a link
          preview goes on saying what this page is. See the note there.

          THE EXTRA PADDING IS THE PHOTOGRAPH'S, NOT THE TYPE'S. Four
          display-size lines already made this the tallest band on the site
          at 276px against the standard 213px, and the type needs nothing
          more than that. What needed more is the picture: the band is
          full-bleed, so at 1440 a 276px band keeps only 33% of a 1.725:1
          source's height, and a head spanning 40% of that source cannot
          survive a 33% window at any `object-position`. It was cropped
          through the forehead. `md:py-10` takes the band to 356px, which
          keeps 43% and holds the whole head with air above it. Measured, not
          guessed — see the window arithmetic in page-header-art.ts.

          Below md the padding is untouched: there the band is taller in
          aspect than the source, so `cover` keeps the full height already
          and more band would buy nothing but scrolling. */}
      <PageHeader
        {...speakersPage}
        className="md:py-10"
        lockup={<SpeakersLockup />}
      />

      <Band>
      {/* The page's h1, below the band. It is a real h1 and the only one on
          the page — the four lines above are paragraphs, so nothing in the
          lockup competes with it in the outline — and it sits directly above
          the grid it names, on the same shell edge the lockup starts from. */}
      <h1 className={`${DOC_HEADING} mb-(--space-item)`}>{speakersPage.title}</h1>

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
