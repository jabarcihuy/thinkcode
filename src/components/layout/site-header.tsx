import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Header sits on the stock ground and keeps the world's rail, but the rail is
 * offset so a perforation can never land on the wordmark. Navigation stays on
 * one line at desktop; secondary items drop before it is allowed to wrap.
 */
export function SiteHeader() {
  return (
    <header className="relative border-b border-border bg-background">
      <div className="perf-rail" aria-hidden="true" />
      <div className="rail-inset mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-3 sm:px-8">
        <Link className="text-lg font-semibold tracking-tight" href="/" aria-label="Quethink, beranda">
          Que<span className="text-live-ink">think</span>
        </Link>
        <nav aria-label="Navigasi utama" className="flex max-w-full flex-wrap items-center gap-1 sm:gap-3">
          <Button asChild variant="ghost" size="sm"><Link href="/login">Masuk</Link></Button>
          <Button asChild size="sm"><Link href="/register">Daftar</Link></Button>
        </nav>
      </div>
    </header>
  );
}
