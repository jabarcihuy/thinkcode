import { useLocale } from "next-intl";
import { useText } from "@/i18n/use-text";
import Link from "next/link";
import { assessmentDisplayCopy } from "../domain/display-copy";
import { Button } from "@/components/ui/button";
import { DEFAULT_LEARNING_PATH_SLUG, learningPathHref } from "@/features/learning/config";
import { guestHref } from "@/features/guest/domain/links";
import type { LearningOverview } from "@/features/learning/types";

export function CourseTestView({ overview, title, result, resultHref, available, active, startAction, guest = false }: {
  overview: LearningOverview | null; title?: string; result?: { latestScore: number; highestScore: number; passed: boolean };
  resultHref?: string; available: boolean; active: boolean; startAction: React.ReactNode; guest?: boolean;
}) {
  const tx = useText();
  const locale = useLocale() === "id" ? "id" : "en";
  const href = (value: string) => guest ? guestHref(value) : value;
  return <main id="main-content" className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
    <h1 className="text-3xl font-semibold tracking-tight">{tx("Tantangan Akhir")}</h1>
    <p className="mt-4 max-w-[65ch] leading-7 text-muted-foreground">{tx("Gabungkan yang sudah kamu pelajari: jawab soal konsep dan selesaikan kasus SQL. Tantangan terbuka setelah semua materi dan latihan inti tuntas.")}</p>
    <section className="mt-8 border-y border-border py-6" aria-label={tx("Status tantangan")}>
      {!title ? <p className="text-sm text-muted-foreground">{tx("Tantangan sedang disiapkan. Coba kembali nanti.")}</p> : <>
        <h2 className="text-xl font-semibold">{tx(assessmentDisplayCopy(title, locale))}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{tx("Target skor 75/100. Kamu boleh mencoba lagi setelah sesi sebelumnya selesai.")}</p>
        {result && <p className="mt-4 text-sm tabular-nums">{tx(`Terbaru ${result.latestScore}/100 · Tertinggi ${result.highestScore}/100 · ${result.passed ? "Lulus" : "Belum lulus"}`)}</p>}
        {resultHref && <Link className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline" href={resultHref}>{tx("Lihat hasil dan ringkasan topik")}</Link>}
        {startAction}
        {!available && !result && !active && <p className="mt-4 text-sm text-muted-foreground">{tx("Selesaikan")} {overview ? overview.metrics.totalRequiredLessons - overview.metrics.completedRequiredLessons : tx("semua")} {tx("materi beserta latihan inti yang tersisa terlebih dahulu.")}</p>}
      </>}
    </section>
    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
      <Button asChild variant="outline"><Link href={href(learningPathHref(DEFAULT_LEARNING_PATH_SLUG))}>{tx("Tinjau materi")}</Link></Button>
      <Button asChild variant="outline"><Link href={href("/lab")}>{tx("Berlatih di Lab Materi")}</Link></Button>
    </div>
    <p className="mt-6 text-sm leading-6 text-muted-foreground">{tx("Kerjakan mandiri. AI, petunjuk, dan forum dijeda selama tantangan berlangsung.")}</p>
  </main>;
}
