import { PageHeader } from "@/components/page-header";
import { aboutSections } from "@/features/about/copy";
import { pageMetadata } from "@/lib/metadata";
import { aboutPage } from "@/lib/page-identity";

export const metadata = pageMetadata(aboutPage);

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-16">
      <PageHeader {...aboutPage} />

      <div className="flex flex-col gap-10">
        {aboutSections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-3">
            <h2 className="font-display text-2xl text-ink">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-ink-muted">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
