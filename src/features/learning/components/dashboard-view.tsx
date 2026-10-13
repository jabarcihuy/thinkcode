import Link from "next/link";
import { ArrowRight, Check, ClipboardCheck, LockKeyhole, UserRound } from "lucide-react";
import { useText } from "@/i18n/use-text";
import { Button } from "@/components/ui/button";
import { FeatureArtwork } from "@/components/layout/feature-artwork";
import { guestHref } from "@/features/guest/domain/links";
import { learningPathHref } from "../config";
import type { nextLearningAction } from "../domain/next-action";
import type { LearningOverview } from "../types";
import { LearningHomeTools } from "./learning-home-tools";
import styles from "./mobile-lms.module.css";

export function DashboardView({ displayName, overview, action, postPassed, postAvailable, guest = false }: {
  displayName: string | null;
  overview: LearningOverview | null;
  action: ReturnType<typeof nextLearningAction> | null;
  postPassed: boolean;
  postAvailable: boolean;
  guest?: boolean;
}) {
  const tx = useText();
  const destination = (path: string) => guest ? guestHref(path) : path;
  return (
    <main id="main-content" className={styles.dashboard}>
      <header className={styles.welcome}>
        <div className="min-w-0"><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{tx("Halo")}{displayName ? `, ${displayName}` : ""}.</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{tx("Sedikit demi sedikit, pahami cara data bekerja.")}</p></div>
        <Link href={destination("/profile")} aria-label={tx("Profil")} className={styles.avatar}>
          {displayName ? <span aria-hidden="true">{Array.from(displayName.trim())[0]?.toUpperCase()}</span> : <UserRound size={22} aria-hidden="true" />}
        </Link>
      </header>
      {!overview || !action ? <p className="mt-8 text-muted-foreground">{tx("Materi akan muncul setelah dipublikasikan.")}</p> : (
        <div className={styles.dashboardGrid}>
          <div className={styles.learningColumn}>
            <section className={styles.courseCard} aria-label={tx("Langkah belajar berikutnya")}>
              <div className={styles.courseCover}>
                <h2 className="min-w-0 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{tx(overview.path.title)}</h2>
                <FeatureArtwork name="learning-map" className="w-28 sm:w-44" />
              </div>
              <div className={styles.courseProgress}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span>{overview.metrics.completedRequiredLessons} {tx("dari")} {overview.metrics.totalRequiredLessons} {tx("selesai")}</span><span className="font-semibold tabular-nums text-primary">{overview.metrics.percentage}%</span></div>
                <div role="progressbar" aria-label={tx("Progres belajar")} aria-valuenow={overview.metrics.percentage} aria-valuemin={0} aria-valuemax={100} className={styles.progressTrack}><span style={{ width: `${overview.metrics.percentage}%` }} /></div>
              </div>
              <div className={styles.nextAction}>
                <h3 className="text-xl font-semibold tracking-tight">{tx(action.title)}</h3>
                <p className="mt-2 text-sm leading-6">{tx(action.description)}</p>
                <Button asChild className="mt-4 min-h-12 w-full bg-white text-primary hover:bg-secondary"><Link href={destination(action.href)}>{tx(action.label)}<ArrowRight size={18} aria-hidden="true" /></Link></Button>
              </div>
            </section>
            <div className={styles.challengeStatus}>
              <span className={styles.challengeIcon}>{postPassed ? <Check size={22} aria-hidden="true" /> : postAvailable ? <ClipboardCheck size={22} aria-hidden="true" /> : <LockKeyhole size={22} aria-hidden="true" />}</span>
              <div className="min-w-0"><p className="font-semibold">{tx("Tantangan Akhir")}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{tx(postPassed ? "Lulus · jalur belajar selesai" : postAvailable ? "Terbuka, siap dikerjakan" : "Terbuka setelah semua latihan inti tuntas")}</p></div>
              {(postAvailable || postPassed) && <Link href={destination("/post-test")} aria-label={tx("Tantangan Akhir")} className="ml-auto grid min-h-11 min-w-11 shrink-0 place-items-center rounded-md text-primary focus-visible:outline-2 focus-visible:outline-ring"><ArrowRight size={20} aria-hidden="true" /></Link>}
            </div>
          </div>
          <LearningHomeTools materialsHref={learningPathHref(overview.path.slug)} total={overview.lessons.length} guest={guest} />
        </div>
      )}
    </main>
  );
}
