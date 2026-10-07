import { QuethinkLogo } from "@/components/layout/quethink-logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";


export function SiteHeader() {
  return (
    <header className="relative border-b border-border bg-white">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-3 sm:px-8">
        <Link className="inline-flex min-h-11 items-center text-lg font-semibold tracking-tight" href="/" aria-label="Quethink, beranda">
          <QuethinkLogo />
        </Link>
        <nav aria-label="Navigasi utama" className="flex max-w-full flex-wrap items-center gap-1 sm:gap-3">
          <Button asChild variant="ghost" size="sm"><Link href="/login">Masuk</Link></Button>
          <Button asChild size="sm"><Link href="/register">Daftar</Link></Button>
        </nav>
      </div>
    </header>
  );
}
