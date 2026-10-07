"use client";

import { useId, useState } from "react";
import { CampusDataExplorer } from "./campus-data-explorer";
import { getDataset, isDatasetId, PRACTICE_DATASETS } from "../data/datasets";
import type { DatasetId } from "../data/dataset-types";

export function CampusDataPreview({ compact = false }: { compact?: boolean }) {
  const [datasetId, setDatasetId] = useState<DatasetId>("campus");
  const id = useId();
  return <section id="database-explorer" aria-labelledby={`${id}-title`} className={compact ? "scroll-mt-6 py-4" : "mt-10 scroll-mt-24 border-y border-border py-8"}>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 id={`${id}-title`} className={compact ? "sr-only" : "text-2xl font-semibold tracking-tight"}>Jelajahi tabel dan relasi</h2><p className={`${compact ? "hidden" : ""} mt-2 max-w-[65ch] text-sm leading-6 text-muted-foreground`}>Pilih record dan ikuti key-nya. Bandingkan bentuk relasi pada skema lain.</p></div>
      <div><label htmlFor={`${id}-dataset`} className="sr-only">Skema yang dijelajahi</label><select id={`${id}-dataset`} value={datasetId} onChange={(event) => { if (isDatasetId(event.target.value)) setDatasetId(event.target.value); }} className="min-h-11 max-w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-ring sm:text-sm">{PRACTICE_DATASETS.map((dataset) => <option key={dataset.id} value={dataset.id}>{dataset.title}</option>)}</select></div>
    </div>
    <div className="mt-6"><CampusDataExplorer key={datasetId} dataset={getDataset(datasetId)} /></div>
  </section>;
}
