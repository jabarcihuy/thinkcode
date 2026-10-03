import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatasetLabSwitcher } from "@/features/database/components/dataset-lab-switcher";
import { PRACTICE_DATASETS } from "@/features/database/data/datasets";
import { createClient } from "@/lib/supabase/server";
import { requireAccount } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "SQL Playground",
  description: "Coba query pada dataset sintetis menggunakan SQLite lokal di browser.",
};

export default async function PlaygroundPage() {
  await requireAccount();
  const supabase = await createClient();
  const { data: assessmentActive, error } = await supabase.rpc("current_user_has_active_assessment");

  return <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
    <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline" href="/dashboard"><ArrowLeft size={15} aria-hidden="true" />Dashboard</Link>
    <header className="mt-4 max-w-[72ch]">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">SQL Playground</h1>
      <p className="mt-3 leading-7 text-muted-foreground">Tulis query pada data kampus, katalog buku, atau toko sintetis, prediksi hasilnya, lalu jalankan di browser. Perubahan data bisa direset dan tidak memengaruhi progres lesson.</p>
      <Button asChild variant="outline" className="mt-4"><Link href="/schema-builder">Latihan menyusun skema</Link></Button>
    </header>

    {error ? <p role="alert" className="mt-8 border-y border-destructive/50 py-5 text-sm leading-6 text-destructive">Status assessment belum dapat diperiksa. Muat ulang halaman sebelum memakai playground.</p>
      : assessmentActive ? <section className="mt-8 border-y border-border py-7" aria-labelledby="playground-locked-title">
        <LockKeyhole size={20} className="text-muted-foreground" aria-hidden="true" />
        <h2 id="playground-locked-title" className="mt-3 text-lg font-semibold">Playground dijeda</h2>
        <p className="mt-2 max-w-[65ch] text-sm leading-6 text-muted-foreground">Selesaikan assessment yang sedang berlangsung sebelum kembali berlatih dengan query.</p>
        <Button asChild className="mt-4"><Link href="/assessments">Kembali ke assessment</Link></Button>
      </section> : <DatasetLabSwitcher scenarios={PRACTICE_DATASETS.map((dataset) => ({ datasetId: dataset.id, title: dataset.description, prompt: "Ubah query, prediksi jumlah baris, lalu jalankan.", sql: dataset.starterSql }))} />}
  </main>;
}
