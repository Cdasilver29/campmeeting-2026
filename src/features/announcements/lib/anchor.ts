/**
 * Where an announcement lives on /announcements, and how anything else
 * links to it.
 *
 * One module because three callers need to agree character for character:
 * the list, which paints the id onto the article; the inline notice on a
 * session card, which links to it; and the list's own mount-time scroll,
 * which has to find it. A hash that is built in two places is a hash that
 * is wrong in one of them.
 *
 * Prefixed rather than bare. Announcement ids are authored strings from
 * announcements.ts and an id like "programme" would otherwise collide
 * with whatever else on the page carries that id.
 */
export const ANNOUNCEMENT_ANCHOR_PREFIX = "notice-";

export function announcementAnchor(id: string): string {
  return `${ANNOUNCEMENT_ANCHOR_PREFIX}${id}`;
}

export function announcementHref(id: string): string {
  return `/announcements#${announcementAnchor(id)}`;
}
