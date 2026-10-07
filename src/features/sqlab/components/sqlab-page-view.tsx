import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export function SqlabPageView({ children, dashboardHref = "/dashboard" }: { children: React.ReactNode; dashboardHref?: string }) { return (    <main
      id="main-content"
      className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14"
    >
      <Link
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline"
        href={dashboardHref}
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Dashboard
      </Link>
      <header className="mt-4 max-w-[72ch]">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          SQLab
        </h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          Buat database sendiri, hubungkan tabel, isi data, lalu coba query.
          Mulai dari nol atau minta AI menyusun rancangan.
        </p>
      </header>

      {children}
    </main>); }
