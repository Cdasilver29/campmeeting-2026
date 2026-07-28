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
};

const swatches: Array<{
  group: string;
  name: string;
  cssVar: string;
  value: string;
  role: string;
  bg: string;
  fg: string;
  border?: boolean;
}> = [
  { group: "Brand — navy", name: "navy-950", cssVar: "--color-navy-950", value: "#031635", role: "Deepest header/footer surfaces", bg: "bg-navy-950", fg: "text-white" },
  { group: "Brand — navy", name: "navy-900", cssVar: "--color-navy-900", value: "#052252", role: "Program header bars, copyright bar", bg: "bg-navy-900", fg: "text-white" },
  { group: "Brand — navy", name: "navy-800", cssVar: "--color-navy-800", value: "#0d3170", role: "Deep brand surfaces", bg: "bg-navy-800", fg: "text-white" },
  { group: "Brand — navy", name: "navy-700", cssVar: "--color-navy-700", value: "#133c86", role: "Brand surfaces, 10.40:1 on white", bg: "bg-navy-700", fg: "text-white" },
  { group: "Brand — accent", name: "accent-700", cssVar: "--color-accent-700", value: "#2053b3", role: "Pressed state", bg: "bg-accent-700", fg: "text-white" },
  { group: "Brand — accent", name: "accent-600", cssVar: "--color-accent-600", value: "#265ec9", role: "Hover state, 5.95:1 on white", bg: "bg-accent-600", fg: "text-white" },
  { group: "Brand — accent", name: "accent-500", cssVar: "--color-accent-500", value: "#2e6de7 (dark: #7ea6f2)", role: "Interactive surfaces only — 4.71:1 on white, never body text", bg: "bg-accent-500", fg: "text-white" },
  { group: "Brand — accent", name: "accent-300", cssVar: "--color-accent-300", value: "#7ea6f2", role: "Accent as text on dark surfaces, 7.37:1", bg: "bg-accent-300", fg: "text-navy-950" },
  { group: "Brand — accent", name: "accent-50", cssVar: "--color-accent-50", value: "#eef3fd", role: "Subtle accent fills", bg: "bg-accent-50", fg: "text-ink", border: true },
  { group: "Neutrals", name: "surface", cssVar: "--color-surface", value: "#ffffff (dark: #031635)", role: "Page background", bg: "bg-surface", fg: "text-ink", border: true },
  { group: "Neutrals", name: "surface-muted", cssVar: "--color-surface-muted", value: "#f5f7fa (dark: #041b42)", role: "Muted panels", bg: "bg-surface-muted", fg: "text-ink", border: true },
  { group: "Neutrals", name: "surface-warm", cssVar: "--color-surface-warm", value: "#ecebe9 (dark: #041b42)", role: "Call-to-action band", bg: "bg-surface-warm", fg: "text-ink", border: true },
  { group: "Neutrals", name: "ink", cssVar: "--color-ink", value: "#10202e (dark: #eaf0fd)", role: "Body text, 16.56:1 on white", bg: "bg-ink", fg: "text-surface" },
  { group: "Neutrals", name: "ink-muted", cssVar: "--color-ink-muted", value: "#4e6274 (dark: #b6ccf7)", role: "Secondary text, 6.32:1 on white", bg: "bg-ink-muted", fg: "text-surface" },
  { group: "Neutrals", name: "line", cssVar: "--color-line", value: "#e2e8ef (dark: #0d3170)", role: "Borders, dividers", bg: "bg-line", fg: "text-ink" },
  { group: "Semantic", name: "featured", cssVar: "--color-featured", value: "#c8271d", role: "Featured-session marker, use sparingly", bg: "bg-featured", fg: "text-white" },
  { group: "Semantic", name: "live", cssVar: "--color-live", value: "#16a34a", role: "Current-session indicator", bg: "bg-live", fg: "text-white" },
  { group: "Semantic", name: "bookmark", cssVar: "--color-bookmark", value: "#d97706", role: "Saved-session marker", bg: "bg-bookmark", fg: "text-white" },
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
    <div className="mx-auto flex max-w-4xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm tracking-wide text-ink-muted uppercase">
            Phase 1 — design system
          </p>
          <h1 className="font-display text-5xl text-ink">Style guide</h1>
          <p className="max-w-prose text-ink-muted">
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
                  <div
                    key={s.name}
                    className={`flex flex-col justify-between gap-8 rounded-card p-3 ${s.bg} ${s.fg} ${
                      s.border ? "border border-line" : ""
                    }`}
                  >
                    <span className="text-xs font-medium">{s.name}</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs tabular-figures opacity-90">
                        {s.value}
                      </span>
                      <span className="text-xs opacity-75">{s.role}</span>
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
              <span className="whitespace-nowrap text-sm text-ink-muted">
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
