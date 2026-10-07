import type { PracticeDataset } from "@/features/database/data/dataset-types";
import type { SqlabDocument } from "./document";
export function documentFromDataset(dataset: PracticeDataset): SqlabDocument {
  return {
    version: 1,
    name: dataset.title,
    schema: {
      version: 1,
      tables: dataset.tables.map((t) => ({
        id: `t_${t.name}`,
        name: t.name,
        columns: t.columns.map((c) => ({
          id: `c_${t.name}_${c.name}`,
          name: c.name,
          type: c.type,
          primary: c.key === "PK",
        })),
      })),
      relations: dataset.relations.map((r) => ({
        id: `r_${r.id}`,
        parentTable: `t_${r.parent}`,
        parentColumn: `c_${r.parent}_${r.parentColumn}`,
        childTable: `t_${r.child}`,
        childColumn: `c_${r.child}_${r.childColumn}`,
      })),
    },
    rows: Object.fromEntries(
      dataset.tables.map((t) => [`t_${t.name}`, t.rows.map((r) => ({ ...r }))]),
    ),
  };
}
