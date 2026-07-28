import { Badge } from "@/components/ui/badge";
import { eventInfo } from "@/data";
import { faqItems } from "@/features/faq/questions";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "FAQ",
  description: `Answers to common questions about ${eventInfo.edition}: dates, venue, session times, livestream and the children's programme.`,
  path: "/faq",
});

export default function FaqPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-4xl text-balance">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-ink-muted">
          Answers marked{" "}
          <Badge variant="outline" className="align-middle">
            Provisional
          </Badge>{" "}
          are still awaiting the organising committee&rsquo;s final wording.
        </p>
      </header>

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
