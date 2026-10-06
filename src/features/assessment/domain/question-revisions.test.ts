import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ASSESSMENT_REVISIONS } from "../server/question-revisions";
import { PRACTICE_REVISIONS } from "@/features/practice/server/question-revisions";
import { publicAssessmentConfig } from "./public-item";
import { questionDataSchema, readQuestionData } from "@/features/database/validation/question-data";
import { sqlAssessmentPublicSchema } from "../validation/sql-assessment";
import { getDataset } from "@/features/database/data/datasets";
import { datasetSchemaSql, datasetSeedOrder } from "@/features/database/browser/sqlite-seed";
import { compareTableOutput } from "@/features/practice/domain/compare-table-output";

function withDatabase<T>(id: "campus" | "library" | "shop", action: (db: DatabaseSync) => T): T {
  const dataset = getDataset(id), db = new DatabaseSync(":memory:");
  try {
    db.exec("PRAGMA foreign_keys=ON;"); db.exec(datasetSchemaSql(dataset));
    for (const table of datasetSeedOrder(dataset)) {
      const columns = table.columns.map((column) => column.name);
      const statement = db.prepare(`INSERT INTO ${table.name} (${columns.join(",")}) VALUES (${columns.map(() => "?").join(",")})`);
      for (const row of table.rows) statement.run(...columns.map((column) => row[column]!));
    }
    return action(db);
  } finally { db.close(); }
}
type Prediction = { slug?: string; type: string; starter_code: string; config: {public: {datasetId?: "library" | "shop"};answer:{output:string}; grading?:{columnTypes:string[]}} };
const anchor = readFileSync("supabase/migrations/20260930114229_interactive_campus_curriculum.sql", "utf8").match(/\$curriculum\$([\s\S]*?)\$curriculum\$/)![1];
const transfer = readFileSync("supabase/migrations/20260930141504_varied_practice_datasets.sql", "utf8").match(/\$datasets\$([\s\S]*?)\$datasets\$/)![1];
const predictions: Prediction[] = [...JSON.parse(anchor).flatMap((lesson: {exercises:Prediction[]}) => lesson.exercises), ...JSON.parse(transfer)].filter((exercise:Prediction) => exercise.type === "PREDICT_OUTPUT");

describe("complete contextual question bank", () => {
  it("preserves the diagnostic and weighted post-test blueprints", () => {
    expect(ASSESSMENT_REVISIONS.filter((q) => q.slug === "pre-test-basis-data")).toHaveLength(10);
    expect(ASSESSMENT_REVISIONS.filter((q) => q.slug === "post-test-basis-data-sql-v2")).toHaveLength(16);
    expect(PRACTICE_REVISIONS).toHaveLength(45);
    for (const item of ASSESSMENT_REVISIONS) expect(publicAssessmentConfig(item.publicConfig)).toEqual(item.publicConfig);
  });
  it("validates all public stimuli without private or unknown data", () => {
    for (const item of [...ASSESSMENT_REVISIONS, ...PRACTICE_REVISIONS]) {
      const config = item.publicConfig;
      if (!config || typeof config !== "object" || Array.isArray(config)) throw new Error("Missing public configuration");
      if (config.mode !== "schema") expect(readQuestionData(config.data)).not.toBeNull();
      expect(JSON.stringify(config)).not.toMatch(/referenceQuery|fixtures|answer|feedback|expected_output/);
    }
    for (const data of [
      {datasetId:"production",tables:["profiles"]}, {datasetId:"campus",tables:["books"]},
      {datasetId:"library",tables:["books","books"]}, {datasetId:"library",tables:["books"],rows:[{secret:"PRIVATE"}]},
    ]) expect(questionDataSchema.safeParse(data).success).toBe(false);
    expect(publicAssessmentConfig({mode:"choice",options:[{id:"a",text:"A"}],data:{datasetId:"library",tables:["books"],fixtures:"PRIVATE"}})).toEqual({mode:"choice",options:[{id:"a",text:"A"}]});
    expect(sqlAssessmentPublicSchema.safeParse({mode:"sql",datasetId:"campus",operation:"SELECT",data:{datasetId:"shop",tables:["products"]}}).success).toBe(false);
  });
  it("does not force sorting before sorting is taught", () => {
    const core = PRACTICE_REVISIONS.find((q) => q.slug === "memilih-sumber-dan-kolom" && q.position === 3)!;
    expect(core.answer).toEqual({order:["columns","source"]});
    expect(JSON.stringify(core.publicConfig)).not.toContain("ORDER BY");
  });
  it("uses actual dataset counts and boundaries in concept questions", () => {
    withDatabase("library", db => {
      expect(db.prepare("SELECT COUNT(*) AS count FROM books").get()).toMatchObject({count:4});
      expect(db.prepare("SELECT title FROM books WHERE stock > 2 ORDER BY book_id").all()).toEqual([{title:"Dasar Basis Data"},{title:"Algoritma Ringkas"}]);
    });
    withDatabase("shop", db => {
      expect(db.prepare("SELECT COUNT(*) AS count FROM orders").get()).toMatchObject({count:3});
      expect(db.prepare("SELECT name FROM products WHERE price >= 5000 ORDER BY product_id").all()).toHaveLength(3);
      expect(() => db.exec("INSERT INTO orders VALUES(400,999,'pending')")).toThrow();
      db.exec("UPDATE order_items SET quantity=4 WHERE item_id=2");
      expect(db.prepare("SELECT item_id FROM order_items WHERE quantity=4").all()).toEqual([{item_id:2}]);
    });
    withDatabase("campus", db => {
      db.exec("DELETE FROM enrollments WHERE enrollment_id=6");
      expect(db.prepare("SELECT COUNT(*) AS count FROM students").get()).toMatchObject({count:4});
      expect(db.prepare("SELECT COUNT(*) AS count FROM courses").get()).toMatchObject({count:3});
    });
  });
  it.each(predictions)("matches every prediction answer to actual SQL: $starter_code", (exercise) => {
    withDatabase(exercise.config.public.datasetId ?? "campus", db => {
      const result=db.prepare(exercise.starter_code).all().map(row => Object.values(row).join(" | ")).join("\n");
      const columns=exercise.config.grading?.columnTypes ?? result.split("\n")[0]!.split("|").map(cell=>Number.isFinite(Number(cell)) ? "number" : "text");
      expect(compareTableOutput(result,exercise.config.answer.output,columns)).toBe(true);
    });
  });
  it("requires completion of active tests before content changes", () => {
    const migration=readFileSync("supabase/migrations/20261006050438_contextual_question_bank.sql","utf8");
    expect(migration).toContain("LOCK TABLE public.assessment_sessions IN SHARE ROW EXCLUSIVE MODE");
    expect(migration).toContain("s.status='IN_PROGRESS'");
    expect(migration).not.toMatch(/DELETE FROM public\.(assessment|exercise|lesson_progress)/i);
    const diagnostic=readFileSync("supabase/migrations/20261006050500_contextual_diagnostic_questions.sql","utf8");
    expect(diagnostic).toContain("a.slug='pre-test-basis-data' AND s.status='IN_PROGRESS'");
    expect(diagnostic).not.toMatch(/DELETE FROM public\.(assessment|exercise|lesson_progress)/i);
  });
});
