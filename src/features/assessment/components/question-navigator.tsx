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
  return <nav aria-label="Navigasi soal" className="border-b border-border pb-5 md:border-b-0 md:border-r md:pb-0 md:pr-5">
    <h2 className="text-sm font-semibold">Soal</h2>
    <ol className="mt-3 flex gap-2 overflow-x-auto md:block md:space-y-1">
      {items.map((item, index) => <li key={item.id}>
        <button type="button" aria-current={index === activeIndex ? "step" : undefined}
          onClick={() => onSelect(index)}
          className={`flex min-h-11 min-w-24 items-center gap-2 rounded-md px-3 text-left text-sm md:w-full ${index === activeIndex ? "bg-secondary font-semibold text-secondary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
          <span>Soal {index + 1}</span>
          {isAssessmentAnswerComplete(answers[item.id]) && <span className="ml-auto text-xs font-medium text-primary">Terisi</span>}
        </button>
      </li>)}
    </ol>
  </nav>;
}
