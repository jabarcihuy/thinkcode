"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MaterialDownload({ href, number }: { href: string; number: number }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function download() {
    setPending(true); setError("");
    let url: string | undefined;
    try {
      const response = await fetch(href);
      if (!response.ok || !response.headers.get("content-type")?.includes("application/pdf")) throw new Error();
      url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `quethink-materi-${number}.pdf`;
      document.body.append(anchor); anchor.click(); anchor.remove();
    } catch { setError("PDF belum bisa diunduh. Coba lagi sebentar."); }
    finally {
      if (url) setTimeout(() => URL.revokeObjectURL(url!), 1000);
      setPending(false);
    }
  }
  return <div><Button variant="outline" onClick={download} disabled={pending} className="min-h-11 w-full sm:w-auto">{pending ? <LoaderCircle className="animate-spin" size={16} aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}{pending ? "Menyiapkan PDF…" : "Unduh PDF"}</Button><p role="status" className="mt-2 max-w-xs text-sm text-destructive">{error}</p></div>;
}
