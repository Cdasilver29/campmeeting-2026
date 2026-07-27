import { ExternalLink } from "lucide-react";
import { eventInfo } from "@/data";

const socialLinks = [
  { href: eventInfo.social.facebook, label: "Facebook" },
  { href: eventInfo.social.youtube, label: "YouTube" },
  { href: eventInfo.social.instagram, label: "Instagram" },
  { href: eventInfo.social.twitter, label: "Twitter" },
  { href: eventInfo.social.linkedin, label: "LinkedIn" },
].filter((link) => link.href);

const linkClassName =
  "rounded-control hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface-muted">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10 text-sm text-ink-muted sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-display text-base text-ink">
            {eventInfo.church.name}
          </p>
          <p>{eventInfo.church.address}</p>
          <p>
            <a href={`tel:${eventInfo.contact.phone}`} className={linkClassName}>
              {eventInfo.contact.phone}
            </a>
          </p>
          <p>
            <a href={`mailto:${eventInfo.contact.email}`} className={linkClassName}>
              {eventInfo.contact.email}
            </a>
          </p>
        </div>

        <nav aria-label="Social" className="flex flex-col gap-2 sm:items-end">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1 ${linkClassName}`}
            >
              {link.label}
              <ExternalLink aria-hidden className="size-3.5" />
            </a>
          ))}
        </nav>
      </div>

      <div className="border-t border-line px-6 py-4 text-center text-xs text-ink-muted">
        © {eventInfo.year} {eventInfo.church.name}. All rights reserved.
      </div>
    </footer>
  );
}
