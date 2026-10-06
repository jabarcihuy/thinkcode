"use client";

import { useMemo } from "react";
import { useLocalDraft } from "@/lib/browser/use-local-draft";
import { initialAssessmentDraft, readAssessmentDraft } from "@/features/assessment/domain/assessment-draft";
import type { PublicAssessmentItem, AssessmentAnswer } from "@/features/assessment/types";
import type { PublicExercise } from "../types";

export function usePracticeDraft(exercise: PublicExercise, userId?: string) {
  const item = useMemo((): PublicAssessmentItem => ({ ...exercise, topic: "", publicConfig: exercise.publicConfig ?? {} }), [exercise]);
  const initial = useMemo(() => initialAssessmentDraft([item]).answers[item.id]!, [item]);
  const parse = useMemo(() => (answer: unknown): AssessmentAnswer | null =>
    readAssessmentDraft({ answers: { [item.id]: answer }, activeIndex: 0 }, [item])?.answers[item.id] ?? null, [item]);
  return useLocalDraft({
    key: userId ? `quethink:practice-draft:v1:${userId}:${exercise.id}` : null,
    signature: JSON.stringify([item.type, item.prompt, item.starterCode, item.publicConfig]), initial, parse,
  });
}
