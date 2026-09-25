import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeAdmin, AdminAuthorizationError } from "@/features/admin/server/authorization";
import { consumeCodeQuota } from "@/features/workspace/server/rate-limit";
import { OpenAICompatibleAIProvider } from "@/lib/providers/openai-compatible-ai-provider";

const requestSchema = z.object({
  task: z.enum(["explanation", "example", "exercise", "visible_tests", "hidden_tests", "summary"]),
  context: z.string().trim().min(1).max(4_000),
  exerciseType: z.enum(["CODE_COMPLETION", "PREDICT_OUTPUT", "DEBUGGING", "PROBLEM_SOLVING", "PSEUDOCODE", "FLOWCHART"]).optional(),
});

export async function POST(request: Request) {
  try {
    await authorizeAdmin();
    if (!(await consumeCodeQuota("ai"))) return NextResponse.json({ error: "AI drafting limit reached. Try again shortly." }, { status: 429 });
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Provide a valid draft request." }, { status: 422 });
    const labels = { explanation: "lesson explanation", example: "short JavaScript logic example", exercise: "exercise draft", visible_tests: "visible test cases", hidden_tests: "hidden test cases", summary: "lesson summary" };
    const result = await new OpenAICompatibleAIProvider().generate({
      maxOutputTokens: 700,
      messages: [
        { role: "system", content: "You help an administrator draft concise beginner programming-logic learning content. Use JavaScript only for code. Return suggestions as plain text, never claim that content is published or save anything. For hidden tests, include test cases only in this admin response and remind the reviewer to verify them." },
        { role: "user", content: `Draft a ${labels[parsed.data.task]}${parsed.data.exerciseType ? ` for ${parsed.data.exerciseType}` : ""}. Context: ${parsed.data.context}` },
      ],
    });
    return NextResponse.json({ draft: result.content.slice(0, 8_000), status: "DRAFT_REQUIRES_ADMIN_REVIEW" });
  } catch (error) {
    if (error instanceof AdminAuthorizationError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Draft assistant is unavailable. Review and save content yourself." }, { status: 502 });
  }
}
