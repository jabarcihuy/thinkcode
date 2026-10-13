import "server-only";
import { z } from "zod";
import { getPublicExercises, getGradingExercise, recordGradedAttempt } from "@/features/practice/data/exercise-repository";
import { gradeExercise } from "@/features/practice/domain/grade-exercise";
import { parseSubmission } from "@/features/practice/validation/submission";
import { lessonScenarios } from "@/features/database/domain/lesson-scenarios";
import { getDataset, type PRACTICE_DATASETS } from "@/features/database/data/datasets";
import { readQuestionData } from "@/features/database/validation/question-data";
import { DEFAULT_LEARNING_PATH_SLUG } from "@/features/learning/config";
import type { Json } from "@/types/database";
import type { MobileActor } from "./auth";
import { MobileError } from "./auth";
import { mobileOverview, activeMobileAssessment, requireMobileMaterial } from "./access";
import { publicMobileLesson, publicMobileOverview, publicMobileExercise, type MobileTranslator } from "./projection";

export async function readMobileCourse(actor: MobileActor, tx: MobileTranslator) {
  const [overview, activeAssessment] = await Promise.all([mobileOverview(actor), activeMobileAssessment(actor)]);
  if (!overview) throw new MobileError(404, "not_found", "The course is not available yet.");
  return { ...publicMobileOverview(overview, tx), profile: { displayName: actor.displayName, role: actor.role }, activeAssessment };
}
export async function readMobileMaterial(actor: MobileActor, id: string, tx: MobileTranslator) {
  const { lesson, active } = await requireMobileMaterial(actor, id);
  const { data, error } = await actor.db.from("lessons").select("content,example_sql").eq("id", id).eq("is_published", true).single();
  if (error || !data) throw new MobileError(503, "unavailable", "This material could not be loaded.");
  return { lesson: publicMobileLesson(lesson, tx), content: tx(data.content), activeAssessment: active };
}
export async function acknowledgeMobileReading(actor: MobileActor, id: string) {
  const { active } = await requireMobileMaterial(actor, id);
  if (active) throw new MobileError(403, "assessment_active", "Reading progress is paused during your active challenge.");
  const { error } = await actor.db.rpc("acknowledge_material_read", { p_lesson_id: id });
  if (error) throw new MobileError(409, "not_saved", "Reading progress could not be saved. Refresh and try again.");
  return { acknowledged: true };
}
export async function readMobileLab(actor: MobileActor, id: string, tx: MobileTranslator) {
  const { lesson } = await requireMobileMaterial(actor, id, true);
  const [exercises, material] = await Promise.all([
    getPublicExercises(id, actor.userId, actor.db),
    actor.db.from("lessons").select("example_sql").eq("id", id).eq("is_published", true).single(),
  ]);
  if (material.error) throw material.error;
  const core = exercises.filter(item => item.isRequired);
  if (!core.length || core.some(item => !["PREDICT_OUTPUT", "PSEUDOCODE", "FLOWCHART"].includes(item.type))) throw new MobileError(503, "unavailable", "The core Lab is not available on mobile yet.");
  const publicExercises = core.map(item => publicMobileExercise(item, tx));
  const scenarios = lessonScenarios(lesson.slug, { title: lesson.title, sql: material.data.example_sql ?? "SELECT * FROM students;", prompt: "" });
  const ids = new Set<(typeof PRACTICE_DATASETS)[number]["id"]>(scenarios.map(item => item.datasetId));
  for (const item of core) {
    const config = item.publicConfig;
    const data = readQuestionData(config && typeof config === "object" && !Array.isArray(config) ? config.data : null);
    if (data) ids.add(data.datasetId);
  }
  return { lesson: publicMobileLesson(lesson, tx), exercises: publicExercises, sqlEnabled: lesson.chapterPosition > 1, allowWrite: lesson.chapterPosition >= 3, scenarios: scenarios.map(item => ({ datasetId: item.datasetId, title: tx(item.title), sql: item.sql })), datasets: [...ids].map(id => { const dataset = getDataset(id); return { ...dataset, title: tx(dataset.title), description: tx(dataset.description), relations: dataset.relations.map(relation => ({ ...relation, explanation: tx(relation.explanation) })) }; }) };
}
export async function checkMobileExercise(actor: MobileActor, id: string, body: unknown, tx: MobileTranslator) {
  if (!z.object({ pathSlug: z.literal(DEFAULT_LEARNING_PATH_SLUG), answer: z.unknown() }).strict().safeParse(body).success) throw new MobileError(400, "invalid_input", "Submit only your answer for this course.");
  const core = await actor.db.from("published_exercise_catalog").select("id").eq("id", id).eq("is_required", true).maybeSingle();
  if (core.error) throw new MobileError(503, "unavailable", "The exercise could not be loaded.");
  if (!core.data) throw new MobileError(404, "not_found", "Core exercise not found.");
  const exercise = await getGradingExercise(id);
  if (!exercise || !["PREDICT_OUTPUT", "PSEUDOCODE", "FLOWCHART"].includes(exercise.type)) throw new MobileError(404, "not_found", "Core exercise not found.");
  const submission = parseSubmission(exercise.type, body);
  if (!submission || submission.pathSlug !== DEFAULT_LEARNING_PATH_SLUG || submission.runResults || submission.sourceCode) throw new MobileError(400, "invalid_input", "Submit only your answer for this course.");
  await requireMobileMaterial(actor, exercise.lessonId, true);
  const quota = await actor.db.rpc("consume_code_request_quota", { p_kind: "check" });
  if (quota.error) throw new MobileError(503, "unavailable", "The answer could not be checked. Try again.");
  if (!quota.data) throw new MobileError(429, "rate_limited", "Too many checks. Please wait a moment.");
  const graded = gradeExercise(exercise, submission);
  const lessonCompleted = await recordGradedAttempt({ userId: actor.userId, exerciseId: id, sourceCode: null, answer: submission.answer, score: graded.score, passed: graded.passed, feedback: { passed: graded.passed, score: graded.score, feedback: graded.feedback, visibleTests: [] } as Json });
  return { passed: graded.passed, feedback: tx(graded.feedback), lessonCompleted };
}
