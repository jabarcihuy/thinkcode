"use client";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChevronUp, ClipboardCheck, Database, House, LogOut, MessagesSquare, PanelsTopLeft, ShieldCheck, UserRound, X } from "lucide-react";
import { DEFAULT_LEARNING_PATH_SLUG } from "@/features/learning/config";
import { logoutAction } from "@/lib/auth/actions";
import type { Role } from "@/types/auth";
const entries = [
  { href: "/dashboard", label: "Beranda", icon: House, prefixes: ["/dashboard"] },
  { href: `/learn/${DEFAULT_LEARNING_PATH_SLUG}`, label: "Materi", icon: BookOpen, prefixes: ["/learn"] },
  { href: null, label: "Menu", icon: ChevronUp, prefixes: [] },
  { href: "/pre-test", label: "Tes", icon: ClipboardCheck, prefixes: ["/pre-test", "/post-test", "/assessments"] },
  { href: "/profile", label: "Profil", icon: UserRound, prefixes: ["/profile"] },
];
const tools = [
  { href: "/lab", label: "Lab Materi", icon: Database },
  { href: "/playground", label: "SQLab", icon: PanelsTopLeft },
  { href: "/chatbot", label: "Chatbot", icon: MessagesSquare },
  { href: "/pre-test", label: "Pre-test", icon: ClipboardCheck },
  { href: "/post-test", label: "Post-test", icon: ClipboardCheck },
];
const itemClass = "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
function matchesPath(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function MobileBottomNavigation({ role }: { role: Role }) {
  const pathname = usePathname();
  const practice = pathname.endsWith("/practice");
  const menuId = useId();
  const panel = useRef<HTMLElement>(null);
  const bar = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const menuActive = practice || ["/lab", "/playground", "/schema-builder", "/chatbot", "/admin"].some((prefix) => matchesPath(pathname, prefix));
  function closeMenu() { panel.current?.hidePopover(); }
  useEffect(() => { panel.current?.hidePopover(); }, [pathname]);
  useEffect(() => {
    const navigation = bar.current, menu = panel.current;
    if (!navigation || !menu) return;
    const updateHeight = () => menu.style.setProperty("--mobile-navigation-height", `${navigation.getBoundingClientRect().height}px`);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(navigation);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) panel.current?.hidePopover(); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  const expanded = role === "ADMIN" ? [...tools, { href: "/admin", label: "Admin CMS", icon: ShieldCheck }] : tools;

  return <>
    <nav ref={panel} id={menuId} popover="auto" aria-label="Fitur lainnya" onToggle={(event) => setOpen(event.newState === "open")} className="mobile-navigation-panel rounded-lg bg-white p-4 text-foreground shadow-surface">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Menu</h2>
        <button type="button" popoverTarget={menuId} popoverTargetAction="hide" aria-label="Tutup menu" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring"><X size={20} aria-hidden="true" /></button>
      </div>
      <ul className="grid grid-cols-2 gap-2">{expanded.map(({ href, label, icon: Icon }) => {
        const active = matchesPath(pathname, href);
        return <li key={href} className={href === "/admin" ? "col-span-2" : undefined}><Link href={href} onClick={closeMenu} aria-current={active ? "page" : undefined} className={`flex min-h-14 items-center gap-3 rounded-md px-3 py-3 text-sm font-medium leading-6 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring ${active ? "bg-secondary text-primary" : "text-foreground"}`}><Icon size={20} className="shrink-0 text-primary" aria-hidden="true" /><span>{label}</span></Link></li>;
      })}</ul>
      <form action={logoutAction} className="mt-3 border-t border-border pt-2"><button type="submit" onClick={closeMenu} className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring"><LogOut size={20} aria-hidden="true" />Keluar</button></form>
    </nav>
    <nav ref={bar} aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto grid max-w-xl grid-cols-5 gap-1 px-2 pt-1">{entries.map(({ href, label, icon: Icon, prefixes }) => {
        if (href === null) return <li key="menu"><button type="button" popoverTarget={menuId} aria-controls={menuId} aria-expanded={open} className={`${itemClass} w-full ${open || menuActive ? "bg-secondary text-primary" : "text-muted-foreground"}`}><ChevronUp size={20} aria-hidden="true" className={`transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} /><span className="max-w-full text-center text-xs font-medium leading-tight [overflow-wrap:anywhere]">Menu</span></button></li>;
        const active = (label !== "Materi" || !practice) && prefixes.some((prefix) => matchesPath(pathname, prefix));
        return <li key={href}><Link href={href} onClick={closeMenu} aria-current={active ? "page" : undefined} className={`${itemClass} ${active ? "bg-secondary text-primary" : "text-muted-foreground"}`}><Icon size={19} aria-hidden="true" /><span className="max-w-full text-center text-xs font-medium leading-tight [overflow-wrap:anywhere]">{label}</span></Link></li>;
      })}
      </ul>
    </nav>
  </>;
}
