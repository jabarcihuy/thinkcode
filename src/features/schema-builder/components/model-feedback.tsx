


import { useText } from "@/i18n/use-text";
import type { ModelingScenario } from "../data/scenarios";
import { modelFeedback } from "../domain/model-feedback";
import type { SchemaDraft } from "../domain/schema-draft";

export function ModelFeedback({ draft, scenario }: { draft: SchemaDraft; scenario: ModelingScenario }) {
  const tx = useText();

  return <section aria-labelledby="model-feedback-title">
    <h2 id="model-feedback-title" className="text-lg font-semibold">{tx("Periksa modelmu")}</h2>
    <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6">{modelFeedback(draft, scenario).map((message) => <li key={message}>{tx(message)}</li>)}</ul>
    <h3 className="mt-7 text-sm font-semibold">{tx("Jelaskan alasanmu")}</h3>
    <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">{scenario.questions.map((question) => <li key={question}>{tx(question)}</li>)}</ol>
    <p className="mt-4 text-xs leading-5 text-muted-foreground">{tx("Pemeriksaan ini memberi petunjuk struktur, bukan skor atau kepastian bahwa desainmu paling tepat.")}</p>
    {draft.tables.length > 0 && <details className="mt-7 border-t border-border pt-3">
      <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-accent focus-visible:outline-2 focus-visible:outline-ring">{tx("Bandingkan dengan contoh model")}</summary>
      <p className="mt-3 text-sm leading-7">{tx(scenario.explanation)}</p>
      <ul className="mt-5 space-y-4">{scenario.reference.tables.map((table) => <li key={table.id}><p className="font-mono text-sm font-semibold">{table.name}</p><ul className="mt-2 space-y-1 text-xs leading-5 text-muted-foreground">{table.columns.map((column) => <li key={column.id}><span className="font-mono">{column.name}</span> · {column.type}{tx(column.primary ? " · PK" : scenario.reference.relations.some((relation) => relation.childColumn === column.id) ? " · FK" : "")}</li>)}</ul></li>)}</ul>
      <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-6">{scenario.reference.relations.map((relation) => <li key={relation.id}>{scenario.reference.tables.find((table) => table.id === relation.parentTable)!.name} {" "}{tx("(satu) →")}{" "}{scenario.reference.tables.find((table) => table.id === relation.childTable)!.name} {" "}{tx("(banyak)")}</li>)}</ul>
    </details>}
  </section>;
}
