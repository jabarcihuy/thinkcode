"use client";

import { useText } from "@/i18n/use-text";

import { useTransition, useState } from "react";
import { useLocale } from "next-intl";
import { Languages } from "lucide-react";
import { changeLocale } from "./actions";
import { resolveLocale, type Locale } from "./config";
export function LanguageSwitcher() {
  const tx = useText();

  const locale = resolveLocale(useLocale());
  const [pending, start] = useTransition();
  const [error, setError] = useState(false);
  return <div className="flex shrink-0 flex-col items-end gap-1">
    <label className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-2.5 text-sm text-foreground">
      <Languages size={16} aria-hidden="true" />
      <span className="sr-only">{tx(locale === "en" ? "Language" : "Bahasa")}</span>
      <select value={locale} disabled={pending} aria-busy={pending} onChange={event => {
        const next = event.target.value as Locale;
        start(async () => { try { setError(false); await changeLocale(next); try { localStorage.setItem("quethink:language", next); } catch {} } catch { setError(true); } });
      }} className="min-h-11 max-w-28 bg-transparent font-medium focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50">
        <option value="en">{tx("English")}</option><option value="id">{tx("Indonesia")}</option>
      </select>
    </label>
    {error && <p role="alert" className="max-w-40 text-xs text-destructive">{tx(locale === "en" ? "Could not change language. Try again." : "Bahasa belum dapat diganti. Coba lagi.")}</p>}
  </div>;
}
