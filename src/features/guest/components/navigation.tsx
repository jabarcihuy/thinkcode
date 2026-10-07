"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Home,
  BookOpen,
  ChevronUp,
  ClipboardCheck,
  UserRound,
  Database,
  MessageCircle,
  X,
} from "lucide-react";
import { useMobileShell } from "@/components/navigation/use-mobile-shell";
import { guestNavigationView } from "../domain/navigation";
const destinations = [
  { view: "", label: "Beranda", icon: Home },
  { view: "materials", label: "Materi", icon: BookOpen },
  { view: "menu", label: "Menu", icon: ChevronUp },
  { view: "tests", label: "Tes", icon: ClipboardCheck },
  { view: "profile", label: "Profil", icon: UserRound },
];
export function GuestNavigation() {
  const pathname = usePathname();
  const search = useSearchParams();
  const menuId = useId();
  const panel = useRef<HTMLElement>(null);
  const bar = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const current = guestNavigationView(pathname, search.get("view"));
  useMobileShell(bar, panel);
  useEffect(() => {
    panel.current?.hidePopover();
  }, [pathname, current]);
  const href = (view: string) => `/guest${view ? `?view=${view}` : ""}`;
  return (
    <>
      <nav
        aria-label="Navigasi tamu desktop"
        className="hidden flex-wrap items-center gap-5 text-sm lg:flex"
      >
        {[
          ...destinations.filter((d) => d.view !== "menu"),
          { view: "sqlab", label: "SQLab" },
          { view: "chatbot", label: "Tutor AI" },
        ].map((d) => (
          <Link
            key={d.view}
            href={href(d.view)}
            className="inline-flex min-h-11 items-center font-medium hover:underline"
          >
            {d.label}
          </Link>
        ))}
      </nav>
      <nav
        id={menuId}
        ref={panel}
        popover="auto"
        aria-label="Alat tamu"
        onToggle={(event) => setOpen(event.newState === "open")}
        className="mobile-navigation-panel rounded-xl bg-background p-3 shadow-surface"
      >
        <div className="flex items-center justify-between"><p className="px-3 py-2 text-sm font-semibold">Coba fitur</p><button type="button" popoverTarget={menuId} popoverTargetAction="hide" aria-label="Tutup menu" className="flex min-h-11 min-w-11 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-ring"><X size={20} aria-hidden="true" /></button></div>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={href("sqlab")}
            className="flex min-h-12 items-center gap-2 rounded-lg px-3 text-sm hover:bg-secondary"
          >
            <Database size={18} aria-hidden="true" />
            SQLab
          </Link>
          <Link
            href={href("chatbot")}
            className="flex min-h-12 items-center gap-2 rounded-lg px-3 text-sm hover:bg-secondary"
          >
            <MessageCircle size={18} aria-hidden="true" />
            Tutor AI
          </Link>
        </div>
      </nav>
      <nav
        ref={bar}
        aria-label="Navigasi tamu mobile"
        className="mobile-bottom-bar fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid grid-cols-5 px-2 py-1">
          {destinations.map((d) => {
            const Icon = d.icon;
            const cls =
              "flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-medium focus-visible:outline-2 focus-visible:outline-ring";
            const active = d.view === current;
            return (
              <li key={d.view}>
                {d.view === "menu" ? (
                  <button
                    popoverTarget={menuId}
                    className={`${cls} ${active || open ? "bg-secondary text-primary" : "text-muted-foreground"}`}
                    aria-controls={menuId}
                    aria-expanded={open}
                    aria-current={active ? "page" : undefined}
                    aria-label="Menu fitur tamu"
                  >
                    <Icon size={20} aria-hidden="true" />
                    <span>Menu</span>
                  </button>
                ) : (
                  <Link
                    href={href(d.view)}
                    className={`${cls} ${active ? "bg-secondary text-primary" : "text-muted-foreground"}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={20} aria-hidden="true" />
                    <span className="max-w-full text-center [overflow-wrap:anywhere]">
                      {d.label}
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
