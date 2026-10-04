import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { parseMaterialDocument } from "../domain/material-document";
import { MaterialPdfLayout } from "./pdf-layout";

const fontFiles = Promise.all(["geist-sans/Geist-Regular.ttf", "geist-sans/Geist-Bold.ttf", "geist-mono/GeistMono-Regular.ttf"].map((name) => readFile(join(process.cwd(), "node_modules/geist/dist/fonts", name))));

export async function createMaterialPdf(input: { number: number; title: string; summary: string; content: string }): Promise<Uint8Array> {
  const blocks = parseMaterialDocument(input.content);
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const [bodyBytes, boldBytes, monoBytes] = await fontFiles;
  const [body, bold, mono] = await Promise.all([bodyBytes, boldBytes, monoBytes].map((bytes) => doc.embedFont(bytes, { subset: true })));
  doc.setTitle(`Materi ${input.number} — ${input.title}`);
  doc.setAuthor("Quethink");
  doc.setLanguage("id-ID");
  const layout = new MaterialPdfLayout(doc, { body, bold, mono }, `Quethink · Materi ${input.number}`);
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
