import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DEFAULT_LEARNING_PATH_SLUG } from "@/features/learning/config";
import { logoutAction } from "@/lib/auth/actions";
import { guestHref } from "@/features/guest/domain/links";
import { exitGuest } from "@/features/guest/server/actions";
import type { Role } from "@/types/auth";

export function DashboardNavigation({ role, guest = false }: { role: Role; guest?: boolean }) {
  const href = (value: string) => guest ? guestHref(value) : value;
  return <nav aria-label="Navigasi akun" className="hidden items-center gap-1 lg:flex">
    <Button asChild variant="ghost" size="sm"><Link href={href("/dashboard")}>Dashboard</Link></Button>
    <Button asChild variant="ghost" size="sm"><Link href={href(`/learn/${DEFAULT_LEARNING_PATH_SLUG}`)}>Materi</Link></Button>
    <Button asChild variant="ghost" size="sm"><Link href={href("/lab")}>Lab Materi</Link></Button>
    <Button asChild variant="ghost" size="sm"><Link href={href("/pre-test")}>Tes</Link></Button>
    {!guest && role === "ADMIN" && <Button asChild variant="ghost" size="sm"><Link href="/admin">Admin CMS</Link></Button>}
    <Button asChild variant="ghost" size="sm"><Link href={href("/profile")}>Profil</Link></Button>
    <form action={guest ? exitGuest : logoutAction}><Button type="submit" variant="outline" size="sm">Keluar</Button></form>
  </nav>;
}
