import { expect, it } from "vitest";
import { readQueryDraft } from "./query-draft";
it("recovers only bounded query text and prediction, never database state or grading", () => {
  expect(readQueryDraft({ queryText: "SELECT name FROM students;", prediction: "4" })).not.toBeNull();
  expect(readQueryDraft({ queryText: "x".repeat(4097), prediction: "" })).toBeNull();
  expect(readQueryDraft({ queryText: "SELECT * FROM students;", prediction: "4", score: 100 })).toBeNull();
});
