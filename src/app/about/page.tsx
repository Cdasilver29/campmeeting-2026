import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { aboutSections } from "@/features/about/copy";
import { ACTION_LINK } from "@/lib/link-styles";
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
      {/* No eyebrow. It is the edition, "Camp Meeting 2026", set small
          above a title that reads "About Camp Meeting" — the same three
          words twice in one band, and the edition is already in the header
          lockup on every page, in the footer, and in this page's own
          metadata title. `aboutPage.eyebrow` is untouched: the share card
          still draws it, and a card has room for a line this band does
          not. */}
      <PageHeader {...aboutPage} hideEyebrow />

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
              {/* An outbound link rather than a restatement. The one on the
                  first section is what keeps the denomination's own account
                  of its beliefs where it belongs, on the denomination's
                  site. Internal links use Link; external ones cannot. */}
              {section.link ? (
                section.link.external ? (
                  <a
                    href={section.link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`${ACTION_LINK} gap-1`}
                  >
                    {section.link.label}
                    <ExternalLink aria-hidden className="size-3.5" />
                  </a>
                ) : (
                  <Link href={section.link.href} className={ACTION_LINK}>
                    {section.link.label}
                  </Link>
                )
              ) : null}
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
