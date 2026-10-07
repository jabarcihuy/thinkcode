
import { useText } from "@/i18n/use-text";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { MobileBottomNavigation } from "@/components/layout/mobile-bottom-navigation";
import { QuethinkLogo } from "@/components/layout/quethink-logo";
import type { Account } from "@/lib/auth/session";
export function LearningHeader({ account }: { account: Account | null }) {
  const tx = useText();

 if (account) return <><DashboardHeader role={account.profile.role} /><MobileBottomNavigation role={account.profile.role} /></>;
 return <header className="relative border-b border-border bg-white"><div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8"><Link className="inline-flex min-h-11 items-center text-lg font-semibold tracking-tight" href="/" aria-label={tx("Quethink, beranda")}><QuethinkLogo /></Link><nav aria-label={tx("Navigasi utama")} className="flex max-w-full flex-wrap items-center gap-1 sm:gap-3"><Button asChild variant="ghost" size="sm"><Link href="/login">{tx("Masuk")}</Link></Button><Button asChild size="sm"><Link href="/register">{tx("Daftar")}</Link></Button></nav></div></header>;
}
