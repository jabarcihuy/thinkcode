"use client";
import { useText } from "@/i18n/use-text";


import { Button } from "@/components/ui/button";

export default function ProtectedError({ reset }: { error: Error; reset: () => void }) {
  const tx = useText();

  return <main id="main-content" className="mx-auto max-w-6xl px-5 py-14"><h1 className="text-2xl font-semibold">{tx("Halaman belum dapat dimuat")}</h1><p className="mt-3 text-muted-foreground">{tx("Coba lagi beberapa saat.")}</p><Button className="mt-6" onClick={reset}>{tx("Coba lagi")}</Button></main>;
}
