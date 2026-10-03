"use client";

import { useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { columnSchema, MAX_COLUMNS, type ModelColumn, type ModelTable, type SchemaDraft } from "../domain/schema-draft";
import { removeColumn, removeTable, saveColumn } from "../domain/schema-operations";
import { ModelFormError } from "./model-form-error";

interface Props { table: ModelTable; draft: SchemaDraft; change: (draft: SchemaDraft) => string | null }

export function TableEditor({ table, draft, change }: Props) {
  const [editing, setEditing] = useState<ModelColumn | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [renameError, setRenameError] = useState("");
  const [columnError, setColumnError] = useState("");
  function rename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("table-name")).trim();
    setRenameError(change({ ...draft, tables: draft.tables.map((item) => item.id === table.id ? { ...item, name } : item) }) ?? "");
  }
  function submitColumn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const result = columnSchema.safeParse({ id: editing?.id ?? crypto.randomUUID(), name: data.get("column-name"), type: data.get("column-type"), primary: data.get("primary") === "on" });
    if (!result.success) { setColumnError(result.error.issues[0]?.message ?? "Periksa nama kolom."); return; }
    const failure = change(saveColumn(draft, table.id, result.data));
    setColumnError(failure ?? "");
    if (!failure) { setEditing(null); form.reset(); }
  }

  return <section className="mt-6 border-t border-border pt-6" aria-labelledby="table-editor-title">
    <h3 id="table-editor-title" className="text-base font-semibold">Tabel <span className="font-mono">{table.name}</span></h3>
    <form onSubmit={rename} onChange={() => setRenameError("")} className="mt-4 flex flex-col gap-2">
      <Label htmlFor="table-name">Nama tabel</Label>
      <div className="flex gap-2"><Input key={table.name} id="table-name" name="table-name" defaultValue={table.name} maxLength={30} required autoCapitalize="none" spellCheck={false} aria-invalid={!!renameError} aria-describedby={renameError ? "rename-error" : undefined} /><Button type="submit" variant="outline" className="shrink-0 px-3">Ubah</Button></div>
      <ModelFormError id="rename-error" message={renameError} />
    </form>
    <ul className="mt-5 divide-y divide-border">
      {table.columns.map((column) => <li key={column.id} className="flex min-w-0 items-center gap-2 py-2">
        <div className="min-w-0 flex-1"><p className="break-all font-mono text-sm">{column.name}</p><p className="mt-1 text-xs text-muted-foreground">{column.type}{column.primary ? " · PK" : draft.relations.some((relation) => relation.childColumn === column.id) ? " · FK" : ""}</p></div>
        <Button type="button" variant="ghost" className="shrink-0 px-3" aria-label={`Edit kolom ${column.name}`} onClick={() => setEditing(column)}><Pencil size={16} aria-hidden="true" /></Button>
        <Button type="button" variant="ghost" className="shrink-0 px-3" aria-label={`Hapus kolom ${column.name} dan relasinya`} onClick={() => { change(removeColumn(draft, table.id, column.id)); if (editing?.id === column.id) setEditing(null); }}><Trash2 size={16} aria-hidden="true" /></Button>
      </li>)}
    </ul>
    {!table.columns.length && <p className="mt-4 text-sm leading-6 text-muted-foreground">Tambahkan kolom identitas, lalu kolom untuk fakta yang ingin disimpan.</p>}
    {(table.columns.length < MAX_COLUMNS || editing) && <form key={editing?.id ?? "new"} onSubmit={submitColumn} onChange={() => setColumnError("")} className="mt-5 space-y-4">
      <h4 className="text-sm font-semibold">{editing ? "Edit kolom" : "Tambah kolom"}</h4>
      <div><Label htmlFor="column-name">Nama kolom</Label><Input className="mt-2" id="column-name" name="column-name" defaultValue={editing?.name ?? ""} placeholder="misalnya member_id" maxLength={30} required autoCapitalize="none" spellCheck={false} aria-invalid={!!columnError} aria-describedby={columnError ? "column-error" : undefined} /></div>
      <div><Label htmlFor="column-type">Tipe data</Label><Select className="mt-2" id="column-type" name="column-type" defaultValue={editing?.type ?? "integer"}><option value="integer">integer — bilangan bulat</option><option value="text">text — teks</option><option value="real">real — angka desimal</option></Select></div>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><input type="checkbox" name="primary" defaultChecked={editing?.primary ?? false} className="size-5 shrink-0 accent-accent focus-visible:outline-2 focus-visible:outline-ring" />Primary key</label>
      <p className="text-xs leading-5 text-muted-foreground">Satu PK per tabel. Mengubah key atau tipe kolom dapat melepas relasinya; hubungkan kembali setelah mengedit.</p>
      <div className="flex flex-wrap gap-2"><Button type="submit"><Plus size={16} aria-hidden="true" />{editing ? "Simpan kolom" : "Tambah kolom"}</Button>{editing && <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Batal</Button>}</div>
      <ModelFormError id="column-error" message={columnError} />
    </form>}
    <div className="mt-6 border-t border-border pt-4">
      {confirmDelete ? <div><p className="text-sm leading-6">Hapus tabel ini beserta kolom dan relasinya?</p><div className="mt-2 flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => change(removeTable(draft, table.id))}>Ya, hapus</Button><Button type="button" variant="ghost" onClick={() => setConfirmDelete(false)}>Batal</Button></div></div> : <Button type="button" variant="ghost" onClick={() => setConfirmDelete(true)}><Trash2 size={16} aria-hidden="true" />Hapus tabel</Button>}
    </div>
  </section>;
}
