import { DashboardHeader } from "@/components/layout/dashboard-header";
import { MobileBottomNavigation } from "@/components/layout/mobile-bottom-navigation";
import { requireAccount } from "@/lib/auth/session";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const account = await requireAccount();
  return <div className="min-h-dvh">
    <DashboardHeader role={account.profile.role} />
    <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</div>
    <MobileBottomNavigation role={account.profile.role} />
  </div>;
}
