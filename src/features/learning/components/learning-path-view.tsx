import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MaterialList } from "./material-list";
import { ProgressSummary } from "./progress-summary";
import { lessonHref, lessonPracticeHref } from "../config";
import { guestHref } from "@/features/guest/domain/links";
import type { LearningOverview } from "../types";
export function LearningPathView({ overview, authenticated, guest = false }: { overview: LearningOverview; authenticated: boolean; guest?: boolean }) {
 const pathSlug = overview.path.slug;
 const current = overview.metrics.currentLesson;
 const href = (value: string) => guest ? guestHref(value) : value;
 return (    <main id="main-content" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{overview.path.title}</h1>
        <p className="mt-4 max-w-[72ch] text-base leading-7 text-muted-foreground">{overview.path.description}</p>
      </div>
      {authenticated && !overview.baselineComplete && <section className="mt-7 rounded-lg border border-primary/20 bg-white p-5"><h2 className="font-semibold">Mulai dengan tes awal</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Catat pemahaman awalmu sekali untuk membuka materi baru. Tidak ada syarat lulus.</p><Button asChild className="mt-4 w-full sm:w-auto"><Link href={href("/pre-test")}>Buka tes awal</Link></Button></section>}
      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-12">
        <div className="min-w-0"><MaterialList lessons={overview.lessons} pathSlug={pathSlug} authenticated={authenticated} guest={guest} /></div>
        <aside className="space-y-6 lg:sticky lg:top-8" aria-label="Ringkasan jalur belajar">
          <div className="rounded-lg border border-border bg-secondary/50 p-5">
            {authenticated ? <>
              <ProgressSummary metrics={overview.metrics} compact />
              {current && <div className="mt-5 border-t border-border pt-5"><p className="text-sm text-muted-foreground">Lanjutkan dari</p><p className="mt-1 text-sm font-semibold leading-snug">{current.title}</p><Button asChild className="mt-4 w-full"><Link href={href(current.readAt ? lessonPracticeHref(pathSlug, current.slug) : lessonHref(pathSlug, current.slug))}>{current.readAt ? "Buka latihan inti" : "Baca materi"}</Link></Button></div>}
              {!current && overview.baselineComplete && overview.metrics.totalRequiredLessons > 0 && <p className="mt-5 border-t border-border pt-5 text-sm font-medium text-accent">Semua materi wajib tuntas.</p>}
            </> : <><h2 className="text-lg font-semibold">Mulai belajar terarah</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Baca materi pratinjau, lalu buat akun untuk menyimpan progres dan membuka jalur belajar.</p><Button asChild className="mt-5 w-full"><Link href="/register">Buat akun</Link></Button></>}
          </div>
          {authenticated && <Link href={href("/pre-test")} className="inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline">Tes Awal: catat pemahaman awal</Link>}
        </aside>
      </div>
    </main>);
}
