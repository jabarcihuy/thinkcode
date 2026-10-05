import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileBottomNavigation } from "@/components/layout/mobile-bottom-navigation";
import type { Account } from "@/lib/auth/session";


export function LearningHeader({ account }: { account: Account | null }) {
  return <>
    <header className="relative border-b border-border bg-white">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <Link className="inline-flex min-h-11 items-center text-lg font-semibold tracking-tight" href="/" aria-label="Quethink, beranda">Que<span className="text-live-ink">think</span></Link>
        <nav aria-label="Navigasi utama" className={account ? "hidden items-center gap-1 sm:gap-3 lg:flex" : "flex max-w-full flex-wrap items-center gap-1 sm:gap-3"}>
          {account ? <Button asChild variant="ghost" size="sm"><Link href="/dashboard">Dashboard</Link></Button> : <><Button asChild variant="ghost" size="sm"><Link href="/login">Masuk</Link></Button><Button asChild size="sm"><Link href="/register">Daftar</Link></Button></>}
        </nav>
      </div>
    </header>
    {account && <MobileBottomNavigation role={account.profile.role} />}
  </>;
}
