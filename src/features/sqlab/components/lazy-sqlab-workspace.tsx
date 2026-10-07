"use client";
import dynamic from "next/dynamic";
const Workspace = dynamic(() => import("./sqlab-workspace").then((module) => module.SqlabWorkspace), {
  loading: () => <p role="status" className="py-6 text-sm text-muted-foreground">Menyiapkan SQLab…</p>,
});
export function LazySqlabWorkspace({ userId }: { userId: string }) {
  return <Workspace userId={userId} />;
}
