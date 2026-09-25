import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { consumeCodeQuota } from "@/features/workspace/server/rate-limit";
import { OpenAICompatibleAIProvider } from "@/lib/providers/openai-compatible-ai-provider";
import type { AIMessage, AIProvider } from "@/lib/providers/ai-provider";
import { createTutorMessages, createTutorTools, isExplicitSolutionRequest, nextHintLevel, type TutorSnapshot } from "@/features/ai/domain/tutor-context";
import { assertAssessmentInactive, AssessmentTutorBlockedError } from "@/features/ai/domain/assessment-guard";
import type { TutorRequest } from "@/features/ai/types";

export class TutorRequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function authorizeTutor(options: { rateLimit?: boolean } = {}) {
  const client = await createClient();
  const { data: claims, error } = await client.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (error || !userId) throw new TutorRequestError(401, "Masuk untuk menggunakan AI Tutor.");

  const { data: active, error: guardError } = await client.rpc("current_user_has_active_assessment");
  if (guardError) throw new TutorRequestError(503, "Status assessment belum dapat diperiksa. Coba lagi.");
  try { assertAssessmentInactive(active); }
  catch (error) {
    if (error instanceof AssessmentTutorBlockedError) throw new TutorRequestError(error.status, error.message);
    throw error;
  }
  if (options.rateLimit !== false && !(await consumeCodeQuota("ai"))) throw new TutorRequestError(429, "Batas AI Tutor tercapai. Coba lagi sebentar.");

  return { client, userId };
}

export async function getTutorHistory(userId: string, lessonId: string, exerciseId?: string) {
  const admin = createPrivilegedClient();
  const { data: available, error: availabilityError } = await admin.rpc("phase1_lesson_is_available", {
    p_lesson_id: lessonId, p_user_id: userId,
  });
  if (availabilityError || !available) throw new TutorRequestError(404, "Lesson tidak tersedia.");
  if (exerciseId) {
    const { data: exercise } = await admin.from("exercises").select("id, lesson_id, is_published")
      .eq("id", exerciseId).maybeSingle();
    if (!exercise?.is_published || exercise.lesson_id !== lessonId) throw new TutorRequestError(404, "Practice tidak tersedia.");
  }
  const { data: sessions, error: sessionError } = await admin.from("ai_sessions")
    .select("id, exercise_id").eq("user_id", userId).eq("lesson_id", lessonId)
    .order("updated_at", { ascending: false }).limit(10);
  if (sessionError) throw new TutorRequestError(503, "Riwayat AI belum dapat dimuat.");
  const session = (sessions ?? []).find((row) => row.exercise_id === (exerciseId ?? null));
  if (!session) return { sessionId: null, messages: [] };
  const { data, error } = await admin.from("ai_messages").select("role, content")
    .eq("session_id", session.id).order("created_at", { ascending: true }).limit(20);
  if (error) throw new TutorRequestError(503, "Riwayat AI belum dapat dimuat.");
  return { sessionId: session.id, messages: (data ?? []).map((item) => ({ role: item.role, content: item.content })) };
}

