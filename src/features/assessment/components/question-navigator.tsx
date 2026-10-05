import type { PublicAssessmentItem, AssessmentAnswer } from "@/features/assessment/types";

export function isAssessmentAnswerComplete(answer: AssessmentAnswer | undefined): boolean {
  if (!answer) return false;
  if ("sourceCode" in answer) return Boolean(answer.sourceCode.trim());
  if ("output" in answer) return Boolean(answer.output.trim());
  if ("choiceId" in answer) return Boolean(answer.choiceId);
  return answer.order.length > 0;
}

export function QuestionNavigator({
  items, answers, activeIndex, onSelect,
}: { items: PublicAssessmentItem[]; answers: Record<string, AssessmentAnswer>; activeIndex: number; onSelect: (index: number) => void }) {
  return <nav aria-label="Navigasi soal" className="min-w-0 border-b border-border pb-5 md:border-b-0 md:border-r md:pb-0 md:pr-5">
    <h2 className="text-sm font-semibold">Soal</h2>
    <ol className="mt-3 grid grid-cols-5 gap-2 md:block md:space-y-1">
      {items.map((item, index) => <li key={item.id} className="min-w-0">
        <button type="button" aria-current={index === activeIndex ? "step" : undefined}
          onClick={() => onSelect(index)}
          className={`flex min-h-11 w-full flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring md:flex-row md:justify-start md:gap-2 md:px-3 ${index === activeIndex ? "bg-secondary font-semibold text-secondary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
          <span><span className="sr-only md:not-sr-only">Soal </span>{index + 1}</span>
          {isAssessmentAnswerComplete(answers[item.id]) && <span className="text-[10px] font-medium text-accent md:ml-auto md:text-xs">Terisi</span>}
        </button>
      </li>)}
    </ol>
  </nav>;
}
