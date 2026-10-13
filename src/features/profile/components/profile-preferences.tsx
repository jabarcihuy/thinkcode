"use client";
import { LanguageSwitcher } from "@/i18n/language-switcher";
import { useText } from "@/i18n/use-text";
export function ProfilePreferences() {
  const tx = useText();
  return <section aria-labelledby="profile-language" className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
    <h2 id="profile-language" className="font-semibold">{tx("Bahasa aplikasi")}</h2><LanguageSwitcher />
  </section>;
}
