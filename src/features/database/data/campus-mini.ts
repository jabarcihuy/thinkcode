export type CampusStudent = {
  student_id: number;
  name: string;
  cohort: string;
};

export type CampusCourse = {
  course_id: number;
  course_code: string;
  course_name: string;
  credits: number;
};

export type CampusEnrollment = {
  enrollment_id: number;
  student_id: number;
  course_id: number;
  score: number;
};

export const CAMPUS_STUDENTS: CampusStudent[] = [
  { student_id: 1, name: "Alya", cohort: "2025" },
  { student_id: 2, name: "Bima", cohort: "2025" },
  { student_id: 3, name: "Citra", cohort: "2024" },
  { student_id: 4, name: "Danu", cohort: "2024" },
];

export const CAMPUS_COURSES: CampusCourse[] = [
  { course_id: 10, course_code: "SI101", course_name: "Sistem Informasi", credits: 3 },
  { course_id: 20, course_code: "IF102", course_name: "Basis Data", credits: 3 },
  { course_id: 30, course_code: "IF103", course_name: "Matematika Diskrit", credits: 3 },
];

export const CAMPUS_ENROLLMENTS: CampusEnrollment[] = [
  { enrollment_id: 1, student_id: 1, course_id: 10, score: 88 },
  { enrollment_id: 2, student_id: 1, course_id: 20, score: 90 },
  { enrollment_id: 3, student_id: 2, course_id: 10, score: 74 },
  { enrollment_id: 4, student_id: 2, course_id: 30, score: 82 },
  { enrollment_id: 5, student_id: 3, course_id: 20, score: 80 },
  { enrollment_id: 6, student_id: 4, course_id: 10, score: 95 },
];

export const STARTER_SQL =
  "SELECT name, cohort\nFROM students\nWHERE cohort = '2025'\nORDER BY name;";
