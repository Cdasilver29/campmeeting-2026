import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { faqItems } from "@/features/faq/questions";
import { pageMetadata } from "@/lib/metadata";
import { faqPage } from "@/lib/page-identity";
import { DOC_BODY } from "@/lib/typography";

export const metadata = pageMetadata(faqPage);

export default function FaqPage() {
  return (
    <>
      {/* The badge sentence carries markup, so it goes in the slot below
          the rule rather than into the meta line, which is a plain string
          shared with the share card. */}
      <PageHeader {...faqPage}>
        <p className="text-ink-muted">
          Answers marked{" "}
          <Badge variant="outline" className="align-middle">
            Provisional
          </Badge>{" "}
          are still awaiting the organising committee&rsquo;s final wording.
        </p>
      </PageHeader>

      {/* A question and its answer are one section, so one Reveal covers
          the pair. A rule above each entry after the first gives the list
          a visible rhythm instead of relying on the gap alone. */}
      <Band>
        <dl className="prose-column flex flex-col">
          {faqItems.map((item, index) => (
            <Reveal
              key={item.question}
              className={
                index === 0
                  ? "flex flex-col gap-2 pb-8"
                  : "flex flex-col gap-2 border-t border-line py-8"
              }
            >
              <dt className="flex flex-wrap items-center gap-2 font-display text-xl text-ink">
                {item.question}
                {item.placeholder ? (
                  <Badge variant="outline">Provisional</Badge>
                ) : null}
              </dt>
              <dd className={DOC_BODY}>{item.answer}</dd>
            </Reveal>
          ))}
        </dl>
      </Band>
    </>
  );
}
