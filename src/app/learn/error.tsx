"use client";

import { Button } from "@/components/ui/button";

export default function LearningError({ reset }: { error: Error; reset: () => void }) {
  return <main className="mx-auto max-w-4xl px-5 py-16"><h1 className="text-2xl font-bold">Jalur belajar belum dapat dimuat</h1><p className="mt-3 text-muted-foreground">Periksa koneksi lalu coba lagi.</p><Button className="mt-6" onClick={reset}>Coba lagi</Button></main>;
}
