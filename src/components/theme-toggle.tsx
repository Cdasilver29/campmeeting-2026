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
      // 48px PAINTED below lg, not a 32px control with a 44px hit area
      // hung off a pseudo-element. The old note said growing the button
      // would push the header past --spacing-header; that turns out not to
      // be true, and it is worth writing down why. --spacing-header is
      // 5rem, 80px, and the brand mark beside this is already `size-12`,
      // 48px. A 48px control is therefore no taller than something the
      // header already contains, and 80px still leaves 16px above and
      // below it. What could not have grown was a 44px control, because
      // 44 is not a step on the spacing scale and would have needed an
      // arbitrary value.
      //
      // A real 48px box is better than a 48px pseudo-element for two
      // reasons beyond the measurement: the hover and focus rings paint at
      // the size of the target rather than a third of it, and
      // tools/perf/responsive.mjs stops needing its hit-area filter to
      // score this control correctly.
      //
      // lg:size-8 keeps the compact desktop size. 48px up to lg, the
      // original size above it, is the same split every form control and
      // filter on the site already follows.
      //
      // THE PSEUDO-ELEMENT COMES BACK AT lg, AND ONLY AT lg. Deleting it
      // outright was a silent desktop regression: this control used to
      // carry a 44px hit area at EVERY width, so dropping it in favour of
      // a 48px painted box below lg left the desktop toggle a genuine
      // 32px target where it had been 44px. tools/perf/responsive.mjs
      // caught it as 40 new findings at 1024 and above. Below lg the
      // painted box is 48px and needs no help; at lg the painted box goes
      // back to 32px and the hit area goes back with it, so desktop
      // behaviour is exactly what it was before this pass.
      className="size-12 lg:relative lg:size-8 lg:before:absolute lg:before:-inset-1.5 lg:before:content-[''] group-data-[header-state=transparent]/header:text-white"
    >
      {/* Sized to the control. The Button base sets any unsized svg to
          size-4, which inside a 48px box is a 16px glyph adrift in it. */}
      {isDark ? (
        <Sun aria-hidden className="size-6 lg:size-4" />
      ) : (
        <Moon aria-hidden className="size-6 lg:size-4" />
      )}
    </Button>
  );
}
