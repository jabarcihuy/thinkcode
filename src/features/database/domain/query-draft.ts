import { z } from "zod";
const queryDraftSchema = z.object({ queryText: z.string().max(4096), prediction: z.string().max(8) }).strict();
export function readQueryDraft(value: unknown) {
  const parsed = queryDraftSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
