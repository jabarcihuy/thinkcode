import Link from "next/link";
import { ArrowRight, BookOpen, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressSummary } from "./progress-summary";
import { learningPathHref } from "../config";
import { guestHref } from "@/features/guest/domain/links";
import { nextLearningAction } from "../domain/next-action";
import type { LearningOverview } from "../types";
export function DashboardView({ displayName, overview, action, postPassed, postAvailable, guest = false }: { displayName: string | null; overview: LearningOverview | null; action: ReturnType<typeof nextLearningAction> | null; postPassed: boolean; postAvailable: boolean; guest?: boolean }) {
 const destination = (value: string) => guest ? guestHref(value) : value;
  return <main id="main-content" className="mx-auto min-w-0 max-w-6xl px-5 py-8 sm:px-8 sm:py-12 [overflow-wrap:anywhere]">
    <h1 className="mt-2 text-3xl font-semibold tracking-tight">Halo{displayName ? `, ${displayName}` : ""}.</h1>
    <p className="mt-3 leading-7 text-muted-foreground">Sedikit demi sedikit, pahami cara data bekerja.</p>
    {!overview || !action ? <p className="mt-10 text-muted-foreground">Materi akan muncul setelah dipublikasikan.</p> : <div className="mt-8 grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0">
        <section className="min-w-0 rounded-lg border border-primary/15 bg-white p-5 sm:p-8" aria-label="Langkah belajar berikutnya">
          <h2 className="text-2xl font-semibold">{action.title}</h2>
          <p className="mt-3 max-w-[55ch] leading-7 text-muted-foreground">{action.description}</p>
          <Button asChild className="mt-6 h-auto min-h-11 w-full py-3 sm:w-auto"><Link href={destination(action.href)}>{action.label}<ArrowRight size={16} aria-hidden="true" /></Link></Button>
        </section>
        <nav aria-label="Jelajahi pembelajaran" className="mt-6 divide-y divide-border rounded-lg border border-border bg-white px-5">
          {[[learningPathHref(overview.path.slug), "Materi", "11 bacaan · PDF dan video pendamping", BookOpen], ["/lab", "Lab Materi", "Amati, coba, dan buktikan pemahamanmu", FlaskConical]].map(([href, title, description, Icon]) => { const Symbol = Icon as typeof BookOpen; return <Link key={String(href)} href={destination(String(href))} className="flex min-h-24 items-center gap-4 py-4 focus-visible:outline-2 focus-visible:outline-ring"><Symbol size={22} className="shrink-0 text-primary" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block font-semibold">{String(title)}</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">{String(description)}</span></span><ArrowRight size={17} className="shrink-0" aria-hidden="true" /></Link>; })}
        </nav>
      </div>
      <aside aria-label="Progres belajar" className="min-w-0 rounded-lg border border-border bg-white p-5 sm:p-6"><ProgressSummary metrics={overview.metrics} /><div className="mt-6 border-t border-border pt-5"><p className="text-sm font-semibold">Post-test</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{postPassed ? "Lulus · jalur belajar selesai" : postAvailable ? "Terbuka, siap dikerjakan" : "Terbuka setelah semua latihan inti tuntas"}</p></div></aside>
    </div>}
  </main>;
}
