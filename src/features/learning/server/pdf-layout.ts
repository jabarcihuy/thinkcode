import "server-only";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";

const WIDTH = 595.28, HEIGHT = 841.89, MARGIN = 48, BOTTOM = 56;
const ink = rgb(0.12, 0.12, 0.14), muted = rgb(0.36, 0.36, 0.4), rule = rgb(0.84, 0.84, 0.86);

export class MaterialPdfLayout {
  private page!: PDFPage;
  private y = HEIGHT - 66;
  constructor(private doc: PDFDocument, private fonts: { body: PDFFont; bold: PDFFont; mono: PDFFont }, private label: string) { this.newPage(); }

  private newPage() {
    if (this.doc.getPageCount() >= 60) throw new Error("Materi terlalu panjang untuk PDF.");
    this.page = this.doc.addPage([WIDTH, HEIGHT]);
    this.page.drawText(this.label, { x: MARGIN, y: HEIGHT - 32, size: 9, font: this.fonts.body, color: muted });
    this.page.drawLine({ start: { x: MARGIN, y: HEIGHT - 42 }, end: { x: WIDTH - MARGIN, y: HEIGHT - 42 }, thickness: 0.5, color: rule });
    this.y = HEIGHT - 66;
  }
  private ensure(height: number) { if (this.y - height < BOTTOM) this.newPage(); }
  private safe(text: string, font: PDFFont) {
    const supported = new Set(font.getCharacterSet());
    return [...text.replace(/\r\n?/g, "\n").replace(/\t/g, "    ")].map((char) => char === "\n" || supported.has(char.codePointAt(0)!) ? char : "?").join("");
  }
  private wrap(text: string, font: PDFFont, size: number, width: number) {
    const lines: string[] = [];
    for (const raw of this.safe(text, font).split("\n")) {
      let line = "";
      for (const token of raw.split(/(\s+)/)) {
        if (font.widthOfTextAtSize(line + token, size) <= width) { line += token; continue; }
        if (line.trim()) { lines.push(line.trimEnd()); line = ""; }
        if (!token.trim()) continue;
        for (const char of token) {
          if (font.widthOfTextAtSize(line + char, size) > width && line) { lines.push(line); line = ""; }
          line += char;
        }
      }
      lines.push(line.trimEnd());
    }
    return lines;
  }
  paragraph(text: string, kind: "body" | "bold" | "mono" = "body", size = 10.5, gap = 8) {
    const font = this.fonts[kind], lineHeight = kind === "mono" ? 13 : size * 1.5;
    const lines = this.wrap(text, font, size, WIDTH - MARGIN * 2);
    this.ensure(Math.min(lines.length, 2) * lineHeight);
    for (const [index, line] of lines.entries()) {
      this.ensure((lines.length - index === 2 ? 2 : 1) * lineHeight);
      this.page.drawText(line, { x: MARGIN, y: this.y, size, font, color: ink });
      this.y -= lineHeight;
    }
    this.y -= gap;
  }
  heading(text: string, size = 14, followingText = "") {
    const lines = this.wrap(text, this.fonts.bold, size, WIDTH - MARGIN * 2);
    const followingHeight = followingText ? Math.min(this.wrap(followingText, this.fonts.body, 10.5, WIDTH - MARGIN * 2).length, 4) * 15.75 + 24 : 44;
    this.ensure(lines.length * size * 1.5 + followingHeight);
    this.y -= 8;
    this.paragraph(text, "bold", size, 8);
  }
  table(rows: string[][]) {
    if (!rows.length) return;
    const columns = Math.max(...rows.map((row) => row.length));
    if (columns > 8) throw new Error("Tabel terlalu lebar untuk PDF.");
    const width = (WIDTH - MARGIN * 2) / columns;
    const prepared = rows.map((row, index) => Array.from({ length: columns }, (_, col) => this.wrap(row[col] ?? "", index === 0 ? this.fonts.bold : this.fonts.body, 9, width - 14)));
    const height = (row: string[][]) => Math.max(...row.map((cell) => cell.length)) * 13 + 14;
    const draw = (row: string[][], header: boolean) => {
      const rowHeight = height(row);
      if (rowHeight > HEIGHT - 180) throw new Error("Isi sel terlalu panjang untuk PDF.");
      row.forEach((lines, index) => {
        this.page.drawRectangle({ x: MARGIN + index * width, y: this.y - rowHeight, width, height: rowHeight, color: header ? rgb(0.94, 0.94, 0.95) : rgb(1, 1, 1), borderWidth: 0.5, borderColor: rule });
        lines.forEach((line, lineIndex) => this.page.drawText(line, { x: MARGIN + index * width + 7, y: this.y - 16 - lineIndex * 13, font: header ? this.fonts.bold : this.fonts.body, size: 9, color: ink }));
      });
      this.y -= rowHeight;
    };
    this.ensure(height(prepared[0]!) + (prepared[1] ? height(prepared[1]) : 0));
    draw(prepared[0]!, true);
    for (const row of prepared.slice(1)) {
      if (this.y - height(row) < BOTTOM) { this.newPage(); draw(prepared[0]!, true); }
      draw(row, false);
    }
    this.y -= 18;
  }
  finish() {
    this.doc.getPages().forEach((page, index) => page.drawText(`${index + 1} / ${this.doc.getPageCount()}`, { x: WIDTH - 78, y: 28, size: 9, font: this.fonts.body, color: muted }));
  }
}
