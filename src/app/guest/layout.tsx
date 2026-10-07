import { LanguageSwitcher } from "@/i18n/language-switcher";

import { getText } from "@/i18n/server";
import { GuestLocalNotice } from "@/features/guest/components/local-notice";
import Link from "next/link";
import { getGuest } from "@/features/guest/server/session";
import { guestCatalog } from "@/features/guest/server/catalog";
import { GuestModeProvider } from "@/features/guest/components/guest-mode";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { MobileBottomNavigation } from "@/components/layout/mobile-bottom-navigation";
export default async function GuestLayout({ children }: { children: React.ReactNode }) {
  const tx = await getText();

 const guest = await getGuest();
 if (!guest) return <div className="min-h-dvh"><header className="flex items-center justify-between gap-3 border-b border-border bg-white px-5 py-3"><Link href="/login" className="inline-flex min-h-11 items-center text-sm font-medium">{tx("Masuk akun")}</Link><LanguageSwitcher /></header>{children}</div>;
 const catalog = await guestCatalog();
 return <GuestModeProvider catalog={catalog} name={guest.name}><div className="min-h-dvh"><DashboardHeader role="USER" guest /><div className="mobile-page-content lg:pb-0"><GuestLocalNotice />{children}</div><MobileBottomNavigation role="USER" guest /></div></GuestModeProvider>;
}
