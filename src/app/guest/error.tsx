"use client";
import { useText } from "@/i18n/use-text";

import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function GuestErrorPage({ reset }: { reset: () => void }) {
  const tx = useText();

  return (
    <main id="main-content" className="mx-auto max-w-xl px-5 py-12">
      <h1 className="text-2xl font-semibold">{tx("Percobaan belum dapat dibuka")}</h1>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {tx("Periksa koneksi. Jika akunmu sedang menjalani tes, selesaikan tes sebelum menggunakan mode tamu.")}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={reset}>{tx("Coba lagi")}</Button>
        <Button asChild variant="outline">
          <Link href="/">{tx("Kembali ke beranda")}</Link>
        </Button>
      </div>
    </main>
  );
}
