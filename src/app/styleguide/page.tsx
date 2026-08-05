import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Style guide | Camp Meeting 2026",
  description: "Phase 1 design system reference: tokens, type, and primitives.",
  alternates: { canonical: "/styleguide" },
  // A development reference, not part of the published site: it is absent
  // from the sitemap and disallowed in robots.ts, and this is the part
  // that holds if a crawler reaches it anyway.
  robots: { index: false, follow: false },
};

/**
 * `fg` is optional, and its absence is information.
 *
 * A swatch carries type ONLY where the site ships type on that fill. The
 * previous version put a label on every swatch, which meant this page —
 * whose entire job is to show what passes — was itself rendering 2.3:1
 * white on amber and 4.1:1 white on green. The mid-tones in the palette
 * cannot carry small text against either white or ink, by definition:
 * that is what "no headroom" means. So they are shown as colour, and the
 * name and the measurement sit underneath on the page surface.
 */
const swatches: Array<{
  group: string;
  name: string;
  cssVar: string;
  value: string;
  role: string;
  bg: string;
  fg?: string;
  border?: boolean;
}> = [
  // ── The official palette ────────────────────────────────────────────
  // Under its own names, with the measured on-white ratio and the use it
  // permits. This group is the source; every group below it is a mapping.
  { group: "Palette — safe for text", name: "emperor", cssVar: "--color-emperor", value: "#4b207f", role: "11.59:1 on white. The primary. Anchors the poster.", bg: "bg-emperor", fg: "text-white" },
  { group: "Palette — safe for text", name: "earth", cssVar: "--color-earth", value: "#5e3929", role: "10.03:1 on white. Warm neutral; the community family.", bg: "bg-earth" },
  { group: "Palette — safe for text", name: "grapevine", cssVar: "--color-grapevine", value: "#7f264a", role: "9.22:1 on white. Hover, eyebrow, featured.", bg: "bg-grapevine", fg: "text-white" },
  { group: "Palette — safe for text", name: "denim", cssVar: "--color-denim", value: "#2f557f", role: "7.70:1 on white. The word family.", bg: "bg-denim" },
  { group: "Palette — safe for text", name: "cool", cssVar: "--color-cool", value: "#4d7549", role: "5.31:1 on white. Safe, least headroom. Currently unmapped.", bg: "bg-cool" },
  { group: "Palette — fills and borders only", name: "ming", cssVar: "--color-ming", value: "#3e8391", role: "4.32:1 on white. AA with no headroom — tags and fills, not body copy.", bg: "bg-ming" },
  { group: "Palette — fills and borders only", name: "tree-frog", cssVar: "--color-treefrog", value: "#448d21", role: "4.14:1 on white. AA with no headroom — the live indicator.", bg: "bg-treefrog" },
  { group: "Palette — fills and borders only", name: "campfire", cssVar: "--color-campfire", value: "#e36520", role: "3.42:1 on white. FAILS as text. Icons and fills only — the bookmark.", bg: "bg-campfire" },
  { group: "Palette — dark grounds only", name: "warm", cssVar: "--color-warm", value: "#ffa92d", role: "1.92:1 on white — FAILS AS TEXT ON WHITE. 6.84:1 on the poster plum, 9.39:1 on the dark surface, 4.81:1 on the share card's Emperor-to-Grapevine ground. Dark grounds only: the hero and the share card's rule and eyebrow. There is no semantic token pointing at it, so it has to be asked for by name.", bg: "bg-warm" },

  // ── Superseded ──────────────────────────────────────────────────────
  { group: "Superseded — navy (do not use)", name: "navy-950", cssVar: "--color-navy-950", value: "#031635", role: "Reverse-engineered from the parent theme. Nothing references it. Removed in a follow-up commit.", bg: "bg-navy-950" },
  { group: "Superseded — navy (do not use)", name: "navy-900", cssVar: "--color-navy-900", value: "#052252", role: "Superseded by Emperor.", bg: "bg-navy-900" },
  { group: "Superseded — navy (do not use)", name: "navy-800", cssVar: "--color-navy-800", value: "#0d3170", role: "Superseded.", bg: "bg-navy-800" },
  { group: "Superseded — navy (do not use)", name: "navy-700", cssVar: "--color-navy-700", value: "#133c86", role: "Superseded.", bg: "bg-navy-700" },

  { group: "Interactive", name: "accent-700", cssVar: "--color-accent-700", value: "#301451 (dark: #9d85b9)", role: "Pressed. Emperor darkened; 15.62:1 with white on it.", bg: "bg-accent-700", fg: "text-primary-foreground" },
  { group: "Interactive", name: "accent-600", cssVar: "--color-accent-600", value: "#7f264a (dark: #c59cad)", role: "Hover, and the page-header eyebrow. Grapevine — a hue step, not a darkening, because Emperor at 11.59 has nowhere darker to visibly go.", bg: "bg-accent-600", fg: "text-primary-foreground" },
  { group: "Interactive", name: "accent-500", cssVar: "--color-accent-500", value: "#4b207f (dark: #b89ae0)", role: "Emperor. Ring, focus outline, primary fill. 11.59:1 on white — unlike the blue it replaced, it can carry text.", bg: "bg-accent-500", fg: "text-primary-foreground" },
  { group: "Interactive", name: "accent-300", cssVar: "--color-accent-300", value: "#b89ae0", role: "Lightened Emperor for dark surfaces, 7.48:1.", bg: "bg-accent-300", fg: "text-emperor" },
  { group: "Interactive", name: "accent-50", cssVar: "--color-accent-50", value: "#f2eff6 (dark: #331550)", role: "Subtle accent fills; the secondary chip.", bg: "bg-accent-50", fg: "text-secondary-foreground", border: true },

  { group: "Neutrals", name: "surface", cssVar: "--color-surface", value: "#ffffff (dark: #1f0d35)", role: "Page background", bg: "bg-surface", fg: "text-ink", border: true },
  { group: "Neutrals", name: "surface-muted", cssVar: "--color-surface-muted", value: "#f8f7fa (dark: #271041)", role: "Muted panels", bg: "bg-surface-muted", fg: "text-ink", border: true },
  { group: "Neutrals", name: "surface-warm", cssVar: "--color-surface-warm", value: "#eeebe9 (dark: #281912)", role: "Call-to-action band. Derived from Earth.", bg: "bg-surface-warm", fg: "text-ink", border: true },
  { group: "Neutrals", name: "ink", cssVar: "--color-ink", value: "#251637 (dark: #f2eef6)", role: "Body text, 16.82:1 on white", bg: "bg-ink", fg: "text-surface" },
  { group: "Neutrals", name: "ink-muted", cssVar: "--color-ink-muted", value: "#68597a (dark: #d2c7df)", role: "Secondary text, 6.37:1 on white", bg: "bg-ink-muted", fg: "text-surface" },
  { group: "Neutrals", name: "line", cssVar: "--color-line", value: "#eae6f0 (dark: #451e75)", role: "Borders, dividers", bg: "bg-line", fg: "text-ink" },

  { group: "Semantic", name: "featured", cssVar: "--color-featured", value: "#7f264a (dark: #c398aa)", role: "Featured-session marker. Grapevine, because this fill carries a label: 9.22:1 light, 7.19:1 dark.", bg: "bg-featured", fg: "text-featured-foreground" },
  { group: "Semantic", name: "live", cssVar: "--color-live", value: "#448d21", role: "Current-session indicator. Tree Frog, a 10px dot and never text: 4.14:1 on white against a 3:1 floor.", bg: "bg-live" },
  { group: "Semantic", name: "bookmark", cssVar: "--color-bookmark", value: "#e36520", role: "Saved-session marker. Campfire, a 16px icon and never text: 3.42:1 on white against a 3:1 floor.", bg: "bg-bookmark" },
];

