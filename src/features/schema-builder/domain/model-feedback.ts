import type { ModelingScenario } from "../data/scenarios";
import type { SchemaDraft } from "./schema-draft";

export function modelFeedback(draft: SchemaDraft, scenario: ModelingScenario): string[] {
  if (!draft.tables.length) return ["Mulai dengan satu tabel untuk jenis fakta yang ingin kamu simpan."];
  const feedback: string[] = [];
  for (const table of draft.tables) {
    if (!table.columns.length) feedback.push(`Tambahkan kolom pada ${table.name}.`);
    if (!table.columns.some((column) => column.primary)) feedback.push(`Pilih primary key untuk mengenali satu record di ${table.name}.`);
    if (table.columns.length === 1) feedback.push(`Selain identitas, fakta apa yang disimpan ${table.name}?`);
  }
  if (draft.tables.length < scenario.expectedTables) feedback.push("Periksa kembali jenis fakta pada kasus. Adakah yang perlu disimpan pada tabel terpisah?");
  if (draft.relations.length < scenario.expectedRelations) feedback.push("Telusuri rujukan antartabel: tambahkan foreign key pada tabel yang menyimpan hubungan.");
  const connected = new Set(draft.relations.flatMap((relation) => [relation.parentTable, relation.childTable]));
  if (draft.tables.length > 1 && draft.tables.some((table) => !connected.has(table.id))) feedback.push("Ada tabel yang belum terhubung. Apakah tabel itu perlu merujuk atau dirujuk tabel lain?");
  if (!feedback.length) feedback.push("Struktur dasarmu sudah terhubung dan memiliki primary key. Sekarang jelaskan arti setiap tabel dan bandingkan alasan desainmu dengan contoh.");
  return feedback;
}
