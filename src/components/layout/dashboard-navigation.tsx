import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DEFAULT_LEARNING_PATH_SLUG } from "@/features/learning/config";
import { logoutAction } from "@/lib/auth/actions";
import type { Role } from "@/types/auth";

export function DashboardNavigation({ role }: { role: Role }) {
  return <nav aria-label="Navigasi akun" className="hidden items-center gap-1 lg:flex">
    <Button asChild variant="ghost" size="sm"><Link href="/dashboard">Dashboard</Link></Button>
    <Button asChild variant="ghost" size="sm"><Link href={`/learn/${DEFAULT_LEARNING_PATH_SLUG}`}>Materi</Link></Button>
    <Button asChild variant="ghost" size="sm"><Link href="/lab">Lab SQL</Link></Button>
    <Button asChild variant="ghost" size="sm"><Link href="/pre-test">Tes</Link></Button>
    {role === "ADMIN" && <Button asChild variant="ghost" size="sm"><Link href="/admin">Admin CMS</Link></Button>}
    <Button asChild variant="ghost" size="sm"><Link href="/profile">Profil</Link></Button>
    <form action={logoutAction}><Button type="submit" variant="outline" size="sm">Keluar</Button></form>
  </nav>;
}