const swatchGroups = Array.from(new Set(swatches.map((s) => s.group)));

const typeScale: Array<{
  className: string;
  label: string;
  size: string;
  role: string;
  font: "display" | "sans";
}> = [
  { className: "text-xs", label: "text-xs", size: "12px", role: "Fine print, legal", font: "sans" },
  { className: "text-sm", label: "text-sm", size: "14px", role: "Captions, meta, nav", font: "sans" },
  { className: "text-base", label: "text-base", size: "16px", role: "Body copy", font: "sans" },
  { className: "text-lg", label: "text-lg", size: "18px", role: "Lead paragraphs", font: "sans" },
  { className: "text-xl", label: "text-xl", size: "20px", role: "Card titles", font: "sans" },
  { className: "text-2xl", label: "text-2xl", size: "24px", role: "Subsection headings", font: "sans" },
  { className: "text-3xl", label: "text-3xl", size: "30px", role: "Section headings", font: "display" },
  { className: "text-4xl", label: "text-4xl", size: "36px", role: "Larger section headings", font: "display" },
  { className: "text-5xl", label: "text-5xl", size: "48px", role: "Page headings", font: "display" },
  { className: "text-6xl", label: "text-6xl", size: "60px", role: "Hero on tablet and up", font: "display" },
  { className: "text-hero", label: "text-hero", size: "clamp(44px, 5vw, 88px)", role: "Hero title, fluid", font: "display" },
];

function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2 id={id} className="font-display text-3xl text-ink">
      {children}
    </h2>
  );
}

