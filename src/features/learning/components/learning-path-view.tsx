import Link from "next/link";
import { useText } from "@/i18n/use-text";
import { FeatureArtwork } from "@/components/layout/feature-artwork";
import { Button } from "@/components/ui/button";
import { MaterialList } from "./material-list";
import { ProgressSummary } from "./progress-summary";
import { lessonHref, lessonPracticeHref } from "../config";
import { guestHref } from "@/features/guest/domain/links";
import type { LearningOverview } from "../types";
import styles from "./mobile-lms.module.css";

export function LearningPathView({ overview, authenticated, guest = false }: {
  overview: LearningOverview;
  authenticated: boolean;
  guest?: boolean;
}) {
  const tx = useText();
  const pathSlug = overview.path.slug;
  const current = overview.metrics.currentLesson;
  const href = (path: string) => guest ? guestHref(path) : path;
  return (
    <main id="main-content" className={styles.course}>
      <header className={styles.courseHeading}>
        <h1 className="min-w-0 flex-1 font-semibold tracking-tight">{tx(overview.path.title)}</h1>
        <FeatureArtwork name="learning-map" className="w-20 sm:w-40" />
        <p className="basis-full text-sm leading-6 text-muted-foreground">{tx(overview.path.description)}</p>
      </header>
      <div className={styles.courseGrid}>
        <aside aria-label={tx("Ringkasan jalur belajar")} className={styles.resumePanel}>
          {authenticated ? <>
            <ProgressSummary metrics={overview.metrics} compact />
            {current && <div className="mt-4 border-t border-border pt-4"><p className="text-sm text-muted-foreground">{tx("Lanjutkan dari")}</p><p className="mt-1 font-semibold leading-snug">{tx(current.title)}</p><Button asChild className="mt-3 min-h-12 w-full"><Link href={href(current.readAt ? lessonPracticeHref(pathSlug, current.slug) : lessonHref(pathSlug, current.slug))}>{tx(current.readAt ? "Buka latihan inti" : "Baca materi")}</Link></Button></div>}
            {!current && overview.baselineComplete && overview.metrics.totalRequiredLessons > 0 && <p className="mt-4 border-t border-border pt-4 text-sm font-medium text-primary">{tx("Semua materi wajib tuntas.")}</p>}
          </> : <>
            <h2 className="text-lg font-semibold">{tx("Mulai belajar terarah")}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{tx("Baca materi pratinjau, lalu buat akun untuk menyimpan progres dan membuka jalur belajar.")}</p>
            <Button asChild className="mt-4 w-full"><Link href="/register">{tx("Buat akun")}</Link></Button>
          </>}
        </aside>
        <div><MaterialList lessons={overview.lessons} pathSlug={pathSlug} authenticated={authenticated} guest={guest} /></div>
      </div>
    </main>
  );
}
