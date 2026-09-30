import { describe, expect, it } from "vitest";
import { applyDatasetMutation, datasetConnections, initialDatasetSnapshot, relatedRecords } from "./dataset-exploration";
import { CAMPUS_DATASET } from "../data/datasets";

describe("synthetic schema and record inspector", () => {
  it("connects each enrollment to actual parent keys", () => {
    expect(datasetConnections(CAMPUS_DATASET, initialDatasetSnapshot(CAMPUS_DATASET))).toHaveLength(12);
  });
  it("follows one student through the bridge without spreading to other students", () => {
    const related = relatedRecords(CAMPUS_DATASET, initialDatasetSnapshot(CAMPUS_DATASET), { table: "students", id: 1 });
    expect([...related].sort()).toEqual(["courses:10", "courses:20", "enrollments:1", "enrollments:2", "students:1"]);
  });
  it("follows one enrollment to both parents", () => {
    expect([...relatedRecords(CAMPUS_DATASET, initialDatasetSnapshot(CAMPUS_DATASET), { table: "enrollments", id: 2 })].sort()).toEqual(["courses:20", "enrollments:2", "students:1"]);
  });
  it("shows a course's actual group members", () => {
    const related = relatedRecords(CAMPUS_DATASET, initialDatasetSnapshot(CAMPUS_DATASET), { table: "courses", id: 10 });
    expect([...related].filter((key) => key.startsWith("enrollments:")).sort()).toEqual(["enrollments:1", "enrollments:3", "enrollments:6"]);
  });
  it("updates records after a mutation, drops deleted links, and resets independently", () => {
    const original = initialDatasetSnapshot(CAMPUS_DATASET);
    const updated = applyDatasetMutation(CAMPUS_DATASET, original, "enrollments", original.enrollments!.filter((row) => row.enrollment_id !== 6));
    expect(updated.enrollments).toHaveLength(5);
    expect(datasetConnections(CAMPUS_DATASET, updated)).toHaveLength(10);
    expect(relatedRecords(CAMPUS_DATASET, updated, { table: "enrollments", id: 6 }).size).toBe(0);
    expect(initialDatasetSnapshot(CAMPUS_DATASET).enrollments).toHaveLength(6);
    expect(original.enrollments).toHaveLength(6);
  });
  it("does not invent missing parent records or accept unrelated tables", () => {
    const seed = initialDatasetSnapshot(CAMPUS_DATASET);
    const noStudents = applyDatasetMutation(CAMPUS_DATASET, seed, "students", []);
    expect(datasetConnections(CAMPUS_DATASET, noStudents).every((edge) => edge.to.table === "courses")).toBe(true);
    expect(applyDatasetMutation(CAMPUS_DATASET, seed, "profiles", [])).toBe(seed);
  });
});
