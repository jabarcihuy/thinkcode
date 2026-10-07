import { localeFromRequest } from "@/i18n/config";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeAdmin, AdminAuthorizationError } from "@/features/admin/server/authorization";
import { consumeCodeQuota } from "@/features/workspace/server/rate-limit";
import { OpenAICompatibleAIProvider } from "@/lib/providers/openai-compatible-ai-provider";

const requestSchema = z.object({
  task: z.enum(["explanation", "example", "exercise", "summary"]),
  context: z.string().trim().min(1).max(4_000),
  exerciseType: z.enum(["CODE_COMPLETION", "PREDICT_OUTPUT", "DEBUGGING", "PROBLEM_SOLVING", "PSEUDOCODE", "FLOWCHART"]).optional(),
});

export async function POST(request: Request) {
  try {
    await authorizeAdmin();
    if (!(await consumeCodeQuota("ai"))) return NextResponse.json({ error: "Batas pembuatan draft AI tercapai. Coba lagi sebentar." }, { status: 429 });
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Isi permintaan draft dengan benar." }, { status: 422 });
    const labels = { explanation: "database lesson explanation", example: "short SQL query example", exercise: "SQL practice question", summary: "database lesson summary" };
    const result = await new OpenAICompatibleAIProvider().generate({
      maxOutputTokens: 700,
      messages: [
        { role: "system", content: `Respond exclusively in ${localeFromRequest(request) === "en" ? "English" : "Bahasa Indonesia"}. You help an administrator draft concise learning content about relational databases and beginner SQL. Use only the SQLite syntax supported by the supplied context. Return suggestions as plain text, never claim that content is published or save anything. Keep private answers in the draft and remind the administrator to verify all queries and results before saving or publishing.` },
        { role: "user", content: `Draft a ${labels[parsed.data.task]}${parsed.data.exerciseType ? ` for ${parsed.data.exerciseType}` : ""}. Context: ${parsed.data.context}` },
      ],
    });
    return NextResponse.json({ draft: result.content.slice(0, 8_000), status: "DRAFT_REQUIRES_ADMIN_REVIEW" });
  } catch (error) {
    if (error instanceof AdminAuthorizationError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Asisten draft sedang tidak tersedia. Tinjau dan simpan konten secara manual." }, { status: 502 });
  }
}
