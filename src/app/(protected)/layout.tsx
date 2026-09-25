import { DashboardHeader } from "@/components/layout/dashboard-header";
import { requireAccount } from "@/lib/auth/session";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const account = await requireAccount();
  return <div className="min-h-screen"><DashboardHeader role={account.profile.role} />{children}</div>;
}
