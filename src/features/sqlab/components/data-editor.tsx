"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { SqlabDocument } from "../domain/document";
export function DataEditor({
  document: doc,
  change,
}: {
  document: SqlabDocument;
  change: (doc: SqlabDocument) => string | null;
}) {
  const [tableId, setTableId] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState("");
  const table =
    doc.schema.tables.find((t) => t.id === tableId) ?? doc.schema.tables[0];
  if (!table?.columns.length)
    return (
      <p className="py-6 text-sm text-muted-foreground">
        Tambahkan tabel dan kolom di Skema terlebih dahulu.
      </p>
    );
  const rows = doc.rows[table.id] ?? [];
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!table) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const row = Object.fromEntries(
      table.columns.map((c) => {
        const raw = String(data.get(c.id) ?? "");
        return [
          c.name,
          raw === "" ? null : c.type === "text" ? raw : Number(raw),
        ];
      }),
    );
    const next =
      editing === null
        ? [...rows, row]
        : rows.map((r, i) => (i === editing ? row : r));
    const failure = change({ ...doc, rows: { ...doc.rows, [table.id]: next } });
    setError(failure ?? "");
    if (!failure) {
      setEditing(null);
      form.reset();
    }
  }
  return (
    <section className="space-y-5">
      <div>
        <Label htmlFor="data-table">Tabel</Label>
        <Select
          id="data-table"
          value={table.id}
          className="mt-2"
          onChange={(e) => {
            setTableId(e.target.value);
            setEditing(null);
            setError("");
          }}
        >
          {doc.schema.tables.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
      </div>
      <div
        tabIndex={0}
        role="region"
        aria-label={`Data ${table.name}`}
        className="max-w-full overflow-auto rounded-lg border border-border"
      >
        <table className="w-full text-left text-sm">
          <caption className="p-3 text-left">{rows.length} record</caption>
          <thead>
            <tr>
              {table.columns.map((c) => (
                <th
                  key={c.id}
                  className="whitespace-nowrap border-b p-3 font-mono"
                >
                  {c.name}
                </th>
              ))}
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {table.columns.map((c) => (
                  <td key={c.id} className="max-w-60 break-words border-b p-3">
                    {String(row[c.name] ?? "NULL")}
                  </td>
                ))}
                <td className="border-b p-2">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditing(i);
                        setError("");
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const failure = change({
                          ...doc,
                          rows: {
                            ...doc.rows,
                            [table.id]: rows.filter((_, n) => n !== i),
                          },
                        });
                        setError(failure ?? "");
                        if (!failure) setEditing(null);
                      }}
                    >
                      Hapus
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form
        key={`${table.id}:${editing}`}
        onSubmit={save}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold">
          {editing === null ? "Tambah record" : "Edit record"}
        </h2>
        {table.columns.map((c) => (
          <div key={c.id}>
            <Label htmlFor={`cell-${c.id}`}>
              {c.name}
              {c.primary ? " (PK)" : ""}
            </Label>
            <Input
              id={`cell-${c.id}`}
              name={c.id}
              className="mt-2"
              type={c.type === "text" ? "text" : "number"}
              step={c.type === "integer" ? "1" : "any"}
              maxLength={500}
              required={c.primary}
              defaultValue={
                editing === null ? "" : (rows[editing]?.[c.name] ?? "")
              }
            />
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Kolom kosong disimpan sebagai NULL. Maksimal 100 record per tabel.
        </p>
        <div className="flex gap-2">
          <Button type="submit">Simpan record</Button>
          {editing !== null && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(null)}
            >
              Batal
            </Button>
          )}
        </div>
      </form>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
