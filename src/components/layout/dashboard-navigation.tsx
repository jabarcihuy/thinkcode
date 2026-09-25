"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSelect } from "@/components/theme/theme-select";
import { logoutAction } from "@/lib/auth/actions";
import type { Role } from "@/types/auth";

export function DashboardNavigation({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const links = <>
    <Button asChild variant="ghost" size="sm"><Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link></Button>
    <Button asChild variant="ghost" size="sm"><Link href="/learn/programming-logic-fundamentals" onClick={() => setOpen(false)}>Jalur belajar</Link></Button>
    <Button asChild variant="ghost" size="sm"><Link href="/assessments" onClick={() => setOpen(false)}>Assessment</Link></Button>
    {role === "ADMIN" && <Button asChild variant="ghost" size="sm"><Link href="/admin" onClick={() => setOpen(false)}>Admin CMS</Link></Button>}
    <form action={logoutAction}><Button type="submit" variant="outline" size="sm">Keluar</Button></form>
  </>;
  return <>
    <nav aria-label="Navigasi akun" className="hidden items-center gap-1 lg:flex"><div className="mr-2"><ThemeSelect /></div>{links}</nav>
    <div className="flex items-center gap-2 lg:hidden"><ThemeSelect /><Button type="button" variant="outline" size="sm" aria-expanded={open} aria-controls="account-mobile-navigation" onClick={() => setOpen(!open)}><span className="sr-only">{open ? "Tutup navigasi" : "Buka navigasi"}</span>{open ? <X size={17} /> : <Menu size={17} />}</Button></div>
    {open && <nav id="account-mobile-navigation" aria-label="Navigasi akun" className="col-span-full flex w-full flex-wrap gap-1 border-t border-border pt-3 lg:hidden">{links}</nav>}
  </>;
}
