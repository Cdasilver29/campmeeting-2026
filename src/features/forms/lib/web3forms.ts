/**
 * The Web3Forms access key is public by design — it is an alias for a
 * delivery email address, not a secret — so it ships in the client bundle
 * via NEXT_PUBLIC_WEB3FORMS_KEY rather than being proxied through a server
 * route. Web3Forms rejects server-side submissions on the free plan
 * anyway, and this site has no backend to proxy through.
 *
 * This module is imported (transitively) by the contact form, which is
 * statically rendered at build time, so a missing key fails `pnpm build`
 * here rather than shipping a form that silently cannot submit.
 */
const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

if (!accessKey) {
  throw new Error(
    "NEXT_PUBLIC_WEB3FORMS_KEY is not set. Copy .env.example to .env.local " +
      "and set it to a real Web3Forms access key — the contact form cannot " +
      "submit without it.",
  );
}

export const web3formsAccessKey = accessKey;

export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
