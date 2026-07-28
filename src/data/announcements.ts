import type { Announcement } from "./types";

/**
 * Programme updates published during camp meeting.
 *
 * Empty until the event runs. Newest first — `announcementsByDate` below
 * enforces that rather than relying on hand-ordering.
 *
 * When adding one, set `affectedSessionIds` to the ids from program.ts
 * that the notice changes so the schedule can mark those sessions.
 */
export const announcements: Announcement[] = [
  // {
  //   id: "sabbath-15-heart-of-worship-move",
  //   publishedAt: "2026-08-15T07:40:00+03:00",
  //   title: "Heart of Worship moved to 10:00",
  //   body: "The printed 09:50 start slipped ten minutes for a sound check. Divine Service itself is unaffected.",
  //   priority: "normal",
  //   affectedSessionIds: ["sabbath-15-heart-of-worship"],
  // },
];

/** Newest first. */
export const announcementsByDate: Announcement[] = [...announcements].sort(
  (a, b) => b.publishedAt.localeCompare(a.publishedAt),
);

/** Session id -> announcements amending it. */
export const announcementsBySessionId: Record<string, Announcement[]> = {};
for (const announcement of announcementsByDate) {
  for (const sessionId of announcement.affectedSessionIds ?? []) {
    (announcementsBySessionId[sessionId] ??= []).push(announcement);
  }
}
