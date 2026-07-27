import { NextResponse, type NextRequest } from "next/server";
import { getDay } from "@/data";
import { dayPath, SCHEDULE_PATH } from "@/features/schedule/lib/url";

/**
 * The day used to be a query param, /schedule?day=friday-21, before each
 * day became a page of its own. Links shared in that form keep working:
 * they are sent on to the day's page with their other filters intact.
 *
 * A redirect rule in next.config.ts would do most of this, but it copies
 * the whole query string across, leaving the answered ?day= behind on
 * the new URL for the reader to re-share. Rewriting the URL here drops
 * that one param and keeps the rest.
 *
 * A day the programme does not have (a typo, or an id renamed by a
 * programme update) widens to the whole programme instead of 404ing,
 * which is the failure a reader can recover from.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const day = url.searchParams.get("day");
  if (!day) return NextResponse.next();

  url.searchParams.delete("day");
  url.pathname = getDay(day) ? dayPath(day) : SCHEDULE_PATH;
  return NextResponse.redirect(url, 308);
}

/** Only the old programme URL. Every other route is untouched. */
export const config = { matcher: "/schedule" };
