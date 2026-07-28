import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { eventInfo } from "@/data";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Contact",
  description: `Reach ${eventInfo.church.name}, find directions to ${eventInfo.church.address}, and giving details for ${eventInfo.edition}.`,
});

const linkClassName =
  "rounded-control underline-offset-4 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";

const mapQuery = encodeURIComponent(
  `${eventInfo.church.name}, ${eventInfo.church.address}`,
);

export default function ContactPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-4xl text-balance">Contact</h1>
        <p className="text-lg text-ink-muted">
          {eventInfo.church.name}, {eventInfo.church.address}.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl text-ink">Get in touch</h2>
        <ul className="flex flex-col gap-2 text-ink-muted">
          <li className="flex items-center gap-2">
            <Phone aria-hidden className="size-4 shrink-0" />
            <a
              href={`tel:${eventInfo.contact.phone}`}
              className={linkClassName}
            >
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
            <li className="flex items-center gap-2">
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
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl text-ink">Find us</h2>
        <p className="flex items-start gap-2 text-ink-muted">
          <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>
            {eventInfo.church.name}, {eventInfo.church.address}.
          </span>
        </p>
        <div className="overflow-hidden rounded-card ring-1 ring-line">
          <iframe
            title={`Map to ${eventInfo.church.name}, ${eventInfo.church.address}`}
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-72 w-full border-0"
          />
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex w-fit items-center gap-1 text-sm ${linkClassName}`}
        >
          Open in Google Maps
          <ExternalLink aria-hidden className="size-3.5" />
        </a>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl text-ink">Give</h2>
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
    </div>
  );
}
