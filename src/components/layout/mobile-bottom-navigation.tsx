"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ClipboardCheck, Database, House, MessageCircle, MoreHorizontal, Network, Shield, UserRound } from "lucide-react";
import type { MouseEvent } from "react";
import { DEFAULT_LEARNING_PATH_SLUG } from "@/features/learning/config";
import type { Role } from "@/types/auth";

const itemClass = "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 text-muted-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function closeMoreMenu(event: MouseEvent<HTMLAnchorElement>) {
  event.currentTarget.closest("details")?.removeAttribute("open");
}

export function MobileBottomNavigation({ role }: { role: Role }) {
  const pathname = usePathname();
  const activeMore = ["/playground", "/schema-builder", "/chatbot", "/admin"].some((href) => isCurrent(pathname, href));

  return <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden">
    <ul className="mx-auto grid max-w-xl grid-cols-5 gap-1 px-2 pt-1">
      <li><Link href="/dashboard" aria-current={isCurrent(pathname, "/dashboard") ? "page" : undefined} className={`${itemClass} ${isCurrent(pathname, "/dashboard") ? "text-accent" : ""}`}>
        <House size={19} aria-hidden="true" /><span className="whitespace-nowrap text-xs font-medium leading-none">Beranda</span>
      </Link></li>
      <li><Link href={`/learn/${DEFAULT_LEARNING_PATH_SLUG}`} aria-current={isCurrent(pathname, "/learn") ? "page" : undefined} className={`${itemClass} ${isCurrent(pathname, "/learn") ? "text-accent" : ""}`}>
        <BookOpen size={19} aria-hidden="true" /><span className="whitespace-nowrap text-xs font-medium leading-none">Materi</span>
      </Link></li>
      <li><Link href="/assessments" aria-current={isCurrent(pathname, "/assessments") ? "page" : undefined} className={`${itemClass} ${isCurrent(pathname, "/assessments") ? "text-accent" : ""}`}>
        <ClipboardCheck size={19} aria-hidden="true" /><span className="whitespace-nowrap text-xs font-medium leading-none">Tes</span>
      </Link></li>
      <li className="relative">
        <details>
          <summary aria-label="Lainnya" className={`${itemClass} list-none cursor-pointer marker:hidden ${activeMore ? "text-accent" : ""}`}>
            <MoreHorizontal size={19} aria-hidden="true" /><span className="whitespace-nowrap text-xs font-medium leading-none">Lainnya</span>
          </summary>
          <div className="absolute bottom-[calc(100%+0.5rem)] left-1/2 z-50 w-56 -translate-x-1/2 rounded-lg border border-border bg-background p-1 shadow-surface">
            <Link href="/playground" aria-current={isCurrent(pathname, "/playground") ? "page" : undefined} onClick={closeMoreMenu} className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring">
              <Database size={17} aria-hidden="true" />SQL Playground
            </Link>
            <Link href="/schema-builder" aria-current={isCurrent(pathname, "/schema-builder") ? "page" : undefined} onClick={closeMoreMenu} className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring">
              <Network size={17} aria-hidden="true" />Pembuat Skema
            </Link>
            <Link href="/chatbot" aria-current={isCurrent(pathname, "/chatbot") ? "page" : undefined} onClick={closeMoreMenu} className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring">
              <MessageCircle size={17} aria-hidden="true" />Chatbot
            </Link>
            {role === "ADMIN" && <Link href="/admin" aria-current={isCurrent(pathname, "/admin") ? "page" : undefined} onClick={closeMoreMenu} className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring">
              <Shield size={17} aria-hidden="true" />Admin CMS
            </Link>}
          </div>
        </details>
      </li>
      <li><Link href="/profile" aria-current={isCurrent(pathname, "/profile") ? "page" : undefined} className={`${itemClass} ${isCurrent(pathname, "/profile") ? "text-accent" : ""}`}>
        <UserRound size={19} aria-hidden="true" /><span className="whitespace-nowrap text-xs font-medium leading-none">Profil</span>
      </Link></li>
    </ul>
  </nav>;
}
