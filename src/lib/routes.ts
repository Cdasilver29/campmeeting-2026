import { program, speakers } from "@/data";
import { ministryPages } from "@/features/ministries/copy";
import { dayPath } from "@/features/schedule/lib/url";

/**
 * Every page this site publishes, in one list.
 *
 * Two things consume it: the service worker's precache list
 * (src/app/serwist/[path]/route.ts) and the sitemap (src/app/sitemap.ts).
 * Sharing the derivation is the point — a programme update that adds or
 * renames a day cannot leave that day cached but unlisted, or listed but
 * uncached, because neither consumer keeps its own copy.
 *
 * The three dynamic segments are read from the data, never typed out. The
 * fixed pages are named, because there is no data behind them to read: a
 * page that exists only as a file in src/app has to be added here when it
 * is created. /styleguide is deliberately absent — it is a development
 * reference for the design system, not part of the published site.
 */

/** Pages that exist regardless of what the programme says. */
const fixedRoutes = [
  "/",
  "/schedule",
  "/speakers",
  "/ministries",
  "/announcements",
  "/livestream",
  "/gallery",
  "/about",
  "/contact",
  "/faq",
  "/downloads",
  "/prayer-requests",
] as const;

/** One page per programme day. */
export const dayRoutes: string[] = program.map((day) => dayPath(day.id));

/** One page per speaker in event.ts. */
export const speakerRoutes: string[] = speakers.map(
  (speaker) => `/speakers/${speaker.id}`,
);

/** One page per ministry with a destination of its own. */
export const ministryRoutes: string[] = ministryPages.map(
  (tag) => `/ministries/${tag}`,
);

/**
 * Every published route.
 *
 * /offline is not one of them. It is precached like any other page (see
 * src/lib/pwa.ts) but it is a service worker implementation detail, so it
 * stays out of the sitemap and out of search results.
 */
export const siteRoutes: string[] = [
  ...fixedRoutes,
  ...dayRoutes,
  ...speakerRoutes,
  ...ministryRoutes,
];
