import type { LearningMetrics } from "@/features/learning/types";

/**
 * Progress as a position on a strip, not a generic filled bar.
 *
 * The world is a film strip, so progress is shown as discrete numbered frames:
 * the ones already run are solid, the live one carries the accent, the rest are
 * hairline. Discrete frames are also more honest than a continuous bar here,
 * because lessons are countable units, not a percentage of fluid.
 *
 * State is carried by line weight and fill, never by hue alone, so it survives
 * greyscale. The percentage remains for screen readers and for the numeric
 * readout a learner can act on.
 */
export function ProgressSummary({ metrics, compact = false }: { metrics: LearningMetrics; compact?: boolean }) {
  const total = metrics.totalRequiredLessons;
  const done = metrics.completedRequiredLessons;
  const cells = Math.min(total, 20);

  return (
    <section aria-label="Progres pembelajaran" className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Progres membaca</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{metrics.percentage}%</p>
        </div>
        <p className="text-sm tabular-nums text-muted-foreground">{done} dari {total} selesai</p>
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
        aria-label="Progres membaca"
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
                complete ? "bg-foreground" : live ? "bg-live" : "bg-border"
              }`}
            />
          );
        })}
      </div>

      {!compact && <p className="text-sm leading-relaxed text-muted-foreground">Status membaca dicatat terpisah dari nilai post-test.</p>}
    </section>
  );
}
