import { Check, Circle, LockKeyhole } from "lucide-react";
import type { LessonState } from "@/features/learning/types";

const labels: Record<LessonState, string> = {
  COMPLETED: "Completed",
  IN_PROGRESS: "Current",
  AVAILABLE: "Available",
  LOCKED: "Locked",
};

export function LessonStateLabel({ state }: { state: LessonState }) {
  const Icon = state === "COMPLETED" ? Check : state === "LOCKED" ? LockKeyhole : Circle;
  return <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${state === "LOCKED" ? "text-muted-foreground" : state === "COMPLETED" ? "text-primary" : "text-foreground"}`}><Icon size={14} aria-hidden="true" />{labels[state]}</span>;
}
