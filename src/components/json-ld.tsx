/**
 * Renders a JSON-LD document into the page.
 *
 * A plain script tag rather than next/script: structured data is inert
 * markup that crawlers read out of the HTML, so it wants to be in the
 * static output, not injected after hydration.
 *
 * `<` is escaped because the only way a JSON string can break out of a
 * script element is by containing "</script"; JSON.stringify does not
 * escape it on its own. The data is ours, but this is one character
 * against a whole class of injection.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
