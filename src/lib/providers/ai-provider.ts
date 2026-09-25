export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIGenerateInput {
  messages: AIMessage[];
  maxOutputTokens?: number;
}

export interface AIGenerateResult {
  content: string;
}

export interface AIProvider {
  generate(input: AIGenerateInput): Promise<AIGenerateResult>;
  stream(input: AIGenerateInput): AsyncIterable<string>;
}
