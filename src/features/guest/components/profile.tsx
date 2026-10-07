"use client";

import { useText } from "@/i18n/use-text";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exitGuest } from "../server/actions";
import { useGuestLearning } from "./guest-mode";
export function GuestProfile() {
  const tx = useText();

 const local = useGuestLearning();
 const [message, setMessage] = useState("");
 const [confirm, setConfirm] = useState(false);
 const name = local?.name ?? "";
 return <main id="main-content" className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
  <header className="flex items-center gap-4 border-b border-border pb-7"><div aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full border border-border bg-secondary text-lg font-semibold text-foreground">{name.charAt(0).toLocaleUpperCase("id-ID") || "Q"}</div><div className="min-w-0"><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{tx("Profil")}</h1><p className="mt-1 text-sm text-muted-foreground">{tx("Atur nama yang tampil di Quethink.")}</p></div></header>
  <section className="mt-8" aria-labelledby="profile-name-title"><h2 id="profile-name-title" className="text-base font-semibold">{tx("Informasi profil")}</h2><form className="mt-5 max-w-xl" onSubmit={(event) => { event.preventDefault(); const value = new FormData(event.currentTarget).get("display_name"); if (typeof value === "string" && value.trim().length >= 2) { local?.rename(value.trim()); setMessage("Nama diperbarui di perangkat ini."); } }}><div className="space-y-2"><Label htmlFor="display_name">{tx("Nama tampilan")}</Label><Input key={name} id="display_name" name="display_name" defaultValue={name} required minLength={2} maxLength={60} autoComplete="nickname" aria-describedby="display-name-help" /><p id="display-name-help" className="text-sm leading-6 text-muted-foreground">{tx("Nama ini ditampilkan di dashboard. Maksimal 60 karakter.")}</p></div>{message && <p role="status" className="mt-4 text-sm text-accent">{tx(message)}</p>}<Button type="submit" className="mt-5">{tx("Simpan profil")}</Button></form></section>
  <section className="mt-9 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-semibold">{tx("Jenis akun")}</h2><p className="mt-1 text-sm text-muted-foreground">{tx("Tamu · penyimpanan lokal")}</p></div><Button asChild variant="outline" size="sm"><Link href="/register">{tx("Buat akun")}</Link></Button></section>
  <section className="mt-8 border-t border-border pt-6"><h2 className="font-semibold">{tx("Progres di perangkat ini")}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{tx("Progres, jawaban dan database SQLab tidak tersinkron ke cloud. Data dapat hilang jika penyimpanan browser dihapus. Gunakan reset sebelum perangkat dipakai orang lain.")}</p><Button variant="outline" className="mt-4" onClick={() => setConfirm(true)}>{tx("Reset progres tamu")}</Button>{confirm && <div className="mt-4"><p className="text-sm leading-6">{tx("Hapus progres, hasil tes, jawaban dan database SQLab tamu dari perangkat ini?")}</p><div className="mt-3 flex flex-wrap gap-3"><Button variant="outline" onClick={() => setConfirm(false)}>{tx("Batal")}</Button><Button onClick={() => { const ok = local?.reset(); setMessage(ok ? "Data tamu lokal telah dihapus." : "Data belum dapat dihapus. Periksa izin penyimpanan browser."); setConfirm(false); }}>{tx("Hapus data tamu")}</Button></div></div>}</section>
  <form action={exitGuest} className="mt-8 border-t border-border pt-6"><Button type="submit" variant="outline">{tx("Keluar")}</Button></form>
 </main>;
}
