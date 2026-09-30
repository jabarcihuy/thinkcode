import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Account } from "@/lib/auth/session";

/**
 * Header for the learning surfaces. Same world as the landing header: stock
 * ground, sprocket rail in the outer gutter, and the wordmark's second half in
 * the one accent. Kept as its own component because these pages carry an
 * account state the marketing header does not.
 */
export function LearningHeader({ account }: { account: Account | null }) {
  return <header className="relative border-b border-border bg-background">
    <div className="perf-rail" aria-hidden="true" />
    <div className="rail-inset mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
      <Link className="text-lg font-semibold tracking-tight" href="/" aria-label="Quethink, beranda">Que<span className="text-live-ink">think</span></Link>
      <nav aria-label="Navigasi utama" className="flex max-w-full flex-wrap items-center gap-1 sm:gap-3">
        {account ? <Button asChild variant="ghost" size="sm"><Link href="/dashboard">Dashboard</Link></Button> : <><Button asChild variant="ghost" size="sm"><Link href="/login">Masuk</Link></Button><Button asChild size="sm"><Link href="/register">Daftar</Link></Button></>}
      </nav>
    </div>
  </header>;
}
