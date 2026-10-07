import { QuethinkLogo } from "@/components/layout/quethink-logo";
import Link from "next/link";
import { DashboardNavigation } from "@/components/layout/dashboard-navigation";
import type { Role } from "@/types/auth";


export function DashboardHeader({ role, guest = false }: { role: Role; guest?: boolean }) {
  return (
    <header className="relative border-b border-border bg-white">
      <div className="mx-auto grid min-h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 sm:px-8">
        <Link className="inline-flex min-h-11 items-center text-lg font-semibold tracking-tight" href={guest ? "/guest" : "/dashboard"} aria-label="Quethink, dashboard"><QuethinkLogo /></Link>
        <DashboardNavigation role={role} guest={guest} />
      </div>
    </header>
  );
}
