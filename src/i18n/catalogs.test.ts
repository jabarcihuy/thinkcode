import { describe, it, expect } from "vitest";
import uiEn from "./messages/ui.en.json";
import uiId from "./messages/ui.id.json";
import courseEn from "./messages/course.en.json";
import courseId from "./messages/course.id.json";
import { assessmentDisplayCopy } from "@/features/assessment/domain/display-copy";
import { createTextTranslator } from "./translate";
import { ASSESSMENT_REVISIONS } from "@/features/assessment/server/question-revisions";
describe("shipped bilingual catalogs", () => {
  it("has matching, nonempty English and Indonesian UI/content entries", () => {
    expect(Object.keys(uiEn).sort()).toEqual(Object.keys(uiId).sort());
    expect(Object.keys(courseEn).sort()).toEqual(Object.keys(courseId).sort());
    expect(Object.values(uiEn).every(value => typeof value === "string")).toBe(true);
    expect(uiEn.Masuk).toBe("Sign in"); expect(uiEn["Basis Data dan SQL"]).toBe("Databases and SQL");
    expect(uiId.Masuk).toBe("Masuk");
  });
  it("preserves shipped SQL code and inline identifiers in reading content", () => {
    for (const [source, translated] of Object.entries(courseEn)) {
      const code = (value: string) => value.match(/```[\s\S]*?```|`[^`\n]+`/g) ?? [];
      expect(code(translated), source.slice(0,80)).toEqual(code(source));
    }
  });
  it("keeps legacy test titles in the selected language", () => {
    const en = createTextTranslator("en", uiEn), id = createTextTranslator("id", uiId);
    expect(en(assessmentDisplayCopy("Pre-test Basis Data", "en"))).toBe("Database Pre-test");
    expect(id(assessmentDisplayCopy("Pre-test Basis Data", "id"))).toBe("Tes Awal Basis Data");
    expect(assessmentDisplayCopy("Database Post-test", "en")).toBe("Database Final Challenge");
  });
  it("translates every revised diagnostic title, prompt and choice in both catalogs", () => {
    const catalogs: Record<string, string>[] = [uiEn, uiId, courseEn, courseId];
    for (const item of ASSESSMENT_REVISIONS.filter(item => item.slug === "pre-test-basis-data")) {
      const config = item.publicConfig;
      if (!config || typeof config !== "object" || Array.isArray(config) || !Array.isArray(config.options)) throw new Error("Missing choices");
      const choices = config.options.flatMap(option => option && typeof option === "object" && !Array.isArray(option) && typeof option.text === "string" ? [option.text] : []);
      for (const text of [item.title, item.prompt, ...choices]) {
        for (const catalog of catalogs) expect(catalog[text], text).toBeTypeOf("string");
      }
      expect(uiEn[item.prompt as keyof typeof uiEn]).not.toBe(item.prompt);
    }
  });
});
