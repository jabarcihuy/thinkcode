import Link from "next/link";
import { DashboardNavigation } from "@/components/layout/dashboard-navigation";
import type { Role } from "@/types/auth";

export function DashboardHeader({ role }: { role: Role }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto grid min-h-18 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 sm:px-8">
        <Link className="text-lg font-bold tracking-tight" href="/dashboard">Think<span className="text-primary">Code</span></Link>
        <DashboardNavigation role={role} />
      </div>
    </header>
  );
}
