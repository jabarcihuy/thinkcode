import "server-only";
import type { AIProvider } from "@/lib/providers/ai-provider";

export class ProviderNotConfiguredError extends Error {
  constructor(provider: string) {
    super(`${provider} is not configured.`);
    this.name = "ProviderNotConfiguredError";
  }
}

export class UnconfiguredAIProvider implements AIProvider {
  async generate(): Promise<never> {
    throw new ProviderNotConfiguredError("AI provider");
  }

  async *stream(): AsyncIterable<string> {
    throw new ProviderNotConfiguredError("AI provider");
  }
}
