"use client";

import { useTheme } from "@/components/theme/theme-provider";

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();
  return <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
    <span className="sr-only">Color theme</span>
    <select aria-label="Color theme" value={theme} onChange={(event) => setTheme(event.target.value as "light" | "dark" | "system")} className="min-h-10 rounded-md border border-border bg-background px-2 text-foreground focus-visible:outline-2 focus-visible:outline-ring">
      <option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option>
    </select>
  </label>;
}
