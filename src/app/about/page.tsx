import { eventInfo } from "@/data";
import { aboutSections } from "@/features/about/copy";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "About",
  description: `What Camp Meeting is, and the details for ${eventInfo.edition} at ${eventInfo.church.name}, ${eventInfo.church.address}.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-4xl text-balance">
          About Camp Meeting
        </h1>
        <p className="text-lg text-ink-muted">
          {eventInfo.edition} at {eventInfo.church.name},{" "}
          {eventInfo.church.address}.
        </p>
      </header>

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
