import Link from "next/link";
import { DashboardNavigation } from "@/components/layout/dashboard-navigation";
import type { Role } from "@/types/auth";

/**
 * Header for authenticated surfaces. Same world as the other two headers, so a
 * signed-in learner never crosses into a different visual language mid-session.
 */
export function DashboardHeader({ role }: { role: Role }) {
  return (
    <header className="relative border-b border-border bg-background">
      <div className="perf-rail" aria-hidden="true" />
      <div className="rail-inset mx-auto grid min-h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 sm:px-8">
        <Link className="inline-flex min-h-11 items-center text-lg font-semibold tracking-tight" href="/dashboard" aria-label="Quethink, dashboard">Que<span className="text-live-ink">think</span></Link>
        <DashboardNavigation role={role} />
      </div>
    </header>
  );
}
