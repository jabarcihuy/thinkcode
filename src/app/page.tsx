import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { DatabaseLabPreview } from "@/features/landing/components/database-lab-preview";
import { DEFAULT_LEARNING_PATH_SLUG } from "@/features/learning/config";

export const metadata: Metadata = {
  title: "Quethink — Pahami data, buktikan dengan query",
  description: "Belajar basis data melalui materi, skema visual 2D, praktik SQL, dan tes pemahaman.",
};
const journey = [
  ["Kenali titik awal", "Pre-test singkat untuk mencatat pemahamanmu, tanpa syarat lulus."],
  ["Pelajari satu materi", "Baca dengan tenang. Unduh PDF atau gunakan video pendamping yang tersedia."],
  ["Buktikan di Lab", "Amati data, coba query, lalu tuntaskan satu latihan inti untuk lanjut."],
  ["Uji pemahaman", "Post-test mandiri setelah semua materi tuntas. Lulus dengan nilai minimal 75."],
];
const topics = [
  ["Relasi", "Kenali tabel, record, kolom, dan kunci. Susun modelmu sendiri sebelum menulis query.", "2 materi"],
  ["Read", "Pilih, saring, hubungkan, dan rangkum data untuk menjawab pertanyaan nyata.", "6 materi"],
  ["Write", "Tambah dan ubah data latihan dengan aman. Periksa target, amati perubahan, lalu reset.", "3 materi"],
];
export default function HomePage() {
  return <div className="min-h-dvh"><SiteHeader /><main id="main-content" className="min-w-0 [overflow-wrap:anywhere]">
    <section className="mx-auto grid min-w-0 max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-14 pt-12 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
      <div><h1 className="max-w-[13ch] text-[2rem] font-semibold leading-[1.12] tracking-tight min-[400px]:text-[2.65rem] sm:text-6xl">Pahami data.<br /><span className="text-primary">Buktikan dengan query.</span></h1><p className="mt-5 max-w-[45ch] text-base leading-7 text-muted-foreground sm:text-lg">Belajar basis data lewat skema yang bisa diamati, query yang bisa dicoba, dan latihan yang membuatmu paham.</p><div className="mt-7 flex flex-col gap-3 min-[400px]:flex-row"><Button asChild size="lg"><Link href="/register">Mulai belajar<ArrowRight size={17} aria-hidden="true" /></Link></Button><Button asChild variant="outline" size="lg"><Link href="#materi">Lihat materi</Link></Button></div></div>
      <DatabaseLabPreview />
    </section>
    <section className="border-y border-border bg-white" aria-labelledby="journey-title"><div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20"><div className="max-w-xl"><h2 id="journey-title" className="text-3xl font-semibold tracking-tight">Selalu tahu langkah berikutnya.</h2><p className="mt-3 leading-7 text-muted-foreground">Satu alur yang terarah, dengan ruang untuk mencoba lagi.</p></div><ol className="mt-8 grid gap-0 md:grid-cols-4 md:gap-6">{journey.map(([title, body], i) => <li key={title} className="flex min-w-0 gap-4 border-t border-border py-6 md:block"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">{i + 1}</span><div className="min-w-0"><h3 className="font-semibold md:mt-4">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p></div></li>)}</ol></div></section>
    <section id="materi" aria-labelledby="topics-title" className="mx-auto grid min-w-0 max-w-6xl grid-cols-1 scroll-mt-6 gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16"><div><h2 id="topics-title" className="text-3xl font-semibold tracking-tight">Dari bentuk data<br />hingga perubahan data.</h2><p className="mt-4 max-w-[40ch] leading-7 text-muted-foreground">11 materi untuk membangun pemahaman dasar. Pelajari relasi lebih dulu, baca data, lalu ubah dengan aman.</p><Link href={`/learn/${DEFAULT_LEARNING_PATH_SLUG}`} className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:underline">Lihat seluruh materi<ArrowRight size={16} aria-hidden="true" /></Link></div><div className="divide-y divide-border border-y border-border">{topics.map(([name, body, count]) => <section key={name} className="py-6"><div className="flex items-center justify-between gap-4"><h3 className="text-xl font-semibold">{name}</h3><span className="text-sm text-muted-foreground">{count}</span></div><p className="mt-3 max-w-[55ch] text-sm leading-7 text-muted-foreground">{body}</p></section>)}</div></section>
    <section className="bg-secondary" aria-labelledby="lab-title"><div className="mx-auto grid min-w-0 max-w-6xl grid-cols-1 gap-8 px-5 py-14 sm:px-8 sm:py-20 md:grid-cols-2 md:gap-16"><div><h2 id="lab-title" className="text-3xl font-semibold tracking-tight">Data terasa lebih nyata<br />ketika bisa dieksplorasi.</h2><p className="mt-4 max-w-[48ch] leading-7 text-muted-foreground">Di Lab, lihat hubungan antartabel, prediksi hasil query, lalu bandingkan dengan hasilnya. Dataset latihan bisa direset kapan saja.</p><p className="mt-5 text-sm font-medium text-primary">Skema 2D · Query SQL · Hasil langsung</p></div><div className="space-y-7"><section><h3 className="text-xl font-semibold">Petunjuk saat diperlukan</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">Tutor AI membantu menjelaskan konsep dan memberi petunjuk di Lab. Kamu tetap yang mencoba dan mengambil keputusan.</p></section><section className="border-t border-primary/15 pt-6"><h3 className="text-xl font-semibold">Latihan dan tes punya peran berbeda</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">Ulangi latihan sesukamu. Saat tes, kerjakan mandiri: AI dijeda dan nilai diperiksa di server.</p></section></div></div></section>
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20"><div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-3xl font-semibold tracking-tight">Mulai dari rasa ingin tahu.</h2><p className="mt-3 leading-7 text-muted-foreground">Satu materi, satu percobaan, satu pemahaman baru.</p></div><Button asChild size="lg" className="w-full sm:w-auto"><Link href="/register">Buat akun<ArrowRight size={17} aria-hidden="true" /></Link></Button></div></section>
  </main><footer className="border-t border-border bg-white"><div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-5 py-6 text-xs text-muted-foreground sm:px-8"><span>Quethink · Belajar Basis Data</span><span>Dataset latihan sintetis.</span></div></footer></div>;
}
