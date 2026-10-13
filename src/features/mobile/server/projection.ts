import type { LessonWithState, LearningOverview } from "@/features/learning/types";
import type { PublicExercise } from "@/features/practice/types";
import { MODELING_SCENARIOS } from "@/features/schema-builder/data/scenarios";
import { readQuestionData } from "@/features/database/validation/question-data";
export type MobileTranslator = <T extends string | null | undefined>(value: T) => T;
export function publicMobileLesson(lesson: LessonWithState, tx: MobileTranslator) {
  return { id: lesson.id, slug: lesson.slug, title: tx(lesson.title), summary: tx(lesson.summary), state: lesson.state, readAt: lesson.readAt ?? null, chapterTitle: tx(lesson.chapterTitle), chapterPosition: lesson.chapterPosition, isRequired: lesson.is_required && lesson.chapterIsRequired };
}
export function publicMobileOverview(overview: LearningOverview, tx: MobileTranslator) {
  return { path: { id: overview.path.id, slug: overview.path.slug, title: tx(overview.path.title), description: tx(overview.path.description) }, lessons: overview.lessons.map(lesson => publicMobileLesson(lesson, tx)), metrics: { totalRequiredLessons: overview.metrics.totalRequiredLessons, completedRequiredLessons: overview.metrics.completedRequiredLessons, percentage: overview.metrics.percentage, currentLessonId: overview.metrics.currentLesson?.id ?? null } };
}
export function publicMobileExercise(exercise: PublicExercise, tx: MobileTranslator) {
  const raw = exercise.publicConfig;
  const config = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const items = (value: unknown) => Array.isArray(value) ? value.flatMap(item => item && typeof item === "object" && typeof item.id === "string" && typeof item.text === "string" ? [{ id: item.id, text: tx(item.text) }] : []) : [];
  const mode = config.mode === "schema" || config.mode === "choice" || config.mode === "order" ? config.mode : "output";
  const data = readQuestionData(config.data);
  const scenario = mode === "schema" ? MODELING_SCENARIOS[0]! : null;
  return {
    id: exercise.id, title: tx(exercise.title), prompt: tx(exercise.prompt), type: exercise.type, mode, passed: exercise.passed,
    starterCode: exercise.starterCode, columns: Array.isArray(config.columns) ? config.columns.filter((column): column is string => typeof column === "string") : [],
    options: mode === "choice" ? items(config.options) : [], blocks: mode === "order" ? items(config.blocks) : [], data,
    modeling: scenario ? { title: tx(scenario.title), prompt: tx(scenario.prompt), tables: scenario.reference.tables.map(table => ({ id: table.id, name: table.name, columns: table.columns.map(column => ({ id: column.id, name: column.name, type: column.type, primary: false })) })) } : null,
  };
}
