"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/**
 * TEMPORARY Phase 0 scaffolding, only so the token rendering can be checked
 * in both themes. The real toggle is Phase 2. Delete this file then.
 */
export function DevThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="rounded-control border border-line px-3 py-1.5 text-sm text-ink-muted transition-colors duration-fast hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
    >
      {mounted ? `Switch to ${next} mode` : "Switch theme"}
    </button>
  );
}
