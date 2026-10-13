import { localizeMetadata } from "@/i18n/metadata";


import { getText } from "@/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/lib/auth/actions";
import { requireAccount } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { cloudinaryReady } from "@/features/profile/server/cloudinary";
import { getPersonalization } from "@/features/profile/server/personalization";
import { ProfilePreferences } from "@/features/profile/components/profile-preferences";
import { ProfileForm } from "@/features/profile/components/profile-form";

const pageMetadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const tx = await getText();

  const { profile } = await requireAccount();
  const displayName = profile.display_name?.trim() ?? "";
  const personalization = await getPersonalization();

  return <main id="main-content" className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
    <header><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{tx("Profil")}</h1><p className="mt-2 text-sm text-muted-foreground">{tx("Personalisasi profil dan preferensimu.")}</p></header>
    <section className="mt-8" aria-labelledby="profile-name-title">
      <h2 id="profile-name-title" className="text-base font-semibold">{tx("Informasi profil")}</h2>
      {personalization ? <ProfileForm displayName={displayName} initialAppearance={personalization.appearance} photoEnabled={cloudinaryReady()} /> : <p role="alert" className="mt-4 text-sm text-destructive">{tx("Profil belum dapat dimuat. Muat ulang halaman untuk mencoba lagi.")}</p>}
    </section>
    <ProfilePreferences />
    {personalization?.email && <div className="mt-6 border-t border-border pt-6"><h2 className="text-sm font-semibold">Email</h2><p className="mt-2 break-all text-sm text-muted-foreground">{personalization.email}</p></div>}
    <section className="mt-9 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="text-sm font-semibold">{tx("Jenis akun")}</h2><p className="mt-1 text-sm text-muted-foreground">{tx(profile.role === "ADMIN" ? "Administrator" : "Pengguna")}</p></div>
      {profile.role === "ADMIN" && <Button asChild variant="outline" size="sm"><Link href="/admin">{tx("Buka Admin CMS")}</Link></Button>}
    </section>
    <form action={logoutAction} className="mt-8 border-t border-border pt-6">
      <Button type="submit" variant="outline">{tx("Keluar")}</Button>
    </form>
  </main>;
}

export async function generateMetadata() { return localizeMetadata(pageMetadata); }
