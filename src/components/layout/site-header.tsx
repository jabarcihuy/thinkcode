
import { useText } from "@/i18n/use-text";
import { LanguageSwitcher } from "@/i18n/language-switcher";
import { QuethinkLogo } from "@/components/layout/quethink-logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";


export function SiteHeader() {
  const tx = useText();

  return (
    <header className="relative border-b border-border bg-white">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-3 sm:px-8">
        <Link className="inline-flex min-h-11 items-center text-lg font-semibold tracking-tight" href="/" aria-label={tx("Quethink, beranda")}>
          <QuethinkLogo />
        </Link>
        <LanguageSwitcher /><nav aria-label={tx("Navigasi utama")} className="flex w-full max-w-full flex-wrap items-center justify-end gap-1 min-[480px]:w-auto sm:gap-3">
          <Button asChild variant="ghost" size="sm"><Link href="/login">{tx("Masuk")}</Link></Button>
          <Button asChild size="sm"><Link href="/register">{tx("Daftar")}</Link></Button>
        </nav>
      </div>
    </header>
  );
}
