import { describe, expect, it } from "vitest";
import { csvCell, gradebookForUser } from "./gradebook";

describe("gradebook", () => {
  it("uses trusted highest scores and course weights", () => {
    const assessments = [{ id: "a", slug: "first", title: "First", course_weight_percent: 10 }, { id: "b", slug: "second", title: "Second", course_weight_percent: 20 }];
    const results = [{ user_id: "u", assessment_id: "a", highest_score: 80, passed: true }];
    expect(gradebookForUser("u", assessments, results)).toEqual({ scores: { first: 80, second: null }, grade_points: 8, grade_possible: 30, assessments_passed: 1 });
    expect(gradebookForUser("other", assessments, results).grade_points).toBe(0);
  });
  it("escapes spreadsheet formula injection and quotes", () => {
    expect(csvCell('=HYPERLINK("bad")')).toBe('"\'=HYPERLINK(""bad"")"');
  });
});
