/// <reference lib="webworker" />

import { defaultCache } from "@serwist/turbopack/worker";
import { NetworkOnly, Serwist } from "serwist";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  CLIENT_ONLY_URL_PARAMS,
  OFFLINE_ROUTE,
  isThirdPartyHost,
} from "@/lib/pwa";

/**
 * The offline half of the campground problem.
 *
 * One bar of signal has to be enough to read the programme, so every page
 * the site publishes is precached on the first visit — the list comes
 * from the data, in src/app/serwist/[path]/route.ts — and served from the
 * cache from then on. This file is bundled separately by esbuild and
 * served from /serwist/sw.js; it is not part of the page bundle.
 */

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    /** Injected at build time: the app shell plus every published route. */
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    // Off by default in Serwist. Without it a deploy leaves the previous
    // build's precache sitting in storage, and the campground phone that
    // most needs the space is the one that runs out of it.
    cleanupOutdatedCaches: true,
    ignoreURLParametersMatching: CLIENT_ONLY_URL_PARAMS,
  },
  // Take over as soon as a new build lands, rather than waiting for every
  // tab to close. Precache entries are revisioned per deploy, so this is
  // what stops a phone that has been open all week serving last week's
  // programme after a programme update.
  skipWaiting: true,
  clientsClaim: true,
  // Off deliberately. Navigation preload starts a network request in
  // parallel with the service worker, and almost every navigation here is
  // answered from the precache, so the preload would be paid for on
  // mobile data and then thrown away.
  navigationPreload: false,
  runtimeCaching: [
    // Ahead of defaultCache, whose last rule would otherwise put every
    // cross-origin response into a "cross-origin" cache — including the
    // YouTube player and the Google Maps embed.
    {
      matcher: ({ url }) => isThirdPartyHost(url.hostname),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: OFFLINE_ROUTE,
        // Top-level documents only. An embedded map or player has
        // destination "iframe" and should fail as an embed rather than
        // render the offline page inside the frame.
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
