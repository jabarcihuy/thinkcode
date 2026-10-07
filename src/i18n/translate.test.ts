import { describe, expect, it } from "vitest";
import { resolveLocale, localeFromRequest } from "./config";
import { createTextTranslator } from "./translate";
describe("language selection and presentation translation", () => {
  it("defaults to English and accepts only the supported locales", () => {
    expect(resolveLocale(undefined)).toBe("en"); expect(resolveLocale("fr")).toBe("en"); expect(resolveLocale("id")).toBe("id");
    expect(localeFromRequest(new Request("https://example.test", { headers: { cookie: "quethink_guest=private; quethink_locale=id" } }))).toBe("id");
  });
  it("translates exact copy and dynamic counters without changing values", () => {
    const tx = createTextTranslator("en", { "Materi ${0} terkunci": "Material ${0} is locked", "Tersimpan": "Saved" });
    expect(tx("Materi 11 terkunci")).toBe("Material 11 is locked"); expect(tx("Tersimpan")).toBe("Saved");
    expect(tx(undefined)).toBeUndefined(); expect(tx(null)).toBeNull();
  });
  it("preserves unknown user-authored names, SQL and records", () => {
    const tx = createTextTranslator("en", {});
    for (const value of ["SELECT name FROM students;", "Alya", "student_id", "My own database"]) expect(tx(value)).toBe(value);
  });
  it("never translates an interpolated user name even if it matches a UI label", () => {
    const tx = createTextTranslator("en", { "Selamat datang, ${0}": "Welcome, ${0}", "Materi": "Materials" });
    expect(tx("Selamat datang, Materi")).toBe("Welcome, Materi");
  });
  it("localizes Markdown paragraphs while preserving SQL and separators", () => {
    const tx = createTextTranslator("en", { "## Ringkasan": "## Summary", "Pelajari tabel.": "Study tables." });
    expect(tx("## Ringkasan\n\nPelajari tabel.\n\n```sql\nSELECT name FROM students;\n```"))
      .toBe("## Summary\n\nStudy tables.\n\n```sql\nSELECT name FROM students;\n```");
  });
});
