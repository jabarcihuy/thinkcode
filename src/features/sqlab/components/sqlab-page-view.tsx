
import { useText } from "@/i18n/use-text";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export function SqlabPageView({ children, dashboardHref = "/dashboard" }: { children: React.ReactNode; dashboardHref?: string }) {
  const tx = useText();
 return (    <main
      id="main-content"
      className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14"
    >
      <Link
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline"
        href={dashboardHref}
      >
        <ArrowLeft size={15} aria-hidden="true" />
        {tx("Dashboard")}</Link>
      <header className="mt-4 max-w-[72ch]">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {tx("SQLab")}</h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          {tx("Ceritakan ide database kamu. AI menyusun tabel, relasi, dan contoh data yang bisa kamu tinjau, ubah, lalu jelajahi dengan SQL.")}</p>
      </header>

      {children}
    </main>); }
