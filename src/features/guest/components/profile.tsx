"use client";

import { useText } from "@/i18n/use-text";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GuestProfileEditor } from "@/features/profile/components/guest-profile-editor";
import { ProfilePreferences } from "@/features/profile/components/profile-preferences";
import { exitGuest } from "../server/actions";
import { useGuestLearning } from "./guest-mode";
export function GuestProfile() {
  const tx = useText();

 const local = useGuestLearning();
 const [message, setMessage] = useState("");
 const [editorVersion, setEditorVersion] = useState(0);
 const [confirm, setConfirm] = useState(false);
 const name = local?.name ?? "";
 return <main id="main-content" className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
  <header><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{tx("Profil")}</h1><p className="mt-2 text-sm text-muted-foreground">{tx("Personalisasi profil dan preferensimu.")}</p></header>
  <section className="mt-6" aria-labelledby="profile-name-title"><h2 id="profile-name-title" className="text-base font-semibold">{tx("Informasi profil")}</h2>{local?.status === "loading" ? <p role="status" className="mt-4 text-sm text-muted-foreground">{tx("Memuat profil…")}</p> : <GuestProfileEditor key={editorVersion} initialName={name} initialAppearance={local?.value.appearance} />}</section>
  <ProfilePreferences />
  <section className="mt-9 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-semibold">{tx("Jenis akun")}</h2><p className="mt-1 text-sm text-muted-foreground">{tx("Tamu · penyimpanan lokal")}</p></div><Button asChild variant="outline" size="sm"><Link href="/register">{tx("Buat akun")}</Link></Button></section>
  <section className="mt-8 border-t border-border pt-6"><h2 className="font-semibold">{tx("Progres di perangkat ini")}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{tx("Progres, jawaban dan database SQLab tidak tersinkron ke cloud. Data dapat hilang jika penyimpanan browser dihapus. Gunakan reset sebelum perangkat dipakai orang lain.")}</p><Button variant="outline" className="mt-4" onClick={() => setConfirm(true)}>{tx("Reset progres tamu")}</Button>{confirm && <div className="mt-4"><p className="text-sm leading-6">{tx("Hapus progres, hasil tes, jawaban dan database SQLab tamu dari perangkat ini?")}</p><div className="mt-3 flex flex-wrap gap-3"><Button variant="outline" onClick={() => setConfirm(false)}>{tx("Batal")}</Button><Button onClick={() => { const ok = local?.reset(); if (ok) setEditorVersion(v => v + 1); setMessage(ok ? "Data tamu lokal telah dihapus." : "Data belum dapat dihapus. Periksa izin penyimpanan browser."); setConfirm(false); }}>{tx("Hapus data tamu")}</Button></div></div>}</section>
  {message && <p role="status" className="mt-4 text-sm">{tx(message)}</p>}
  <form action={exitGuest} className="mt-8 border-t border-border pt-6"><Button type="submit" variant="outline">{tx("Keluar")}</Button></form>
 </main>;
}
