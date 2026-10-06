import { sqlAssessmentPrivateSchema } from "../server/sql-assessment-key";
import { describe, expect, it, vi } from "vitest";
import { SQL_POST_TEST_ITEMS } from "../server/sql-post-test-seed";
import { SqliteAssessmentAdapter } from "../providers/sqlite-assessment-adapter";
import { readSqlAssessmentConfig } from "../validation/sql-assessment";
import { gradeAssessment } from "./grade-assessment";
import { publicAssessmentConfig } from "./public-item";
import { initialAssessmentDraft, readAssessmentDraft } from "./assessment-draft";
import { assessmentItemInput } from "@/features/admin/domain/content-validation";
const adapter = new SqliteAssessmentAdapter();
describe("SQL post-test blueprint", () => {
  it.each(SQL_POST_TEST_ITEMS)("grades reference and hidden variants: $title", async (item) => {
    const config = readSqlAssessmentConfig(item.publicConfig)!;
    const key = sqlAssessmentPrivateSchema.parse(item.answerConfig);
    expect((await adapter.grade(key.referenceQuery,config,key)).passedTests).toBe(key.fixtures.length);
  });
  it("uses SQL grading instead of the legacy JavaScript runner", async () => {
    const js = {run:vi.fn()};
    const items = SQL_POST_TEST_ITEMS;
    const answers = items.map((item)=>({itemId:item.id,answer:{sourceCode:sqlAssessmentPrivateSchema.parse(item.answerConfig).referenceQuery}}));
    const grade = await gradeAssessment(items,{answers},js,75,adapter);
    expect(grade).toMatchObject({score:100,passed:true,totalCorrect:6,hiddenTotal:6});
    expect(js.run).not.toHaveBeenCalled();
    expect(JSON.stringify(grade)).not.toMatch(/referenceQuery|fixtures|Buku Pindah|Data Terapan/);
  });
  it("awards weighted partial SQL credit without accepting output claims", async () => {
    const sql = { grade:vi.fn(async (query: string)=> { void query; return {passedTests:1,totalTests:2,hiddenPassed:0,hiddenTotal:1,visibleTests:[{position:1,passed:true}]}; }) };
    const grade = await gradeAssessment([SQL_POST_TEST_ITEMS[0]],{answers:[{itemId:SQL_POST_TEST_ITEMS[0].id,answer:{output:"forged"}}]},{run:vi.fn()},75,sql);
    expect(sql.grade.mock.calls[0][0]).toBe(""); expect(grade.score).toBe(50); expect(grade.passed).toBe(false);
  });
  it("allowlists public configuration and strips hidden fields recursively", () => {
    expect(publicAssessmentConfig({mode:"choice",options:[{id:"a",text:"A",hidden:"PRIVATE"}],referenceQuery:"PRIVATE"})).toEqual({mode:"choice",options:[{id:"a",text:"A"}]});
    for(const item of SQL_POST_TEST_ITEMS) {
      expect(publicAssessmentConfig(item.publicConfig)).toEqual(item.publicConfig);
      expect(JSON.stringify(publicAssessmentConfig({...item.publicConfig as object, fixtures:"PRIVATE"}))).not.toContain("PRIVATE");
    }
  });
  it("recovers SQL drafts and rejects oversized SQL / wrong answer types", () => {
    const items=SQL_POST_TEST_ITEMS;
    const draft=initialAssessmentDraft(items); draft.answers[items[0].id]={sourceCode:"SELECT name FROM products"};
    expect(readAssessmentDraft(draft,items)).toEqual(draft);
    draft.answers[items[0].id]={output:"forged"}; expect(readAssessmentDraft(draft,items)).toBeNull();
    draft.answers[items[0].id]={sourceCode:"x".repeat(4097)}; expect(readAssessmentDraft(draft,items)).toBeNull();
  });
  it("validates SQL admin items and rejects private values in public config", ()=> {
    const seed=SQL_POST_TEST_ITEMS[0];
    const item={assessment_id:"11111111-1111-4111-8111-111111111111",type:seed.type,title:seed.title,topic:seed.topic,prompt:seed.prompt,starter_code:"",public_config:seed.publicConfig,answer_config:seed.answerConfig,weight:5,position:11};
    expect(assessmentItemInput.safeParse(item).success).toBe(true);
    expect(assessmentItemInput.safeParse({...item,public_config:{...seed.publicConfig as object,referenceQuery:"PRIVATE"}}).success).toBe(false);
    expect(assessmentItemInput.safeParse({...item,answer_config:{}}).success).toBe(false);
  });
});
