"use client";

import { Button } from "@/components/ui/button";

export default function ProtectedError({ reset }: { error: Error; reset: () => void }) {
  return <main className="mx-auto max-w-6xl px-5 py-14"><h1 className="text-2xl font-bold">Halaman belum dapat dimuat</h1><p className="mt-3 text-muted-foreground">Coba lagi beberapa saat.</p><Button className="mt-6" onClick={reset}>Coba lagi</Button></main>;
}
