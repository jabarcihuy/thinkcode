"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { loader } from "@monaco-editor/react";
import { useTheme } from "@/components/theme/theme-provider";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Memuat editor JavaScript…</div>,
});

export function JavaScriptEditor({ value, onChange, readOnly = false, modelPath }: { value: string; onChange?: (value: string) => void; readOnly?: boolean; modelPath: string }) {
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const monaco = await import("monaco-editor");
        const environment = self as typeof self & { MonacoEnvironment?: { getWorker: (_moduleId: string, label: string) => Worker } };
        environment.MonacoEnvironment = {
          getWorker(_moduleId, label) {
            if (label === "javascript" || label === "typescript") return new Worker(new URL("monaco-editor/esm/vs/language/typescript/ts.worker.js", import.meta.url), { type: "module" });
            return new Worker(new URL("monaco-editor/esm/vs/editor/editor.worker.js", import.meta.url), { type: "module" });
          },
        };
        loader.config({ monaco });
        if (active) setReady(true);
      } catch { if (active) setLoadError(true); }
    })();
    return () => { active = false; };
  }, []);
  return <div className="overflow-hidden rounded-lg border border-border">
    <div className="border-b border-border bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">main.js</div>
    <div className="h-[min(24rem,58vh)] min-h-64">{loadError ? <p className="p-5 text-sm text-destructive">Editor gagal dimuat. Segarkan halaman lalu coba lagi.</p> : ready ? <Editor language="javascript" path={modelPath} value={value} onChange={(next) => onChange?.(next ?? "")} theme={resolvedTheme === "dark" ? "vs-dark" : "light"} options={{ minimap: { enabled: false }, lineNumbers: "on", fontSize: 14, tabSize: 4, automaticLayout: true, readOnly, wordWrap: "on", wrappingIndent: "indent", scrollBeyondLastLine: false, padding: { top: 16, bottom: 16 } }} /> : <p className="flex h-full items-center justify-center text-sm text-muted-foreground">Memuat editor JavaScript…</p>}</div>
  </div>;
}
