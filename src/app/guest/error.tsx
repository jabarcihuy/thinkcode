"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function GuestErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="mx-auto max-w-xl px-5 py-12">
      <h1 className="text-2xl font-semibold">Percobaan belum dapat dibuka</h1>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Periksa koneksi. Jika akunmu sedang menjalani tes, selesaikan tes
        sebelum menggunakan mode tamu.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={reset}>Coba lagi</Button>
        <Button asChild variant="outline">
          <Link href="/">Kembali ke beranda</Link>
        </Button>
      </div>
    </main>
  );
}
