import { localizeMetadata } from "@/i18n/metadata";


import { useText } from "@/i18n/use-text";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { DatabaseLabPreview } from "@/features/landing/components/database-lab-preview";
import { SqlabPreview } from "@/features/landing/components/sqlab-preview";
import { DEFAULT_LEARNING_PATH_SLUG } from "@/features/learning/config";

const pageMetadata: Metadata = {
  title: "Quethink — Belajar basis data, lihat cara kerjanya",
  description: "Platform belajar basis data dengan materi dan PDF, video pendamping, skema visual 2D, latihan SQL, SQLab, Tutor AI, serta tes awal dan tes akhir.",
};

const journey = [
  ["Tes Awal", "Kenali pemahaman awalmu. Tidak ada syarat lulus untuk mulai belajar."],
  ["Materi", "Baca satu konsep. Unduh PDF atau tonton video pendamping yang tersedia."],
  ["Lab Materi", "Amati tabel dan relasinya, lalu selesaikan latihan inti untuk membuka materi berikutnya."],
  ["Tes Akhir", "Uji pemahaman secara mandiri setelah seluruh materi tuntas. Nilai kelulusan minimal 75."],
];
const topics = [
  ["Relasi", "Pahami tabel, baris, kolom, dan kunci. Lihat bagaimana data saling terhubung.", "2 materi"],
  ["Read · Baca data", "Pilih, saring, hubungkan, dan rangkum data untuk menjawab pertanyaan.", "6 materi"],
  ["Write · Ubah data", "Tambah, ubah, dan hapus data latihan. Periksa target dan amati perubahan.", "3 materi"],
];

