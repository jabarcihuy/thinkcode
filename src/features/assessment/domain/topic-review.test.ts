import { expect, it } from "vitest";
import { topicReviewHref } from "./topic-review";
it("reviews completed topics after post-test without sending a baseline learner to a locked material", () => {
  expect(topicReviewHref("Write", false)).toContain("/menambahkan-record-dengan-insert");
  expect(topicReviewHref("Read", false)).toContain("/memilih-sumber-dan-kolom");
  expect(topicReviewHref("Read", true)).toBe("/learn/database-fundamentals");
  expect(topicReviewHref("Unrecognized", false)).toBe("/learn/database-fundamentals");
});
