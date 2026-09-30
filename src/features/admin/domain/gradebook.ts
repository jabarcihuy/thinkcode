import { calculateCourseGradePoints } from "@/features/assessment/domain/course-grade";

export interface GradebookAssessment { id: string; slug: string; title: string; course_weight_percent: number }
export interface GradebookResult { user_id: string; assessment_id: string; highest_score: number; passed: boolean }

export function gradebookForUser(userId: string, assessments: GradebookAssessment[], results: GradebookResult[]) {
  const own = new Map(results.filter((result) => result.user_id === userId).map((result) => [result.assessment_id, result]));
  const scores = Object.fromEntries(assessments.map((assessment) => [assessment.slug, own.get(assessment.id)?.highest_score ?? null]));
  const grade = calculateCourseGradePoints(assessments.map((assessment) => ({
    courseWeightPercent: assessment.course_weight_percent,
    highestScore: own.get(assessment.id)?.highest_score ?? null,
  })));
  return { scores, grade_points: grade.earnedPoints, grade_possible: grade.possiblePoints, assessments_passed: assessments.filter((assessment) => own.get(assessment.id)?.passed).length };
}

export function csvCell(value: unknown) {
  const text = String(value ?? "");
  const escaped = /^[=+@\-]/.test(text) ? `'${text}` : text;
  return `"${escaped.replaceAll('"', '""')}"`;
}
