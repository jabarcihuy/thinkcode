export interface CourseGradeComponent {
  courseWeightPercent: number;
  highestScore: number | null;
}

export function calculateCourseGradePoints(components: CourseGradeComponent[]) {
  const possiblePoints = components.reduce((sum, component) => sum + component.courseWeightPercent, 0);
  const earnedPoints = components.reduce(
    (sum, component) => sum + component.courseWeightPercent * (component.highestScore ?? 0) / 100,
    0,
  );
  return { earnedPoints: Number(earnedPoints.toFixed(2)), possiblePoints: Number(possiblePoints.toFixed(2)) };
}
