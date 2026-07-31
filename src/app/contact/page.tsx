import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { eventInfo } from "@/data";
import { ContactForm } from "@/features/forms/contact-form";
import { pageMetadata } from "@/lib/metadata";
import { INLINE_LINK } from "@/lib/link-styles";
import { contactPage } from "@/lib/page-identity";
import { DOC_BODY, DOC_HEADING } from "@/lib/typography";

export const metadata = pageMetadata(contactPage);

// A list of contact facts is not running prose, so these take a real
// target height. Measured at 20-24px before this.
const linkClassName = INLINE_LINK;

const mapQuery = encodeURIComponent(
  `${eventInfo.church.name}, ${eventInfo.church.address}`,
);

/**
 * Three bands, because this page holds three different kinds of thing: a
 * form, a set of facts about where the church is, and how to give. As one
 * white column of four `gap-12` sections they read as one undifferentiated
 * list, which is the specific complaint this pass exists to answer.
 *
 * The form caps itself at the field column, which is narrower than the
 * prose measure because a field is aimed at rather than read line by line,
 * while the address-and-map band uses the shell width properly by putting
 * the details beside the map from `lg`. That pairing
 * is the one place on this page where the extra width buys something: the
 * map stops being a 288px-tall letterbox under a short list.
 */
export default function ContactPage() {
  return (
    <>
      <PageHeader {...contactPage} />

      <Band>
        <Reveal className="prose-column">
          <section className="flex flex-col gap-(--space-item)">
            <h2 className={DOC_HEADING}>Send a message</h2>
            <ContactForm />
          </section>
        </Reveal>
      </Band>

      <Band tone="muted">
        <Reveal className="grid gap-(--space-section) lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
          <section className="flex flex-col gap-(--space-item)">
            <h2 className={DOC_HEADING}>Get in touch</h2>
            <ul className="flex flex-col gap-2 text-ink-muted">
              <li className="flex items-center gap-2">
                <Phone aria-hidden className="size-4 shrink-0" />
                <a href={`tel:${eventInfo.contact.phone}`} className={linkClassName}>
                  {eventInfo.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail aria-hidden className="size-4 shrink-0" />
                <a
                  href={`mailto:${eventInfo.contact.email}`}
                  className={linkClassName}
                >
                  {eventInfo.contact.email}
                </a>
              </li>
              {eventInfo.contact.prayerEmail ? (
                <li className="flex flex-wrap items-center gap-2">
                  <Mail aria-hidden className="size-4 shrink-0" />
                  <a
                    href={`mailto:${eventInfo.contact.prayerEmail}`}
                    className={linkClassName}
                  >
                    {eventInfo.contact.prayerEmail}
                  </a>
                  <span className="text-sm">(prayer requests)</span>
                </li>
              ) : null}
              <li className="flex items-center gap-2">
                <ExternalLink aria-hidden className="size-4 shrink-0" />
                <a
                  href={eventInfo.church.website}
                  target="_blank"
                  rel="noreferrer"
                  className={linkClassName}
                >
                  {eventInfo.church.website.replace(/^https?:\/\//, "")}
                </a>
              </li>
            </ul>

            <p className={`flex items-start gap-2 ${DOC_BODY}`}>
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>
                {eventInfo.church.name}, {eventInfo.church.address}.
              </span>
            </p>
          </section>

          <section className="flex flex-col gap-(--space-item)">
            <h2 className={DOC_HEADING}>Find us</h2>
            <div className="overflow-hidden rounded-card ring-1 ring-line">
              <iframe
                title={`Map to ${eventInfo.church.name}, ${eventInfo.church.address}`}
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full border-0 lg:h-96"
              />
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noreferrer"
              className={`gap-1 text-sm ${linkClassName}`}
            >
              Open in Google Maps
              <ExternalLink aria-hidden className="size-3.5" />
            </a>
          </section>
        </Reveal>
      </Band>

      <Band>
        <Reveal className="prose-column">
          <section className="flex flex-col gap-(--space-item)">
            <h2 className={DOC_HEADING}>Give</h2>
            {/* At the measure, not the shell: two four-line cards spread
                across 80rem would be 600px each of mostly nothing. */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1 rounded-card bg-surface p-4 ring-1 ring-line">
                <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">
                  M-Pesa Paybill
                </p>
                <p className="text-ink">
                  Paybill{" "}
                  <span className="tabular-figures font-medium">
                    {eventInfo.giving.paybill.number}
                  </span>
                </p>
                <p className="text-ink-muted">
                  Account: {eventInfo.giving.paybill.account}
                </p>
              </div>
              <div className="flex flex-col gap-1 rounded-card bg-surface p-4 ring-1 ring-line">
                <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">
                  Bank transfer
                </p>
                <p className="text-ink">{eventInfo.giving.bank.name}</p>
                <p className="text-ink-muted">{eventInfo.giving.bank.branch}</p>
                <p className="text-ink-muted">
                  Account:{" "}
                  <span className="tabular-figures">
                    {eventInfo.giving.bank.account}
                  </span>
                </p>
              </div>
            </div>
          </section>
        </Reveal>
      </Band>
    </>
  );
}
