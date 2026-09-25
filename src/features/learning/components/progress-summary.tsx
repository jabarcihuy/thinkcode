import type { LearningMetrics } from "@/features/learning/types";

export function ProgressSummary({ metrics, compact = false }: { metrics: LearningMetrics; compact?: boolean }) {
  return (
    <section aria-label="Progres pembelajaran" className={compact ? "space-y-3" : "space-y-5"}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Progres lesson wajib</p>
          <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight">{metrics.percentage}%</p>
        </div>
        <p className="text-sm tabular-nums text-muted-foreground">{metrics.completedRequiredLessons} dari {metrics.totalRequiredLessons} selesai</p>
      </div>
      <div role="progressbar" aria-label="Progres lesson wajib" aria-valuenow={metrics.percentage} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${metrics.percentage}%` }} />
      </div>
      {!compact && <p className="text-sm leading-relaxed text-muted-foreground">Dihitung dari lesson wajib yang saat ini sudah tersedia.</p>}
    </section>
  );
}
