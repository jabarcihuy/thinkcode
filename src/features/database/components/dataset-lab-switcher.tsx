"use client";

import { useId, useState } from "react";
import { DatabaseQueryLab } from "./database-query-lab";
import { getDataset } from "../data/datasets";
import type { QueryScenario } from "../domain/lesson-scenarios";

export function DatasetLabSwitcher({ scenarios, lessonId, userId }: { scenarios: readonly QueryScenario[]; lessonId?: string; userId?: string }) {
  const [index, setIndex] = useState(0);
  const id = useId();
  const scenario = scenarios[index] ?? scenarios[0]!;
  return <div>
    {scenarios.length > 1 && <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
      <div><label htmlFor={id} className="text-sm font-semibold">Skema latihan</label><p className="mt-1 text-xs leading-5 text-muted-foreground">Ganti skema untuk mencoba konteks lain. Data dimulai ulang; draf query tiap skema disimpan di browser ini.</p></div>
      <select id={id} value={index} onChange={(event) => setIndex(Number(event.target.value))} className="min-h-11 max-w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-ring sm:text-sm">
        {scenarios.map((item, position) => <option key={item.datasetId} value={position}>{getDataset(item.datasetId).title}</option>)}
      </select>
    </div>}
    <DatabaseQueryLab userId={userId} key={scenario.datasetId} datasetId={scenario.datasetId} starterSql={scenario.sql} title={scenario.title} prompt={scenario.prompt} lessonId={lessonId} />
  </div>;
}
