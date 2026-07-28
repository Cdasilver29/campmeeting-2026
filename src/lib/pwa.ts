/**
 * Constants shared between the service worker (src/sw.ts, bundled on its
 * own by esbuild) and the app that registers it.
 *
 * Deliberately free of imports. The service worker is a separate bundle
 * that ships to every visitor, so anything reachable from here ends up in
 * it — pulling in src/data would put the whole programme into the worker
 * as well as into the pages it caches.
 */

/** Where the compiled worker is served from. See src/app/serwist/[path]. */
export const SW_URL = "/serwist/sw.js";

/** Shown for any navigation the cache cannot answer. */
export const OFFLINE_ROUTE = "/offline";

/**
 * Hosts that must always go to the network and are never cached.
 *
 * The YouTube player and the Google Maps embed are third-party, both are
 * already behind a click or a lazy iframe, and neither is any use from
 * cache. Web3Forms is the forms endpoint: a cached response there would
 * mean telling someone their prayer request was delivered when it was
 * not. Matching is on the registrable suffix, so subdomains are covered.
 */
export const THIRD_PARTY_HOSTS = [
  "youtube.com",
  "youtube-nocookie.com",
  "ytimg.com",
  "ggpht.com",
  "google.com",
  "googleapis.com",
  "gstatic.com",
  "web3forms.com",
];

export function isThirdPartyHost(hostname: string): boolean {
  return THIRD_PARTY_HOSTS.some(
    (host) => hostname === host || hostname.endsWith(`.${host}`),
  );
}

/**
 * Query parameters that never change the HTML a route serves, so a
 * precached page can answer a request carrying them.
 *
 * Everything the programme browser puts in the URL is read on the client
 * from a page that is identical for every value (q, ministry, speaker,
 * view), which is what makes /schedule?view=mine work offline. `now` is
 * the development clock override, listed for the same reason.
 *
 * `day` is pointedly not here. /schedule?day=x is the legacy form of a
 * day link and src/middleware.ts redirects it to /schedule/x; letting the
 * precache answer it instead would swallow that redirect.
 */
export const CLIENT_ONLY_URL_PARAMS = [
  /^q$/,
  /^ministry$/,
  /^speaker$/,
  /^view$/,
  /^now$/,
  /^utm_/,
  /^fbclid$/,
];
