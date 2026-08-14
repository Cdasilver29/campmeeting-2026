import Link from "next/link";
import { Info, TriangleAlert } from "lucide-react";
import { announcementsBySessionId, type Announcement } from "@/data";
import { announcementHref } from "@/features/announcements/lib/anchor";
import { cn } from "@/lib/utils";

/**
 * ── AN ANNOUNCEMENT, ON THE SESSION IT AMENDS ────────────────────────
 *
 * `affectedSessionIds` has been on the Announcement type since Phase 5
 * and this is the half of the loop that reads it. A reader on Friday's
 * day page finds out that the 09:50 moved without a trip to
 * /announcements and back.
 *
 * ── THE COMMON CASE COSTS NOTHING ────────────────────────────────────
 *
 * /schedule server-renders 238 entries and about 4,700 elements, and 237
 * of those entries will have no announcement on any given day. So this
 * returns `null` — not an empty <ul>, not a hidden wrapper — and a
 * session with no notice adds no node, no class and no lookup beyond one
 * miss on a plain object. The map itself is built once at module scope in
 * announcements.ts.
 *
 * ── STALE IDS ARE DROPPED SILENTLY ───────────────────────────────────
 *
 * announcementsBySessionId is keyed by whatever ids the announcements
 * carry, so an id the programme no longer has simply never matches a
 * session and never renders. Nothing warns and nothing throws: exactly
 * what a stale bookmark id already does when it is pruned. An
 * announcement is published in a hurry during camp meeting week and a
 * typo in one id must not be able to take a page down.
 *
 * ── URGENT IS NOT A COLOUR ───────────────────────────────────────────
 *
 * Both kinds differ in FOUR ways, of which colour is one:
 *
 *              icon              word        edge                 fill
 *   normal     Info, outline     "Update"    hairline all round   none
 *   urgent     TriangleAlert     "Urgent"    3px solid left edge  tinted
 *
 * The left edge is the part that works in greyscale and for a reader who
 * cannot separate the two hues: it changes the SHAPE of the notice, not
 * its colour. Same technique the mobile nav uses to mark the current
 * page, and the same reasoning.
 */

function SessionNotice({ notice }: { notice: Announcement }) {
  const urgent = notice.priority === "urgent";
  const Icon = urgent ? TriangleAlert : Info;

  return (
    <li>
      <Link
        href={announcementHref(notice.id)}
        className={cn(
          "flex items-start gap-1.5 rounded-control p-2 text-sm ring-1",
          "transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
          urgent
            ? // The inset shadow is the left edge. Inset rather than a
              // border so it does not move the padding and leave urgent
              // notices a pixel narrower than normal ones inside the same
              // grid cell.
              "bg-featured/10 ring-featured/40 shadow-[inset_3px_0_0_0_var(--color-featured)] hover:bg-featured/15"
            : "bg-surface-muted ring-line hover:bg-surface-muted/70",
        )}
      >
        <Icon
          aria-hidden
          className={cn(
            "mt-0.5 size-3.5 shrink-0",
            urgent ? "text-featured" : "text-ink-muted",
          )}
        />
        <span>
          <span className="font-medium text-ink">
            {urgent ? "Urgent" : "Update"}: {notice.title}
          </span>{" "}
          <span className="text-ink-muted">{notice.body}</span>
        </span>
      </Link>
    </li>
  );
}

/**
 * Every announcement amending this session, or nothing.
 *
 * `className` so a caller can place it: inside the session card's grid it
 * is a plain child, and on the home page's Next Up card it needs the same
 * column the title is in.
 */
export function SessionNotices({
  sessionId,
  className,
}: {
  sessionId: string;
  className?: string;
}) {
  const notices = announcementsBySessionId[sessionId];
  if (!notices || notices.length === 0) return null;

  return (
    <ul className={cn("flex flex-col gap-1.5", className)}>
      {notices.map((notice) => (
        <SessionNotice key={notice.id} notice={notice} />
      ))}
    </ul>
  );
}
