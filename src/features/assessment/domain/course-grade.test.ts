import { describe, expect, it } from "vitest";
import { calculateCourseGradePoints } from "./course-grade";

describe("official course grade points", () => {
  it("supports a course assessment total of 100 points", () => {
    expect(calculateCourseGradePoints([
      { courseWeightPercent: 15, highestScore: null },
      { courseWeightPercent: 20, highestScore: null },
      { courseWeightPercent: 25, highestScore: null },
      { courseWeightPercent: 40, highestScore: null },
    ])).toEqual({ earnedPoints: 0, possiblePoints: 100 });
  });

  it("uses the highest recorded component score and the RPS weight", () => {
    expect(calculateCourseGradePoints([
      { courseWeightPercent: 10, highestScore: 80 },
      { courseWeightPercent: 8, highestScore: 50 },
      { courseWeightPercent: 20, highestScore: null },
    ])).toEqual({ earnedPoints: 12, possiblePoints: 38 });
  });
});
