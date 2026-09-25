import "server-only";
import { getAIEnv } from "@/lib/env";
import type { AIProvider, AIGenerateInput } from "@/lib/providers/ai-provider";

type ChatCompletionChunk = { choices?: Array<{ delta?: { content?: string | null } }> };

export class OpenAICompatibleAIProvider implements AIProvider {
  async generate(input: AIGenerateInput) {
    let content = "";
    for await (const chunk of this.stream(input)) content += chunk;
    return { content };
  }

  async *stream(input: AIGenerateInput): AsyncIterable<string> {
    const env = getAIEnv();
    const response = await fetch(env.AI_API_URL, {
      method: "POST",
      headers: { authorization: `Bearer ${env.AI_API_KEY}`, "content-type": "application/json", accept: "text/event-stream" },
      body: JSON.stringify({ model: env.AI_MODEL, messages: input.messages, stream: true, max_tokens: input.maxOutputTokens ?? 800, temperature: 0.35 }),
      signal: AbortSignal.timeout(60_000),
      cache: "no-store",
    });
    if (!response.ok || !response.body) throw new Error("AI provider request failed.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          let chunk: ChatCompletionChunk;
          try { chunk = JSON.parse(data) as ChatCompletionChunk; }
          catch { throw new Error("AI provider returned an invalid stream."); }
          const content = chunk.choices?.[0]?.delta?.content;
          if (typeof content === "string" && content) yield content;
        }
        if (done) break;
      }
    } finally {
      await reader.cancel().catch(() => undefined);
    }
  }
}
