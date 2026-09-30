import { describe, expect, it } from "vitest";
import { STARTER_SQL } from "@/features/database/data/campus-mini";
import {
  clampTraceStep,
  QUERY_TRACE_STEPS,
  SqlQueryValidationError,
  validateSqlStatement,
} from "@/features/database/domain/sql-query";

describe("SQL statement validation", () => {
  it("accepts a SELECT query and optional final semicolon", () => {
    expect(validateSqlStatement(STARTER_SQL)).toEqual({ kind: "select" });
    expect(validateSqlStatement("SELECT name FROM students; ")).toEqual({ kind: "select" });
  });

  it("accepts joins and grouping used in Read lessons", () => {
    const query = "SELECT c.course_name, COUNT(e.enrollment_id) FROM courses c JOIN enrollments e ON e.course_id = c.course_id GROUP BY c.course_id";
    expect(validateSqlStatement(query)).toEqual({ kind: "select" });
  });

  it.each([
    ["one explicit insert row", "INSERT INTO students (student_id, name, cohort) VALUES (5, 'Eka', '2025');", { kind: "mutation", action: "INSERT", table: "students" }],
    ["one row update by primary key", "UPDATE enrollments SET score = 78 WHERE enrollment_id = 3", { kind: "mutation", action: "UPDATE", table: "enrollments" }],
    ["one row delete by primary key", "DELETE FROM enrollments WHERE enrollment_id = 6;", { kind: "mutation", action: "DELETE", table: "enrollments" }],
  ])("accepts %s", (_label, query, expected) => {
    expect(validateSqlStatement(query as string)).toEqual(expected);
  });

  it.each([
    "DROP TABLE students",
    "PRAGMA query_only = OFF",
    "ATTACH DATABASE 'x' AS other",
    "BEGIN",
    "DELETE FROM students",
    "UPDATE students SET cohort = '2026'",
    "UPDATE students SET cohort = '2026' WHERE name = 'Alya'",
    "UPDATE students SET student_id = 9 WHERE student_id = 1",
    "UPDATE students SET cohort = '2026' WHERE student_id = 1 OR student_id = 2",
    "DELETE FROM students WHERE student_id IN (1, 2)",
    "INSERT INTO students (student_id, name, cohort) VALUES (5, 'Eka', '2025'), (6, 'Fia', '2025')",
    "INSERT OR REPLACE INTO students (student_id, name, cohort) VALUES (5, 'Eka', '2025')",
    "INSERT INTO students (student_id, name) SELECT student_id, name FROM students",
    `${STARTER_SQL}\nDELETE FROM students;`,
    `${STARTER_SQL} -- comment`,
    "SELECT name FROM students; SELECT cohort FROM students;",
  ])("rejects unsupported or unbounded SQL: %s", (query) => {
    expect(() => validateSqlStatement(query)).toThrow(SqlQueryValidationError);
  });

  it("rejects source that exceeds the query length limit", () => {
    expect(() => validateSqlStatement(`SELECT '${"x".repeat(4_100)}'`)).toThrow(SqlQueryValidationError);
  });
});

describe("query diagram steps", () => {
  it("keeps diagram navigation inside its four steps", () => {
    expect(QUERY_TRACE_STEPS).toHaveLength(4);
    expect(clampTraceStep(-1)).toBe(0);
    expect(clampTraceStep(99)).toBe(3);
  });
});
