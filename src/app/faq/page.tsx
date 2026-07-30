import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { faqItems } from "@/features/faq/questions";
import { pageMetadata } from "@/lib/metadata";
import { faqPage } from "@/lib/page-identity";

export const metadata = pageMetadata(faqPage);

export default function FaqPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
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

      <dl className="flex flex-col gap-8">
        {faqItems.map((item) => (
          <div key={item.question} className="flex flex-col gap-2">
            <dt className="flex flex-wrap items-center gap-2 font-display text-xl text-ink">
              {item.question}
              {item.placeholder ? (
                <Badge variant="outline">Provisional</Badge>
              ) : null}
            </dt>
            <dd className="text-ink-muted">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
