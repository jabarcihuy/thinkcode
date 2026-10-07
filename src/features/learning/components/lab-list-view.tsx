import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { DEFAULT_LEARNING_PATH_SLUG, lessonPracticeHref } from "@/features/learning/config";
import { Button } from "@/components/ui/button";
import { guestHref } from "@/features/guest/domain/links";
import type { LearningOverview } from "../types";
export function LabListView({ overview, guest = false }: { overview: LearningOverview | null; guest?: boolean }) {
 const destination = (value: string) => guest ? guestHref(value) : value;
  return <main id="main-content" className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
    <h1 className="text-3xl font-semibold tracking-tight">Lab Materi</h1>
    <p className="mt-4 max-w-[65ch] leading-7 text-muted-foreground">Jelajahi tabel, coba query, dan lihat hasilnya. Satu latihan inti per materi membuka langkah berikutnya. Latihan inti boleh diulang tanpa penalti.</p>
    {overview && !overview.baselineComplete && <section className="mt-6 rounded-lg border border-border bg-white p-5" aria-labelledby="lab-baseline-title"><h2 id="lab-baseline-title" className="text-lg font-semibold">Mulai dengan pre-test</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Kenali pemahaman awalmu sebelum membuka materi dan latihan inti. Tidak ada syarat lulus.</p><Button asChild className="mt-4 w-full sm:w-auto"><Link href={destination("/pre-test")}>Mulai pre-test<ArrowRight size={16} aria-hidden="true" /></Link></Button></section>}
    <ol className="mt-8 divide-y divide-border border-y border-border">{overview?.lessons.map((lesson, index) => <li key={lesson.id}>
      {lesson.state === "LOCKED" ? <div className="py-5 text-muted-foreground"><h2 className="text-lg font-semibold">{index + 1}. {lesson.title}</h2><p className="mt-2 flex items-center gap-2 text-sm"><LockKeyhole size={15} aria-hidden="true" />{overview.baselineComplete ? "Tuntaskan materi sebelumnya untuk membuka" : "Selesaikan pre-test untuk memulai"}</p></div> : <Link className="block py-5 focus-visible:outline-2 focus-visible:outline-ring" href={destination(lessonPracticeHref(DEFAULT_LEARNING_PATH_SLUG, lesson.slug))}><h2 className="text-lg font-semibold">{index + 1}. {lesson.title}</h2><span className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent">{index < 2 ? "Jelajahi relasi" : "Coba query"}<ArrowRight size={16} aria-hidden="true" /></span></Link>}
    </li>)}</ol>
    {!overview?.lessons.length && <p className="mt-6 text-sm text-muted-foreground">Lab belum tersedia. Buka materi dari dashboard saat konten dipublikasikan.</p>}
    <nav aria-label="Alat bantu Lab" className="mt-8 flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:flex-wrap sm:gap-6">{[["/playground", "SQLab"], ["/chatbot", "Tanya tutor"]].map(([href, label]) => <Link key={href} href={destination(href!)} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium hover:underline">{label}<ArrowRight size={15} aria-hidden="true" /></Link>)}</nav>
  </main>;
}
