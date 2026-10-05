"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ClipboardCheck, Database, House, UserRound } from "lucide-react";
import { DEFAULT_LEARNING_PATH_SLUG } from "@/features/learning/config";
import type { Role } from "@/types/auth";
const entries = [
  { href: "/dashboard", label: "Beranda", icon: House, prefixes: ["/dashboard"] },
  { href: `/learn/${DEFAULT_LEARNING_PATH_SLUG}`, label: "Materi", icon: BookOpen, prefixes: ["/learn"] },
  { href: "/lab", label: "Lab", icon: Database, prefixes: ["/lab", "/playground", "/schema-builder", "/chatbot"] },
  { href: "/pre-test", label: "Tes", icon: ClipboardCheck, prefixes: ["/pre-test", "/post-test", "/assessments"] },
  { href: "/profile", label: "Profil", icon: UserRound, prefixes: ["/profile", "/admin"] },
];
export function MobileBottomNavigation({ role }: { role: Role }) {
  const pathname = usePathname();
  const practice = pathname.endsWith("/practice");
  return <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
    <ul className="mx-auto grid max-w-xl grid-cols-5 gap-1 px-2 pt-1">{entries.map(({ href, label, icon: Icon, prefixes }) => {
      const active = label === "Lab" && practice || label !== "Materi" && prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) || label === "Materi" && !practice && pathname.startsWith("/learn/");
      return <li key={href}><Link href={href} aria-label={label === "Profil" && role === "ADMIN" ? "Profil dan Admin CMS" : undefined} aria-current={active ? "page" : undefined} className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${active ? "bg-secondary text-primary" : "text-muted-foreground"}`}><Icon size={19} aria-hidden="true" /><span className="whitespace-nowrap text-xs font-medium leading-none">{label}</span></Link></li>;
    })}</ul>
  </nav>;
}