export default function HomePage() {
  const tx = useText();

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main id="main-content" className="min-w-0 [overflow-wrap:anywhere]">
        <section className="mx-auto grid min-w-0 max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-14 pt-12 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
          <div>
            <h1 className="max-w-[14ch] text-[2rem] font-semibold leading-[1.12] tracking-tight min-[400px]:text-[2.65rem] sm:text-6xl">{tx("Belajar basis data.")}<br /><span className="text-primary">{tx("Lihat cara kerjanya.")}</span></h1>
            <p className="mt-5 max-w-[45ch] text-base leading-7 text-muted-foreground sm:text-lg">{tx("Mulai dari hubungan antartabel, lalu coba SQL dan lihat hasilnya. Materi terarah, visual 2D, dan latihan membantumu memahami setiap langkah.")}</p>
            <div className="mt-7 flex flex-col gap-3 min-[400px]:flex-row">
              <Button asChild size="lg"><Link href="/register">{tx("Mulai belajar")}<ArrowRight size={17} aria-hidden="true" /></Link></Button>
              <Button asChild variant="outline" size="lg"><Link href="/guest/start">{tx("Coba sebagai tamu")}</Link></Button>
            </div>
            <p className="mt-3 max-w-[45ch] text-sm leading-6 text-muted-foreground">{tx("Tamu cukup mengisi nama. Buat akun untuk menyimpan progres.")}</p>
          </div>
          <DatabaseLabPreview />
        </section>

        <section className="border-y border-border bg-white" aria-labelledby="journey-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
            <div className="max-w-xl"><h2 id="journey-title" className="text-3xl font-semibold tracking-tight">{tx("Selalu tahu langkah berikutnya.")}</h2><p className="mt-3 leading-7 text-muted-foreground">{tx("Ikuti alur belajar dari titik awal hingga tes akhir. Latihan bisa dicoba kembali.")}</p></div>
            <ol className="mt-8 grid gap-0 md:grid-cols-4 md:gap-6">
              {journey.map(([title, body], i) => (
                <li key={title} className="flex min-w-0 gap-4 border-t border-border py-6 md:block">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">{i + 1}</span>
                  <div className="min-w-0"><h3 className="font-semibold md:mt-4">{tx(title)}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{tx(body)}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="materi" aria-labelledby="topics-title" className="mx-auto grid min-w-0 max-w-6xl grid-cols-1 scroll-mt-6 gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 id="topics-title" className="text-3xl font-semibold tracking-tight">{tx("Pahami relasi.")}<br />{tx("Baca data. Ubah data.")}</h2>
            <p className="mt-4 max-w-[40ch] leading-7 text-muted-foreground">{tx("11 materi dasar, disusun bertahap untuk pemula. Halaman materi fokus pada penjelasan; praktiknya punya ruang sendiri di Lab Materi.")}</p>
            <p className="mt-3 max-w-[40ch] text-sm leading-7 text-muted-foreground">{tx("PDF bisa diunduh untuk belajar kembali. Beberapa materi dilengkapi video pendamping berbahasa Indonesia.")}</p>
            <Link href={`/learn/${DEFAULT_LEARNING_PATH_SLUG}`} className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:underline">{tx("Lihat seluruh materi")}<ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {topics.map(([name, body, count]) => (
              <section key={name} className="py-6"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-xl font-semibold">{tx(name)}</h3><span className="text-sm text-muted-foreground">{tx(count)}</span></div><p className="mt-3 max-w-[55ch] text-sm leading-7 text-muted-foreground">{tx(body)}</p></section>
            ))}
          </div>
        </section>

        <section className="bg-secondary" aria-labelledby="lab-title">
          <div className="mx-auto grid min-w-0 max-w-6xl grid-cols-1 gap-8 px-5 py-14 sm:px-8 sm:py-20 md:grid-cols-2 md:gap-16">
            <div><h2 id="lab-title" className="text-3xl font-semibold tracking-tight">{tx("Lihat hubungan. Amati hasilnya.")}</h2><p className="mt-4 max-w-[48ch] leading-7 text-muted-foreground">{tx("Di Lab Materi, amati tabel dan hubungan PK–FK melalui skema 2D. Prediksi hasil query, jalankan, lalu bandingkan dengan data yang muncul.")}</p><p className="mt-4 max-w-[48ch] text-sm leading-7 text-muted-foreground">{tx("Latihan menggunakan kasus kampus, katalog buku, dan toko. Data latihan terisolasi dan bisa direset.")}</p></div>
            <div className="space-y-7">
              <section><h3 className="text-xl font-semibold">{tx("Tutor AI saat kamu buntu")}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{tx("Minta petunjuk tentang konsep, query, atau kesalahan di Lab Materi. Chatbot juga tersedia dari menu. Kamu tetap yang mencoba dan mengambil keputusan.")}</p></section>
              <section className="border-t border-primary/15 pt-6"><h3 className="text-xl font-semibold">{tx("Latihan untuk mencoba. Tes untuk mengukur.")}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{tx("Ulangi latihan tanpa penalti. Tes Awal mencatat titik awal; tes akhir menilai pemahaman akhir. Saat tes aktif, bantuan AI dinonaktifkan.")}</p></section>
            </div>
          </div>
        </section>

        <section aria-labelledby="sqlab-title" className="mx-auto grid min-w-0 max-w-6xl grid-cols-1 items-center gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 id="sqlab-title" className="text-3xl font-semibold tracking-tight">{tx("Punya ide database sendiri?")}<br /><span className="text-primary">{tx("Coba di SQLab.")}</span></h2>
            <p className="mt-4 max-w-[42ch] leading-7 text-muted-foreground">{tx("Buat tabel, hubungkan relasinya, isi data, lalu tulis query. Skema visual membantu melihat database yang kamu susun.")}</p>
            <p className="mt-3 max-w-[42ch] text-sm leading-7 text-muted-foreground">{tx("Butuh titik awal? Minta AI merancang contoh database, tinjau skema dan datanya, lalu terapkan saat sudah sesuai.")}</p>
            <p className="mt-3 max-w-[42ch] text-sm leading-7 text-muted-foreground">{tx("SQLab adalah ruang eksperimen opsional. Tidak mengubah nilai atau progres materi; database berjalan lokal di browser.")}</p>
            <Link href="/playground" className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:underline">{tx("Buka SQLab")}<ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <SqlabPreview />
        </section>

        <section className="border-t border-border bg-white">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-20">
            <div><h2 className="text-3xl font-semibold tracking-tight">{tx("Mulai dari satu hubungan.")}</h2><p className="mt-3 max-w-[48ch] leading-7 text-muted-foreground">{tx("Kenali datanya, coba query-nya, bangun pemahamanmu.")}</p></div>
            <Button asChild size="lg" className="w-full sm:w-auto"><Link href="/register">{tx("Buat akun")}<ArrowRight size={17} aria-hidden="true" /></Link></Button>
          </div>
        </section>
      </main>
      <footer className="border-t border-border bg-white"><div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-5 py-6 text-xs text-muted-foreground sm:px-8"><span>{tx("Quethink · Belajar Basis Data")}</span><span>{tx("Dataset latihan sintetis.")}</span></div></footer>
    </div>
  );
}

export async function generateMetadata() { return localizeMetadata(pageMetadata); }
