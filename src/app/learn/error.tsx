"use client";
import { useText } from "@/i18n/use-text";


import { Button } from "@/components/ui/button";

export default function LearningError({ reset }: { error: Error; reset: () => void }) {
  const tx = useText();

  return <main id="main-content" className="mx-auto max-w-4xl px-5 py-16"><h1 className="text-2xl font-semibold">{tx("Jalur belajar belum dapat dimuat")}</h1><p className="mt-3 text-muted-foreground">{tx("Periksa koneksi lalu coba lagi.")}</p><Button className="mt-6" onClick={reset}>{tx("Coba lagi")}</Button></main>;
}
