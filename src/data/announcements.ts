import type { Announcement } from "./types";

/**
 * Programme updates published during camp meeting.
 *
 * Empty until the event runs. Newest first — `announcementsByDate` below
 * enforces that rather than relying on hand-ordering.
 *
 * When adding one, set `affectedSessionIds` to the ids from program.ts
 * that the notice changes so the schedule can mark those sessions.
 *
 * ── THAT PATH IS NOW LIVE, AND HAS BEEN RUN ──────────────────────────
 *
 * `affectedSessionIds` is read by SessionNotices
 * (features/schedule/components/session-notices.tsx) and surfaces on
 * /schedule, on /schedule/{day}, on the home page's Happening Now and on
 * its Next Up. Verified with two seeded announcements, one urgent on
 * `sabbath-15-song-service` and one normal on `tuesday-18-bible-study`,
 * plus a deliberately non-existent id in the first to confirm a stale id
 * is dropped silently. The seed was removed again; the empty array below
 * is the shipped state.
 *
 * An id that no longer exists in program.ts costs nothing and warns
 * about nothing. An announcement gets published in a hurry during camp
 * meeting week and a typo in one id must not be able to take a page down.
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
