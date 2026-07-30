import type { ReactNode } from "react";
import { TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title,
  description,
  icon: Icon = TriangleAlert,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-card border border-line bg-surface-muted px-6 py-12 text-center",
        className,
      )}
    >
      <Icon aria-hidden className="size-8 text-featured" />
      <p className="font-display text-lg text-ink">{title}</p>
      <p className="prose-column text-sm text-ink-muted">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
