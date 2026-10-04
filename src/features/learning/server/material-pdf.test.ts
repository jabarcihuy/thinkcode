import { readFile, mkdir, writeFile } from "node:fs/promises";
import { z } from "zod";
import { describe, expect, it, vi } from "vitest";
import { PDFDocument, PDFPage, StandardFonts } from "pdf-lib";
import { createMaterialPdf } from "./material-pdf";
import { MaterialPdfLayout } from "./pdf-layout";

describe("material PDF", () => {
  it("generates an A4 Unicode reading PDF with SQL and static tables", async () => {
    const bytes = await createMaterialPdf({ number: 2, title: "Key dan relasi", summary: "PK → FK", content: "## Identitas\n\nNilai 74 → 78.\n\n```sql\nSELECT name FROM students;\n```\n\n| id | name |\n| --- | --- |\n| 1 | Alya |" });
    const doc = await PDFDocument.load(bytes);
    expect(doc.getTitle()).toBe("Materi 2 — Key dan relasi");
    expect(doc.getPageCount()).toBe(1);
    expect(doc.getPage(0).getWidth()).toBeCloseTo(595.28);
    expect(doc.catalog.has(doc.context.obj("OpenAction"))).toBe(false);
  });
  it("preserves SQL line breaks instead of replacing them with unsupported glyphs", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Courier);
    const drawing = vi.spyOn(PDFPage.prototype, "drawText");
    try {
      const layout = new MaterialPdfLayout(doc, { body: font, bold: font, mono: font }, "Quethink");
      layout.paragraph("SELECT name\nFROM students;", "mono");
      expect(drawing.mock.calls.map(([text]) => text)).toContain("SELECT name");
      expect(drawing.mock.calls.map(([text]) => text)).toContain("FROM students;");
      expect(drawing.mock.calls.map(([text]) => text).join(" ")).not.toContain("?");
    } finally { drawing.mockRestore(); }
  });
  it("paginates long prose and repeats tables safely", async () => {
    const content = "Penjelasan relasi dan record. ".repeat(300) + "\n\n| id | nilai |\n| --- | --- |\n" + Array.from({ length: 55 }, (_, i) => `| ${i} | ${i * 2} |`).join("\n");
    const doc = await PDFDocument.load(await createMaterialPdf({ number: 1, title: "Tabel", summary: "", content }));
    expect(doc.getPageCount()).toBeGreaterThan(2);
    expect(doc.getPageCount()).toBeLessThan(12);
  });
  it("renders all eleven seeded materials within bounded page counts", async () => {
    const materials = z.array(z.object({ title: z.string(), summary: z.string(), content: z.string() })).parse(JSON.parse(await readFile("scripts/data/reading-materials.json", "utf8")));
    expect(materials).toHaveLength(11);
    for (const [index, material] of materials.entries()) {
      const bytes = await createMaterialPdf({ number: index + 1, ...material });
      const doc = await PDFDocument.load(bytes);
      expect(doc.getTitle()).toBe(`Materi ${index + 1} — ${material.title}`);
      expect(doc.getPageCount()).toBeLessThan(6);
      if (process.env.MATERIAL_PDF_SAMPLE_DIR) {
        await mkdir(process.env.MATERIAL_PDF_SAMPLE_DIR, { recursive: true });
        await writeFile(`${process.env.MATERIAL_PDF_SAMPLE_DIR}/materi-${index + 1}.pdf`, bytes);
      }
    }
  }, 15000);

});
