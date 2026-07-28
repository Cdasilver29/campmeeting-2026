/**
 * The origin this build is published at.
 *
 * Open Graph URLs, canonicals, the sitemap and the JSON-LD all have to be
 * absolute, and none of them can be resolved from the request because the
 * whole site is generated at build time. So it is read from the
 * environment, in order:
 *
 *   1. NEXT_PUBLIC_SITE_URL — the real domain, set on the production
 *      deployment. See .env.example.
 *   2. The Vercel deployment URL, so a preview build describes itself
 *      rather than claiming to be production. Pointing every preview at a
 *      hardcoded domain is how a preview ends up in a search index under
 *      the live site's canonical.
 *   3. localhost, for `pnpm dev` and `pnpm start`.
 */
function resolveSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return new URL(configured);

  // NEXT_PUBLIC_VERCEL_URL first: it is the one of the two that is also
  // readable if this ever gets imported from the client.
  const deployment =
    process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
  if (deployment) return new URL(`https://${deployment}`);

  return new URL(`http://localhost:${process.env.PORT ?? 3000}`);
}

export const siteUrl = resolveSiteUrl();

/** A site-relative path as an absolute URL. */
export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}
