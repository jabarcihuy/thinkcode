import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSelect } from "@/components/theme/theme-select";
import type { Account } from "@/lib/auth/session";

export function LearningHeader({ account }: { account: Account | null }) {
  return <header className="border-b border-border">
    <div className="mx-auto flex min-h-18 max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
      <Link className="text-lg font-bold tracking-tight" href="/">Think<span className="text-primary">Code</span></Link>
      <nav aria-label="Navigasi utama" className="flex max-w-full flex-wrap items-center gap-1 sm:gap-2">
        <ThemeSelect />
        {account ? <Button asChild variant="ghost" size="sm"><Link href="/dashboard">Dashboard</Link></Button> : <><Button asChild variant="ghost" size="sm"><Link href="/login">Masuk</Link></Button><Button asChild size="sm"><Link href="/register">Daftar</Link></Button></>}
      </nav>
    </div>
  </header>;
}
