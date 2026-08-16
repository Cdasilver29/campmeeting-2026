import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { eventInfo, hosts } from "@/data";
import { HostCard } from "@/features/speakers/components/host-card";
import { SpeakerCard } from "@/features/speakers/components/speaker-card";
import { SpeakersLockup } from "@/features/speakers/components/speakers-lockup";
import { presenterSpeakers, speakerDayGroups } from "@/features/speakers/lib";
import { pageMetadata } from "@/lib/metadata";
import { speakersPage } from "@/lib/page-identity";
import { DOC_HEADING, DOC_SECTION, MEASURE } from "@/lib/typography";

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

      {/* The cards read as one set, so they stagger. This is the size of
          group the stagger is for; a long list is not.

          TWO COLUMNS ON A PHONE. This was one, on the finding that a
          two-up grid gave each card about 160px at 390 and that was not
          enough for a name, a role and a count without all three
          wrapping. That finding was about the card, not about the
          column count, and the card has since been sized for it — see
          person-card.ts, where every value is derived from the 102px of
          content two cards leave at 320. What changed the balance is
          that there are eleven speakers now rather than four, plus five
          hosts, and sixteen single-file cards is a scroll nobody reads
          to the end of.

          `presenterSpeakers`, not `speakers`: Eld. Ken Ochuka belongs to
          the hosts and elders section below and was appearing in both
          grids on the one page. See features/speakers/lib.ts. */}
      <RevealGroup className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {presenterSpeakers.map((speaker) => (
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

      {/* ── HOSTS, ON THEIR OWN BAND ──────────────────────────────────
          A muted band rather than a second heading on the same surface.
          The brief was that this reads as clearly separate from the
          presenters, and a band boundary is the device this site already
          uses for exactly that: the background runs edge to edge and the
          type does not move sideways, so the grids stay on one grid while
          the two sets stop being one list. See band.tsx.

          It is also the page's second content band, which is inside the
          two-or-three ceiling that file sets. */}
      <Band tone="muted">
        <section aria-labelledby="hosts-heading" className={DOC_SECTION}>
          <h2 id="hosts-heading" className={DOC_HEADING}>
            Hosts and elders
          </h2>
          {/* One line, because the difference between this grid and the
              one above it is not self-evident from five names and five
              offices. MEASURE keeps it to a line of type rather than
              letting it run the full 80rem shell. */}
          <p className={MEASURE}>
            The pastoral team and the elders hosting {eventInfo.edition} at{" "}
            {eventInfo.church.name}.
          </p>

          {/* Same grid as the presenters above, so the two sets read as
              the same kind of card at the same rhythm. Five cards rather
              than ten, so the last one sits alone on the second row at
              lg — which is what a set of five does and is better than
              inventing a five-column track for one section. */}
          <RevealGroup className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {hosts.map((host) => (
              <RevealItem key={host.id} className="h-full">
                <HostCard host={host} />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      </Band>
    </>
  );
}
