"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
      // White over the hero photograph, for the same reason the lockup and
      // the nav are. Inert anywhere without the header's state attribute.
      //
      // The pseudo-element takes a 32px control to a 44px hit area without
      // changing anything painted. Growing the button itself would push
      // the header past --spacing-header, which the hero's -mt-header and
      // the day rail's sticky offset both read.
      className="relative before:absolute before:-inset-1.5 before:content-[''] group-data-[header-state=transparent]/header:text-white"
    >
      {isDark ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </Button>
  );
}
