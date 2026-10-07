"use client";

import { useText } from "@/i18n/use-text";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { QueryScenario } from "@/features/database/domain/lesson-scenarios";
const loading = () => <p role="status" className="py-5 text-sm text-muted-foreground">Menyiapkan tabel latihan…</p>;
const DatasetLabSwitcher = dynamic(() => import("@/features/database/components/dataset-lab-switcher").then((module) => module.DatasetLabSwitcher), { loading });
const CampusDataPreview = dynamic(() => import("@/features/database/components/campus-data-preview").then((module) => module.CampusDataPreview), { loading });

const explorationIds = new Set(["database-lab", "database-explorer", "lab-tables", "lab-query", "lab-results", "lab-tutor"]);
export function LabExploration({ scenarios, lessonId, userId }: { scenarios?: readonly QueryScenario[]; lessonId: string; userId: string }) {
  const tx = useText();

  const details = useRef<HTMLDetailsElement>(null);
  const [visited, setVisited] = useState(false);
  useEffect(() => {
    const reveal = (id: string) => {
      if (!explorationIds.has(id) || (!scenarios && id === "lab-tutor")) return false;
      if (details.current) details.current.open = true;
      setVisited(true);
      // Dynamic modules may not be ready yet; their mount signals the destination.
      const observer = new MutationObserver(() => {
        const target = document.getElementById(id);
        if (target) { target.scrollIntoView({ block: "start" }); observer.disconnect(); }
      });
      observer.observe(details.current!, { childList: true, subtree: true });
      document.getElementById(id)?.scrollIntoView({ block: "start" });
      const timeout = window.setTimeout(() => observer.disconnect(), 5000);
      observers.push(() => { observer.disconnect(); window.clearTimeout(timeout); });
      return true;
    };
    const observers: Array<() => void> = [];
    const click = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (link && reveal(link.hash.slice(1))) { event.preventDefault(); history.replaceState(null, "", link.hash); }
    };
    document.addEventListener("click", click);
    reveal(location.hash.slice(1));
    return () => { document.removeEventListener("click", click); observers.forEach((dispose) => dispose()); };
  }, [scenarios]);
  return <div className="my-5">
    <nav aria-label={tx("Akses cepat Lab")} className="flex flex-wrap gap-2">
      {(scenarios ? [["lab-tables", "Tabel"], ["lab-query", "Query"], ["lab-results", "Hasil"]] : [["database-explorer", "Tabel dan relasi"]]).map(([id, label]) => <a key={id} href={`#${id}`} className="inline-flex min-h-11 items-center rounded-md border border-border px-3 text-sm font-medium hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring">{tx(label)}</a>)}
      <a href="#lesson-practice" className="inline-flex min-h-11 items-center rounded-md bg-secondary px-3 text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-ring">{tx("Latihan inti")}</a>
    </nav>
    <details ref={details} onToggle={(event) => { if (event.currentTarget.open) setVisited(true); }} className="mt-3 rounded-lg border border-border px-4">
      <summary className="min-h-12 cursor-pointer content-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring">{tx(scenarios ? "Eksplorasi tabel dan query" : "Jelajahi tabel dan relasi")}</summary>
      {visited && (scenarios ? <DatasetLabSwitcher compact scenarios={scenarios} userId={userId} lessonId={lessonId} /> : <CampusDataPreview compact />)}
    </details>
  </div>;
}
