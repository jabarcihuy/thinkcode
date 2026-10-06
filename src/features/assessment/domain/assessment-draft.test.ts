import { describe, expect, it } from "vitest";
import { assessmentDraftSignature, initialAssessmentDraft, readAssessmentDraft } from "./assessment-draft";
import type { PublicAssessmentItem } from "../types";
const items: PublicAssessmentItem[] = [
  { id: "a", title: "Data", topic: "Relasi", prompt: "Pilih", type: "PSEUDOCODE", starterCode: null, publicConfig: { mode: "choice", options: [{ id: "x", text: "X" }, { id: "y", text: "Y" }] }, position: 1 },
  { id: "b", title: "Query", topic: "Read", prompt: "Prediksi", type: "PREDICT_OUTPUT", starterCode: "SELECT name FROM students;", publicConfig: {}, position: 2 },
  { id: "c", title: "Langkah", topic: "Write", prompt: "Urutkan", type: "FLOWCHART", starterCode: null, publicConfig: { blocks: [{ id: "one", text: "1" }, { id: "two", text: "2" }] }, position: 3 },
];
describe("assessment draft validation", () => {
  it("restores partially filled answers and the current question", () => {
    const draft = initialAssessmentDraft(items); draft.activeIndex = 1; draft.answers.a = { choiceId: "y" }; draft.answers.b = { output: "Alya" };
    expect(readAssessmentDraft(draft, items)).toEqual(draft);
  });
  it("allows empty unanswered fields, unlike final submission", () => expect(readAssessmentDraft(initialAssessmentDraft(items), items)).not.toBeNull());
  it("rejects foreign items, scoring fields, missing and mismatched answers", () => {
    const draft = initialAssessmentDraft(items);
    expect(readAssessmentDraft({ ...draft, score: 100 }, items)).toBeNull();
    expect(readAssessmentDraft({ ...draft, answers: { ...draft.answers, foreign: { output: "x" } } }, items)).toBeNull();
    expect(readAssessmentDraft({ ...draft, answers: { ...draft.answers, a: { output: "wrong type" } } }, items)).toBeNull();
    expect(readAssessmentDraft({ ...draft, answers: {} }, items)).toBeNull();
  });
  it("rejects unknown choices, duplicated blocks, large output and invalid indices", () => {
    const draft = initialAssessmentDraft(items);
    for (const [id, answer] of [["a", { choiceId: "foreign" }], ["c", { order: ["one", "one"] }], ["b", { output: "x".repeat(4001) }]] as const) {
      expect(readAssessmentDraft({ ...draft, answers: { ...draft.answers, [id]: answer } }, items)).toBeNull();
    }
    expect(readAssessmentDraft({ ...draft, activeIndex: 3 }, items)).toBeNull();
  });
  it("invalidates a draft when public prompt/options/code changes", () => {
    expect(assessmentDraftSignature(items)).not.toBe(assessmentDraftSignature(items.map((item) => ({ ...item, prompt: "changed" }))));
    expect(assessmentDraftSignature(items)).not.toContain("answer_config");
  });
});
