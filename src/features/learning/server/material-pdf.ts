import "server-only";
import type { Locale } from "@/i18n/config";
import { createTextTranslator } from "@/i18n/translate";
import uiEn from "@/i18n/messages/ui.en.json";
import uiId from "@/i18n/messages/ui.id.json";
import courseEn from "@/i18n/messages/course.en.json";
import courseId from "@/i18n/messages/course.id.json";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { parseMaterialDocument } from "../domain/material-document";
import { MaterialPdfLayout } from "./pdf-layout";

const fontFiles = Promise.all(["geist-sans/Geist-Regular.ttf", "geist-sans/Geist-Bold.ttf", "geist-mono/GeistMono-Regular.ttf"].map((name) => readFile(join(process.cwd(), "node_modules/geist/dist/fonts", name))));

export async function createMaterialPdf(input: { number: number; title: string; summary: string; content: string }, locale: Locale = "id"): Promise<Uint8Array> {
  const tx = createTextTranslator(locale, locale === "en" ? { ...uiEn, ...courseEn } : { ...uiId, ...courseId });
  input = { ...input, title: tx(input.title), summary: tx(input.summary), content: tx(input.content) };
  const blocks = parseMaterialDocument(input.content);
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const [bodyBytes, boldBytes, monoBytes] = await fontFiles;
  const [body, bold, mono] = await Promise.all([bodyBytes, boldBytes, monoBytes].map((bytes) => doc.embedFont(bytes, { subset: true })));
  doc.setTitle(`${locale === "en" ? "Material" : "Materi"} ${input.number} — ${input.title}`);
  doc.setAuthor("Quethink");
  doc.setLanguage(locale === "en" ? "en-US" : "id-ID");
  const layout = new MaterialPdfLayout(doc, { body, bold, mono }, `Quethink · ${locale === "en" ? "Material" : "Materi"} ${input.number}`);
  layout.heading(input.title, 22);
  if (input.summary) layout.paragraph(input.summary);
  for (const [index, block] of blocks.entries()) {
    const following = blocks[index + 1];
    if (block.type === "heading") layout.heading(block.text, block.depth > 2 ? 12 : 14, following?.type === "paragraph" ? following.text : "");
    else if (block.type === "table") layout.table(block.rows);
    else layout.paragraph(block.text, block.type === "code" ? "mono" : "body", block.type === "code" ? 9 : 10.5);
  }
  layout.finish();
  return doc.save();
}
