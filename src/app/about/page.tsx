import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { aboutSections } from "@/features/about/copy";
import { pageMetadata } from "@/lib/metadata";
import { aboutPage } from "@/lib/page-identity";
import {
  DOC_BODY,
  DOC_HEADING,
  DOC_SECTION,
  DOC_STACK,
  PROSE_COLUMN,
} from "@/lib/typography";

export const metadata = pageMetadata(aboutPage);

export default function AboutPage() {
  return (
    <>
      <PageHeader {...aboutPage} />

      {/*
        The document nests at the measure inside the shell: the header band
        above rules the full 80rem, the reading column does not. Putting the
        cap on the column rather than on each paragraph is what keeps the
        headings, the rules and the body on one left and right edge.

        A child of the shell rather than the shell itself, because `shell`
        and `prose-column` both set max-width and putting the two on one
        element makes the result depend on Tailwind's sort order rather than
        on anything written here.
      */}
      <Band>
        <div className={`${PROSE_COLUMN} ${DOC_STACK}`}>
          {aboutSections.map((section, index) => (
            // One Reveal per section, which is the granularity Reveal is
            // for: a heading and the paragraphs under it, never a paragraph
            // at a time. Same treatment /speakers and /ministries already
            // use, which is the point of extending it here.
            <Reveal key={section.heading} className={DOC_SECTION}>
              <h2 className={DOC_HEADING}>{section.heading}</h2>
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex} className={DOC_BODY}>
                  {paragraph}
                </p>
              ))}
              {index < aboutSections.length - 1 ? (
                <hr className="mt-6 h-px w-full border-0 bg-line" />
              ) : null}
            </Reveal>
          ))}
        </div>
      </Band>
    </>
  );
}
