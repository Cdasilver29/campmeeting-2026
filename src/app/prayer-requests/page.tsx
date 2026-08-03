import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { PrayerRequestForm } from "@/features/forms/prayer-request-form";
import { pageMetadata } from "@/lib/metadata";
import { prayerRequestsPage } from "@/lib/page-identity";

export const metadata = pageMetadata(prayerRequestsPage);

export default function PrayerRequestsPage() {
  return (
    <>
      <PageHeader {...prayerRequestsPage}>
        <p className="text-ink-muted">
          Whatever you are carrying, you are welcome to share it here.
        </p>
      </PageHeader>

      {/*
        The form caps itself at the field column; this wrapper is the
        outer bound the notes and banners around it read at.

        An earlier pass left this page out of the reveal system on the
        grounds that it is the one page with a no-analytics,
        nothing-persisted constraint. That constraint is about what leaves
        the page, and Reveal is an opacity and a transform: it observes
        nothing, sends nothing and stores nothing. Leaving the page out was
        making it the one page that moved differently from the rest of the
        site, which is a worse outcome than the risk it was avoiding.
      */}
      <Band>
        <Reveal className="prose-column">
          <PrayerRequestForm />
        </Reveal>
      </Band>
    </>
  );
}
