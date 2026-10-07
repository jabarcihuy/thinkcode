"use client";
import { useText } from "@/i18n/use-text";

import { useGuestLearning } from "./guest-mode";
export function GuestLocalNotice() {
  const tx = useText();

 const local = useGuestLearning();
 return <div className="mx-auto max-w-6xl px-5 pt-3 sm:px-8"><p role="status" className="text-xs leading-5 text-muted-foreground">{tx(local?.status === "failed" ? "Penyimpanan perangkat tidak tersedia. Jangan tutup halaman agar progres tidak hilang." : local?.status === "invalid" ? "Progres lokal sebelumnya tidak dapat dibaca. Reset melalui Profil untuk memulai kembali." : "Mode tamu · progres tersimpan di perangkat ini")}</p></div>;
}