export default function StyleguidePage() {
  return (
    <div className="shell band flex flex-col gap-(--space-band)">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm tracking-wide text-ink-muted uppercase">
            Phase 1 — design system
          </p>
          <h1 className="font-display text-5xl text-ink">Style guide</h1>
          <p className="prose-column text-ink-muted">
            Every color token, type step, and UI primitive in one place, in
            both themes.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section aria-labelledby="colors" className="flex flex-col gap-8">
        <SectionHeading id="colors">Color</SectionHeading>
        {swatchGroups.map((group) => (
          <div key={group} className="flex flex-col gap-3">
            <h3 className="text-sm tracking-wide text-ink-muted uppercase">
              {group}
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {swatches
                .filter((s) => s.group === group)
                .map((s) => (
                  <div key={s.name} className="flex flex-col gap-2">
                    {/* The colour itself. Type appears on it only where
                        `fg` is set, which is only where the site puts
                        type on that fill; see the note on the array. */}
                    <div
                      className={`flex h-24 items-end rounded-card p-3 ${s.bg} ${
                        s.fg ?? ""
                      } ${s.border ? "border border-line" : ""}`}
                    >
                      {s.fg ? (
                        <span className="text-sm font-medium">
                          Aa {s.name}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-0.5 text-ink">
                      <span className="text-xs font-medium">{s.name}</span>
                      <span className="text-xs tabular-figures text-ink-muted">
                        {s.value}
                      </span>
                      <span className="text-xs text-ink-muted">{s.role}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </section>

      <section aria-labelledby="type" className="flex flex-col gap-6">
        <SectionHeading id="type">Type scale</SectionHeading>
        <div className="flex flex-col divide-y divide-line rounded-card border border-line">
          {typeScale.map((step) => (
            <div
              key={step.className}
              className="flex flex-wrap items-baseline justify-between gap-4 p-4"
            >
              <span
                className={
                  step.font === "display"
                    ? `font-display ${step.className} text-ink`
                    : `font-sans ${step.className} text-ink`
                }
              >
                Camp Meeting
              </span>
              {/* Was whitespace-nowrap, which pushed the document 110px
                  past a 360px viewport and gave the whole site a
                  horizontal scrollbar at that width. The label is a
                  four-part description and there is no reason it cannot
                  wrap. */}
              <span className="text-sm text-ink-muted">
                {step.label} · {step.size} · font-{step.font} · {step.role}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="buttons" className="flex flex-col gap-6">
        <SectionHeading id="buttons">Button</SectionHeading>
        <p className="text-sm text-ink-muted">
          Hover and tab through the buttons below to see the live hover and
          focus states — the ring is on-brand accent in both themes.
        </p>
        <div className="flex flex-col gap-4">
          {(
            ["default", "outline", "secondary", "ghost", "destructive", "link"] as const
          ).map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-3">
              <span className="w-24 shrink-0 text-sm text-ink-muted">
                {variant}
              </span>
              <Button variant={variant}>Default</Button>
              <Button variant={variant} disabled>
                Disabled
              </Button>
              <Button variant={variant} disabled>
                <Loader2 aria-hidden className="animate-spin" />
                Loading
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="badges" className="flex flex-col gap-6">
        <SectionHeading id="badges">Badge</SectionHeading>
        <div className="flex flex-wrap gap-3">
          {(
            ["default", "secondary", "outline", "destructive", "ghost"] as const
          ).map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      </section>

      <section aria-labelledby="inputs" className="flex flex-col gap-6">
        <SectionHeading id="inputs">Input</SectionHeading>
        <p className="text-sm text-ink-muted">
          Focus an input to see the live focus ring.
        </p>
        <div className="grid max-w-md gap-3">
          <Input placeholder="Default" />
          <Input placeholder="Disabled" disabled />
          <Input defaultValue="Filled" />
          <Input aria-invalid placeholder="Invalid" />
        </div>
      </section>

      <section aria-labelledby="textarea" className="flex flex-col gap-6">
        <SectionHeading id="textarea">Textarea</SectionHeading>
        <div className="grid max-w-md gap-3">
          <Textarea placeholder="Default" />
          <Textarea placeholder="Disabled" disabled />
          <Textarea defaultValue="Filled" />
          <Textarea aria-invalid placeholder="Invalid" />
        </div>
      </section>

      <section aria-labelledby="card" className="flex flex-col gap-6">
        <SectionHeading id="card">Card</SectionHeading>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Sabbath Divine Service</CardTitle>
            <CardDescription>15 Aug · 09:00–10:30</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink-muted">
              Opening Sabbath of Camp Meeting 2026, with Pr. Kennedy Mfune.
            </p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Bookmark</Button>
          </CardFooter>
        </Card>
      </section>

      <section aria-labelledby="skeleton" className="flex flex-col gap-6">
        <SectionHeading id="skeleton">Skeleton</SectionHeading>
        <div className="flex max-w-sm flex-col gap-3 rounded-card border border-line p-4">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </section>

      <section aria-labelledby="empty" className="flex flex-col gap-6">
        <SectionHeading id="empty">Empty state</SectionHeading>
        <EmptyState
          title="No sessions match your filters"
          description="Try clearing the ministry tag or search term."
          action={<Button variant="outline">Clear filters</Button>}
        />
      </section>

      <section aria-labelledby="error" className="flex flex-col gap-6">
        <SectionHeading id="error">Error state</SectionHeading>
        <ErrorState
          title="The schedule didn't load"
          description="Check your connection and try again."
          action={<Button>Retry</Button>}
        />
      </section>
    </div>
  );
}
