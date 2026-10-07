

import { useText } from "@/i18n/use-text";
import type { LearningMetrics } from "@/features/learning/types";

export function ProgressSummary({ metrics, compact = false }: { metrics: LearningMetrics; compact?: boolean }) {
  const tx = useText();

  const total = metrics.totalRequiredLessons;
  const done = metrics.completedRequiredLessons;
  const cells = Math.min(total, 20);

  return (
    <section aria-label={tx("Progres pembelajaran")} className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{tx("Progres belajar")}</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{metrics.percentage}%</p>
        </div>
        <p className="text-sm tabular-nums text-muted-foreground">{done} {" "}{tx("dari")}{" "}{total} {" "}{tx("selesai")}</p>
      </div>

      {/*
        The strip is the visual form; the progressbar role sits on a wrapper that
        stays in the accessibility tree so assistive technology still gets the
        value. Above 20 lessons the strip stops mapping one frame per lesson and
        becomes a proportional readout instead.
      */}
      <div
        role="progressbar"
        aria-valuenow={metrics.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={tx("Progres belajar")}
        className="flex gap-1"
      >
        {Array.from({ length: cells }, (_, i) => {
          const position = cells === total ? i : Math.floor((i / cells) * total);
          const complete = position < done;
          const live = !complete && position === done;
          return (
            <span
              key={i}
              aria-hidden="true"
              className={`h-1.5 flex-1 rounded-full ${
                complete ? "bg-primary" : live ? "bg-live" : "bg-border"
              }`}
            />
          );
        })}
      </div>

      {!compact && <p className="text-sm leading-relaxed text-muted-foreground">{tx("Materi tuntas setelah membaca dan lulus latihan inti.")}</p>}
    </section>
  );
}
