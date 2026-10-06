import { useId } from "react";
import { getDataset } from "@/features/database/data/datasets";
import type { QuestionData } from "@/features/database/validation/question-data";

export function QuestionRelationMap({ data }: { data: QuestionData }) {
  const id = useId();
  const dataset = getDataset(data.datasetId);
  const links = dataset.relations.filter((link) => data.tables.includes(link.parent) && data.tables.includes(link.child));
  if (!data.relations || !links.length) return null;
  const height = data.tables.length * 64;
  return <figure className="mb-5" aria-labelledby={`${id}-caption`}>
    <svg role="img" aria-labelledby={`${id}-title`} viewBox={`0 0 320 ${height}`} className="max-h-64 w-full max-w-80">
      <title id={`${id}-title`}>Skema {dataset.title}: {links.map((link) => `${link.parent} satu ke banyak ${link.child}`).join("; ")}</title>
      {data.tables.map((name, index) => <g key={name}><rect x="8" y={index * 64 + 8} width="238" height="44" rx="8" fill="var(--background)" stroke="var(--border)" /><text x="23" y={index * 64 + 36} fontSize="16" fill="var(--foreground)">{name}</text></g>)}
      {links.map((link, index) => {
        const start = data.tables.indexOf(link.parent) * 64 + 30, end = data.tables.indexOf(link.child) * 64 + 30, x = 267 + index * 24;
        return <g key={link.id}><path d={`M246 ${start} H${x} V${end} H246`} fill="none" stroke="var(--primary)" strokeWidth="1.5" /><text x="249" y={start - 5} fontSize="14" fill="var(--primary)">1</text><text x="249" y={end - 5} fontSize="14" fill="var(--primary)">N</text></g>;
      })}
    </svg>
    <figcaption id={`${id}-caption`} className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">{links.map((link) => <p key={link.id}><code>{link.child}.{link.childColumn}</code> merujuk <code>{link.parent}.{link.parentColumn}</code>.</p>)}</figcaption>
  </figure>;
}

/** Always-visible, read-only question data. No exploration hints or grading output. */
export function QuestionDataView({ data }: { data: QuestionData }) {
  const dataset = getDataset(data.datasetId);
  return <section aria-label="Data pendukung soal" className="mt-5 min-w-0 space-y-5 border-y border-border py-5">
    <h3 className="text-base font-semibold">Data awal · {dataset.title}</h3>
    <QuestionRelationMap data={data} />
    {data.tables.map((name) => {
      const table = dataset.tables.find((table) => table.name === name)!;
      return <div key={name} role="region" aria-label={`Tabel soal ${name}`} tabIndex={0} className="max-w-full overflow-x-auto focus-visible:outline-2 focus-visible:outline-ring">
        <table className="w-full border-collapse text-left text-sm leading-6"><caption className="mb-2 text-left font-mono text-base font-semibold">{name}</caption>
          <thead><tr>{table.columns.map((column) => <th key={column.name} scope="col" className="border-b border-border bg-muted px-3 py-2 font-medium">{column.name}</th>)}</tr></thead>
          <tbody>{table.rows.map((row, index) => <tr key={index}>{table.columns.map((column) => <td key={column.name} className="whitespace-nowrap border-b border-border px-3 py-2 tabular-nums">{String(row[column.name] ?? "NULL")}</td>)}</tr>)}</tbody>
        </table>
      </div>;
    })}
  </section>;
}
