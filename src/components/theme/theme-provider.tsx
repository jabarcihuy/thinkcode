"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";

export type ThemeChoice = "light" | "dark" | "system";
type ThemeContextValue = { theme: ThemeChoice; resolvedTheme: "light" | "dark"; setTheme: (theme: ThemeChoice) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);
const themeEvent = "thinkcode-theme-change";

function getThemeSnapshot(): ThemeChoice {
  const value = window.localStorage.getItem("thinkcode-theme");
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

function subscribeTheme(callback: () => void) {
  window.addEventListener(themeEvent, callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener(themeEvent, callback); window.removeEventListener("storage", callback); };
}

function subscribeSystemTheme(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getSystemThemeSnapshot() { return window.matchMedia("(prefers-color-scheme: dark)").matches; }

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, (): ThemeChoice => "system");
  const systemDark = useSyncExternalStore(subscribeSystemTheme, getSystemThemeSnapshot, () => false);
  const resolvedTheme: "light" | "dark" = theme === "system" ? systemDark ? "dark" : "light" : theme;
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "system");
    root.classList.add(theme);
    root.style.colorScheme = resolvedTheme;
  }, [theme, resolvedTheme]);
  const setTheme = useCallback((next: ThemeChoice) => {
    window.localStorage.setItem("thinkcode-theme", next);
    window.dispatchEvent(new Event(themeEvent));
  }, []);
  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used within ThemeProvider.");
  return value;
}
