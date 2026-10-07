"use client";


import { useText } from "@/i18n/use-text";


import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { MAX_RELATIONS, type SchemaDraft } from "../domain/schema-draft";
import { ModelFormError } from "./model-form-error";

export function RelationEditor({ draft, change }: { draft: SchemaDraft; change: (draft: SchemaDraft) => string | null }) {
  const tx = useText();

  const [childId, setChildId] = useState("");
  const [error, setError] = useState("");
  const primaryKeys = draft.tables.flatMap((table) => table.columns.filter((column) => column.primary).map((column) => ({ table, column })));
  const candidates = draft.tables.flatMap((table) => table.columns.filter((column) => !column.primary && !draft.relations.some((relation) => relation.childColumn === column.id)).map((column) => ({ table, column })));
  const selectedChild = candidates.find((item) => item.column.id === childId) ?? candidates[0];
  const destinations = primaryKeys.filter((item) => selectedChild && item.table.id !== selectedChild.table.id && item.column.type === selectedChild.column.type);
  function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parent = destinations.find((item) => item.column.id === data.get("parent-key"));
    const child = candidates.find((item) => item.column.id === data.get("child-key"));
    if (!parent || !child) return;
    setError(change({ ...draft, relations: [...draft.relations, { id: crypto.randomUUID(), parentTable: parent.table.id, parentColumn: parent.column.id, childTable: child.table.id, childColumn: child.column.id }] }) ?? "");
  }
  return <section className="mt-8 border-t border-border pt-6" aria-labelledby="relation-editor-title">
    <h3 id="relation-editor-title" className="text-base font-semibold">{tx("Hubungkan tabel")}</h3>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{tx("Letakkan FK pada tabel yang merujuk. Hubungkan ke PK tabel lain dengan tipe yang sama.")}</p>
    {primaryKeys.length && candidates.length && draft.relations.length < MAX_RELATIONS ? <form onSubmit={connect} className="mt-4 space-y-4">
      <div><Label htmlFor="child-key">{tx("Foreign key sumber")}</Label><Select id="child-key" name="child-key" className="mt-2" value={selectedChild?.column.id ?? ""} onChange={(event) => { setChildId(event.target.value); setError(""); }} aria-describedby={!destinations.length ? "relation-guidance" : error ? "relation-error" : undefined}>{candidates.map(({ table, column }) => <option key={column.id} value={column.id}>{table.name}.{column.name} ({column.type})</option>)}</Select></div>
      <div><Label htmlFor="parent-key">{tx("Primary key tujuan")}</Label><Select key={selectedChild?.column.id} id="parent-key" name="parent-key" className="mt-2" disabled={!destinations.length} aria-describedby={!destinations.length ? "relation-guidance" : error ? "relation-error" : undefined}>{destinations.length ? destinations.map(({ table, column }) => <option key={column.id} value={column.id}>{table.name}.{column.name} ({column.type})</option>) : <option>{tx("Belum ada PK yang cocok")}</option>}</Select></div>
      {!destinations.length && <p id="relation-guidance" role="status" className="text-sm leading-6 text-muted-foreground">{tx("Pilih kolom sumber lain, atau tambahkan PK bertipe")}{" "}{selectedChild?.column.type} {" "}{tx("pada tabel tujuan yang berbeda.")}</p>}
      <Button type="submit" variant="outline" disabled={!destinations.length}>{tx("Tambah relasi")}</Button>
      <ModelFormError id="relation-error" message={tx(error)} />
    </form> : <p className="mt-4 text-sm leading-6 text-muted-foreground">{tx("Siapkan PK pada satu tabel dan kolom rujukan pada tabel lain untuk membuat relasi.")}</p>}
    <ul className="mt-5 divide-y divide-border">{draft.relations.map((relation) => {
      const parent = draft.tables.find((table) => table.id === relation.parentTable)!;
      const child = draft.tables.find((table) => table.id === relation.childTable)!;
      return <li key={relation.id} className="flex items-center gap-2 py-3">
        <div className="min-w-0 flex-1"><p className="break-all font-mono text-xs leading-5">{child.name}.{child.columns.find((column) => column.id === relation.childColumn)!.name} → {parent.name}.{parent.columns.find((column) => column.id === relation.parentColumn)!.name}</p><p className="mt-1 text-xs text-muted-foreground">{parent.name} {" "}{tx("(satu) →")}{" "}{child.name} {" "}{tx("(banyak)")}</p></div>
        <Button type="button" variant="ghost" className="shrink-0 px-3" aria-label={tx(`Hapus relasi ${child.name} ke ${parent.name}`)} onClick={() => change({ ...draft, relations: draft.relations.filter((item) => item.id !== relation.id) })}><Trash2 size={16} aria-hidden="true" /></Button>
      </li>;
    })}</ul>
  </section>;
}
