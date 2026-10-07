"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { TableEditor } from "@/features/schema-builder/components/table-editor";
import { RelationEditor } from "@/features/schema-builder/components/relation-editor";
import type { SchemaDraft } from "@/features/schema-builder/domain/schema-draft";
export function StructureEditor({
  schema,
  change,
}: {
  schema: SchemaDraft;
  change: (schema: SchemaDraft) => string | null;
}) {
  const [active, setActive] = useState("");
  const [error, setError] = useState("");
  const table = schema.tables.find((t) => t.id === active) ?? schema.tables[0];
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const t = {
      id: crypto.randomUUID(),
      name: String(new FormData(form).get("name")),
      columns: [],
    };
    const failure = change({ ...schema, tables: [...schema.tables, t] });
    setError(failure ?? "");
    if (!failure) {
      setActive(t.id);
      form.reset();
    }
  }
  return (
    <div>
      <h2 className="text-lg font-semibold">Susun skema</h2>
      <form onSubmit={add} className="mt-4">
        <Label htmlFor="new-sqlab-table">Nama tabel baru</Label>
        <div className="mt-2 flex gap-2">
          <Input
            id="new-sqlab-table"
            name="name"
            required
            maxLength={30}
            placeholder="misalnya books"
            autoCapitalize="none"
          />
          <Button type="submit" disabled={schema.tables.length >= 6}>
            Tambah
          </Button>
        </div>
      </form>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Maksimal 6 tabel, 8 kolom per tabel, dan 12 relasi. Kosongkan record
        sebelum mengubah tipe kolom yang sudah terisi.
      </p>
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {table && (
        <>
          <div className="mt-5">
            <Label htmlFor="sqlab-edit-table">Tabel yang diedit</Label>
            <Select
              id="sqlab-edit-table"
              value={table.id}
              className="mt-2"
              onChange={(e) => setActive(e.target.value)}
            >
              {schema.tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
          <TableEditor
            key={table.id}
            table={table}
            draft={schema}
            change={(next) => {
              const failure = change(next);
              setError(failure ?? "");
              return failure;
            }}
          />
        </>
      )}
      <RelationEditor
        draft={schema}
        change={(next) => {
          const failure = change(next);
          setError(failure ?? "");
          return failure;
        }}
      />
    </div>
  );
}
