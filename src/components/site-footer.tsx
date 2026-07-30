import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";
import { eventInfo } from "@/data";

// Routes the primary nav deliberately leaves out. The nav stays short;
// the footer carries the overflow so nothing is unreachable from the shell.
const moreLinks = [
  { href: "/prayer-requests", label: "Prayer Requests" },
  { href: "/announcements", label: "Announcements" },
  { href: "/downloads", label: "Downloads" },
  { href: "/faq", label: "FAQ" },
];

const socialLinks = [
  { href: eventInfo.social.facebook, label: "Facebook" },
  { href: eventInfo.social.youtube, label: "YouTube" },
  { href: eventInfo.social.instagram, label: "Instagram" },
  { href: eventInfo.social.twitter, label: "Twitter" },
  { href: eventInfo.social.linkedin, label: "LinkedIn" },
].filter((link) => link.href);

const linkClassName =
  "rounded-control hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500";

const headingClassName = "text-xs font-medium tracking-wide text-ink uppercase";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface-muted">
      <div className="shell grid gap-8 py-10 text-sm text-ink-muted sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1">
          <BrandLockup size="footer" className="mb-2" />
          <p>{eventInfo.church.address}</p>
          <p>
            <a href={`tel:${eventInfo.contact.phone}`} className={linkClassName}>
              {eventInfo.contact.phone}
            </a>
          </p>
          <p>
            <a
              href={`mailto:${eventInfo.contact.email}`}
              className={linkClassName}
            >
              {eventInfo.contact.email}
            </a>
          </p>
        </div>

        <nav aria-label="More" className="flex flex-col gap-2">
          <h2 className={headingClassName}>More</h2>
          {moreLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClassName}>
              {link.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Social" className="flex flex-col gap-2">
          <h2 className={headingClassName}>Follow</h2>
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex w-fit items-center gap-1 ${linkClassName}`}
            >
              {link.label}
              <ExternalLink aria-hidden className="size-3.5" />
            </a>
          ))}
        </nav>
      </div>

      {/* The rule spans the viewport; the line of type inside it sits on
          the shell, so the copyright starts where the lockup above it
          does rather than on its own margin. */}
      <div className="border-t border-line">
        <p className="shell py-4 text-center text-xs text-ink-muted">
          © {eventInfo.year} {eventInfo.church.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
