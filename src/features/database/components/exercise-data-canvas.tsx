"use client";
import { useText } from "@/i18n/use-text";


import { ChevronDown } from "lucide-react";
import { getDataset } from "../data/datasets";
import type { DatasetId } from "../data/dataset-types";
import { CampusDataExplorer } from "@/features/database/components/campus-data-explorer";

export function ExerciseDataCanvas({ query = "", datasetId = "campus" }: { query?: string; datasetId?: DatasetId }) {
  const tx = useText();

  return <details className="mt-5 border-y border-border py-3">
    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
      <span>{tx("Jelajahi tabel dan relasinya")}</span>
      <ChevronDown size={16} aria-hidden="true" className="shrink-0 text-muted-foreground" />
    </summary>
    <div className="pt-3">
      <CampusDataExplorer key={datasetId} dataset={getDataset(datasetId)} query={query} />
    </div>
  </details>;
}
