import { afterEach, describe, expect, it, vi } from "vitest";
import { OpenAICompatibleAIProvider } from "@/lib/providers/openai-compatible-ai-provider";

const originalEnv = {
  url: process.env.AI_API_URL,
  key: process.env.AI_API_KEY,
  model: process.env.AI_MODEL,
};

afterEach(() => {
  vi.unstubAllGlobals();
  for (const [name, value] of Object.entries({ AI_API_URL: originalEnv.url, AI_API_KEY: originalEnv.key, AI_MODEL: originalEnv.model })) {
    if (value === undefined) delete process.env[name]; else process.env[name] = value;
  }
});

describe("OpenAI-compatible AI provider adapter", () => {
  it("streams response content without exposing provider metadata", async () => {
    process.env.AI_API_URL = "https://ai.example/v1/chat/completions";
    process.env.AI_API_KEY = "test-secret";
    process.env.AI_MODEL = "test-model";
    vi.stubGlobal("fetch", vi.fn(async () => new Response([
      'data: {"choices":[{"delta":{"content":"A "}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"hint."}}]}\n\n',
      "data: [DONE]\n\n",
    ].join(""), { headers: { "content-type": "text/event-stream" } })));
    const chunks: string[] = [];
    for await (const part of new OpenAICompatibleAIProvider().stream({ messages: [{ role: "user", content: "Help" }] })) chunks.push(part);
    expect(chunks.join("")).toBe("A hint.");
  });

  it("returns a provider failure without leaking response bodies", async () => {
    process.env.AI_API_URL = "https://ai.example/v1/chat/completions";
    process.env.AI_API_KEY = "test-secret";
    process.env.AI_MODEL = "test-model";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("sensitive provider diagnostic", { status: 500 })));
    const provider = new OpenAICompatibleAIProvider();
    await expect(async () => {
      const chunks: string[] = [];
      for await (const chunk of provider.stream({ messages: [] })) chunks.push(chunk);
    }).rejects.toThrow("AI provider request failed.");
  });
});