async function loadTutorData(userId: string, request: TutorRequest) {
  const admin = createPrivilegedClient();
  const { data: available, error: availabilityError } = await admin.rpc("phase1_lesson_is_available", {
    p_lesson_id: request.lessonId,
    p_user_id: userId,
  });
  if (availabilityError) throw new TutorRequestError(503, "Lesson belum dapat diverifikasi.");
  if (!available) throw new TutorRequestError(404, "Lesson tidak tersedia.");

  const { data: lesson, error: lessonError } = await admin.from("lessons")
    .select("id, title, summary, content, chapter_id, is_published")
    .eq("id", request.lessonId).maybeSingle();
  if (lessonError) throw new TutorRequestError(503, "Konten lesson belum dapat dimuat.");
  if (!lesson?.is_published) throw new TutorRequestError(404, "Lesson tidak tersedia.");

  let exercise: TutorSnapshot["exercise"] = null;
  if (request.exerciseId) {
    const { data, error } = await admin.from("exercises")
      .select("id, lesson_id, type, title, prompt, is_published")
      .eq("id", request.exerciseId).maybeSingle();
    if (error) throw new TutorRequestError(503, "Practice belum dapat dimuat.");
    if (!data?.is_published || data.lesson_id !== lesson.id) throw new TutorRequestError(404, "Practice tidak tersedia.");
    exercise = { title: data.title, type: data.type, prompt: data.prompt };
  }

  const { data: chapter } = await admin.from("chapters").select("learning_path_id").eq("id", lesson.chapter_id).maybeSingle();
  const chapterResult = chapter?.learning_path_id
    ? await admin.from("chapters").select("id").eq("learning_path_id", chapter.learning_path_id)
    : { data: [] };
  const chapterIds = (chapterResult.data ?? []).map((item) => item.id);
  const lessonResult = chapterIds.length
    ? await admin.from("lessons").select("id").in("chapter_id", chapterIds).eq("is_required", true).eq("is_published", true)
    : { data: [] };
  const lessonIds = (lessonResult.data ?? []).map((item) => item.id);
  const progressResult = lessonIds.length
    ? await admin.from("lesson_progress").select("lesson_id").eq("user_id", userId).eq("status", "COMPLETED").in("lesson_id", lessonIds)
    : { data: [] };

  const sessionQuery = admin.from("ai_sessions").select("id, lesson_id, exercise_id, user_id")
    .eq("user_id", userId).eq("lesson_id", lesson.id);
  const sessionResult = request.sessionId
    ? await sessionQuery.eq("id", request.sessionId).maybeSingle()
    : { data: null, error: null };
  if (sessionResult.error) throw new TutorRequestError(503, "Sesi AI belum dapat dimuat.");
  if (request.sessionId && (!sessionResult.data || sessionResult.data.exercise_id !== (request.exerciseId ?? null))) {
    throw new TutorRequestError(404, "Sesi AI tidak ditemukan.");
  }
  const sessionId = sessionResult.data?.id ?? (await admin.from("ai_sessions").insert({
    user_id: userId, lesson_id: lesson.id, exercise_id: request.exerciseId ?? null,
  }).select("id").single()).data?.id;
  if (!sessionId) throw new TutorRequestError(503, "Sesi AI belum dapat dibuat.");

  const { data: priorMessages, error: historyError } = await admin.from("ai_messages")
    .select("role, content, metadata").eq("session_id", sessionId).order("created_at", { ascending: false }).limit(8);
  if (historyError) throw new TutorRequestError(503, "Riwayat tutor belum dapat dimuat.");
  const history: AIMessage[] = [...(priorMessages ?? [])].reverse().map((item) => ({
    role: item.role === "ASSISTANT" ? "assistant" : "user", content: item.content,
  }));
  const previousLevel = Math.max(0, ...(priorMessages ?? []).map((item) => {
    const metadata = item.metadata;
    return metadata && typeof metadata === "object" && !Array.isArray(metadata)
      && typeof metadata.hintLevel === "number" ? metadata.hintLevel : 0;
  }));

  return {
    admin, sessionId, history, previousLevel,
    snapshot: {
      lesson: { title: lesson.title, summary: lesson.summary, content: lesson.content.slice(0, 8_000) },
      exercise,
      sourceCode: request.sourceCode,
      visibleOutput: request.visibleOutput,
      visibleTestResults: request.visibleTestResults,
      traceSummary: request.traceSummary,
      progressSummary: `${(progressResult.data ?? []).length} of ${lessonIds.length} required lessons complete`,
    } satisfies TutorSnapshot,
  };
}

export async function prepareTutorStream(userId: string, request: TutorRequest, provider: AIProvider = new OpenAICompatibleAIProvider()) {
  const data = await loadTutorData(userId, request);
  const explicitSolution = isExplicitSolutionRequest(request.message, request.action);
  const hintLevel = nextHintLevel(request.action, data.previousLevel, explicitSolution);
  const userContent = request.message.trim() || `[${request.action.replaceAll("_", " ")}]`;
  const tools = createTutorTools(data.snapshot);
  const toolContext = await Promise.all([
    tools.getCurrentLesson(), tools.getCurrentExercise(), tools.getStudentProgress(),
  ]);
  data.snapshot = { ...data.snapshot, lesson: toolContext[0] as TutorSnapshot["lesson"], exercise: toolContext[1] as TutorSnapshot["exercise"], progressSummary: toolContext[2] as string };
  const messages = createTutorMessages(data.snapshot, data.history, userContent, request.action, hintLevel);

  const { error: userSaveError } = await data.admin.from("ai_messages").insert({
    session_id: data.sessionId, role: "USER", content: userContent.slice(0, 1200), metadata: { action: request.action, hintLevel },
  });
  if (userSaveError) throw new TutorRequestError(503, "Pesan belum dapat disimpan.");

  const chunks = provider.stream({ messages, maxOutputTokens: 700 })[Symbol.asyncIterator]();
  let first: IteratorResult<string>;
  try { first = await chunks.next(); }
  catch { throw new TutorRequestError(502, "AI Tutor sedang bermasalah. Coba lagi."); }
  return { ...data, hintLevel, chunks, first };
}

export async function saveTutorReply(admin: ReturnType<typeof createPrivilegedClient>, sessionId: string, reply: string) {
  if (reply) await admin.from("ai_messages").insert({ session_id: sessionId, role: "ASSISTANT", content: reply.slice(0, 8000), metadata: {} });
  await admin.from("ai_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId);
}
