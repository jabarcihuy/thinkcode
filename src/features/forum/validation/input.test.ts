import { describe, it, expect } from "vitest";
import { topicInput, replyInput, moderationInput, forumPage } from "./input";
const id = "00000000-0000-4000-8000-000000000001";
describe("forum input boundaries", () => {
  it("accepts database questions and general discussion", () => {
    for (const category of ["DATABASE", "GENERAL"]) expect(topicInput.safeParse({ title: "Why this query?", body: "SELECT title FROM books;", category }).success).toBe(true);
  });
  it("rejects missing, oversized and forged identity or moderation fields", () => {
    const valid = { title: "Why this query?", body: "SELECT title FROM books;", category: "DATABASE" };
    for (const bad of [{ ...valid, author_id: id }, { ...valid, is_hidden: false }, { ...valid, title: "short" }, { ...valid, body: "x".repeat(6001) }, { ...valid, category: "OTHER" }]) expect(topicInput.safeParse(bad).success).toBe(false);
    expect(replyInput.safeParse({ body: "Thanks", author_id: id }).success).toBe(false);
    expect(replyInput.safeParse({ body: "x".repeat(4001) }).success).toBe(false);
  });
  it("validates moderation targets and bounds pagination", () => {
    expect(moderationInput.safeParse({ targetId: id, action: "lock_topic", value: true }).success).toBe(true);
    expect(moderationInput.safeParse({ targetId: id, action: "promote_admin", value: true }).success).toBe(false);
    for (const page of [undefined, "-1", "1.5", "NaN", "10001"]) expect(forumPage(page)).toBe(1);
    expect(forumPage("2")).toBe(2);
  });
});
