import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { Reveal } from "@/components/motion/reveal";
import { DatabaseLabPreview } from "@/features/landing/components/database-lab-preview";
import { DEFAULT_LEARNING_PATH_SLUG } from "@/features/learning/config";

export const metadata: Metadata = {
  title: "Quethink — Belajar Basis Data dengan SQL Interaktif",
  description: "Amati tabel, prediksi hasil, tulis query SQL, dan lihat bagaimana relasi data membentuk jawaban.",
};

const units = [
  "Membaca Data sebagai Relasi",
  "Mengambil Kolom yang Dibutuhkan",
  "Menyaring Record",
  "Mengurutkan dan Membatasi",
  "Menghubungkan Tabel",
  "Merangkum Data",
  "Tantangan Query Kampus",
];

export default function HomePage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main id="main-content">
        <section className="relative isolate overflow-hidden border-b border-border bg-background">
          <div className="perf-rail" aria-hidden="true" />
          <Reveal as="div" stagger revealOnScroll className="rail-inset mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14 lg:py-28">
            <div className="max-w-xl">
              <h1 className="max-w-[12ch] text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.65rem]">
                Pahami hubungan data. Buktikan dengan query.
              </h1>
              <p className="mt-6 max-w-[42ch] text-base leading-7 text-muted-foreground sm:text-lg">
                Amati tabel, prediksi hasil, lalu uji query SQL.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="min-h-11"><Link href="/register">Mulai belajar<ArrowRight size={16} aria-hidden="true" /></Link></Button>
                <Button asChild variant="outline" size="lg" className="min-h-11"><Link href="#path-title">Lihat jalur</Link></Button>
              </div>
            </div>
            <DatabaseLabPreview />
          </Reveal>
        </section>

        <section className="border-b border-border bg-secondary/30" aria-labelledby="learning-cycle-title">
          <Reveal as="div" stagger revealOnScroll className="rail-inset mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-[0.72fr_1.28fr] md:gap-16 lg:py-24">
            <div className="max-w-sm">
              <h2 id="learning-cycle-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">Belajar lewat satu siklus</h2>
            </div>
            <Reveal as="ol" stagger revealOnScroll className="divide-y divide-border border-y border-border">
              <li className="grid grid-cols-[2.5rem_1fr] gap-3 py-5 sm:grid-cols-[3rem_1fr] sm:gap-4 sm:py-6"><span className="pt-0.5 font-mono text-xs tabular-nums text-muted-foreground">01</span><div><p className="text-sm font-medium">Amati tabel dan relasi</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Kenali kolom, baris, dan kunci penghubung tabel.</p></div></li>
              <li className="grid grid-cols-[2.5rem_1fr] gap-3 py-5 sm:grid-cols-[3rem_1fr] sm:gap-4 sm:py-6"><span className="pt-0.5 font-mono text-xs tabular-nums text-muted-foreground">02</span><div><p className="text-sm font-medium">Prediksi hasil query</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Tebak baris yang muncul sebelum query dijalankan.</p></div></li>
              <li className="grid grid-cols-[2.5rem_1fr] gap-3 py-5 sm:grid-cols-[3rem_1fr] sm:gap-4 sm:py-6"><span className="pt-0.5 font-mono text-xs tabular-nums text-muted-foreground">03</span><div><p className="text-sm font-medium">Jalankan SQL</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Coba query pada dataset latihan langsung di dalam lesson.</p></div></li>
              <li className="grid grid-cols-[2.5rem_1fr] gap-3 py-5 sm:grid-cols-[3rem_1fr] sm:gap-4 sm:py-6"><span className="pt-0.5 font-mono text-xs tabular-nums text-muted-foreground">04</span><div><p className="text-sm font-medium">Telusuri hasil</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Bandingkan hasil dengan prediksi dan pahami alasannya.</p></div></li>
            </Reveal>
          </Reveal>
        </section>

        <section className="border-b border-border" aria-labelledby="path-title">
          <Reveal as="div" stagger revealOnScroll className="rail-inset mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-[0.8fr_1.2fr] md:gap-14 lg:py-24">
            <div>
              <h2 id="path-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">Jalur belajar</h2>
              <p className="mt-3 max-w-[38ch] text-sm leading-6 text-muted-foreground">Tujuh unit dari relasi tabel hingga tantangan query.</p>
              <Button asChild variant="outline" className="mt-5"><Link href={`/learn/${DEFAULT_LEARNING_PATH_SLUG}`}>Lihat semua unit<ArrowRight size={15} aria-hidden="true" /></Link></Button>
            </div>
            <Reveal as="ol" stagger revealOnScroll className="divide-y divide-border border-y border-border">
              {units.map((unit, index) => (
                <li key={unit} className="grid grid-cols-[2.5rem_1fr] gap-3 py-3 text-sm sm:grid-cols-[3rem_1fr] sm:gap-4">
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                  <span className="font-medium">{unit}</span>
                </li>
              ))}
            </Reveal>
          </Reveal>
        </section>

        <section className="border-b border-border" aria-label="Fitur belajar">
          <div className="rail-inset mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Materi, praktik, asesmen</h2>
            <Reveal as="div" stagger revealOnScroll className="mt-8 grid gap-8 sm:grid-cols-2 md:mt-10 md:grid-cols-3 md:gap-10">
              <div className="border-t border-border pt-4"><h3 className="text-sm font-semibold">Materi dan video</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Konsep ringkas dan video pendukung.</p></div>
              <div className="border-t border-border pt-4"><h3 className="text-sm font-semibold">Lab SQL</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Jalankan query pada dataset latihan.</p></div>
              <div className="border-t border-border pt-4"><h3 className="text-sm font-semibold">Latihan dan asesmen</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Latihan mandiri, lalu asesmen pemahaman.</p></div>
            </Reveal>
          </div>
        </section>

        <section className="border-b border-border" aria-labelledby="start-title">
          <Reveal as="div" stagger revealOnScroll className="rail-inset mx-auto flex max-w-6xl flex-col gap-5 px-5 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-20">
            <h2 id="start-title" className="text-lg font-semibold">Mulai dari satu pertanyaan tentang data.</h2>
            <Button asChild size="lg" className="min-h-11"><Link href="/register">Buat akun<ArrowRight size={15} aria-hidden="true" /></Link></Button>
          </Reveal>
        </section>

      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-5 text-xs text-muted-foreground sm:px-8">
          <span>Quethink · Belajar Basis Data</span><span>Data latihan bersifat sintetis.</span>
        </div>
      </footer>
    </div>
  );
}
