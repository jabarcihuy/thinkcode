import { Database, KeyRound, ArrowDown } from "lucide-react";

export function DatabaseLabPreview() {
  return <figure className="min-w-0 rounded-lg border border-border bg-white" aria-labelledby="lab-preview-title">
    <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4"><h2 id="lab-preview-title" className="flex items-center gap-2 text-sm font-semibold"><Database size={17} className="text-primary" aria-hidden="true" />Lab basis data</h2><span className="text-xs text-muted-foreground">Contoh visual</span></div>
    <div className="p-5 sm:p-6"><div className="grid grid-cols-[1fr_1.2rem_1fr] items-center gap-2" aria-label="Relasi satu mahasiswa ke banyak pendaftaran">
      <div className="overflow-hidden rounded-md border border-border"><h3 className="bg-secondary px-3 py-2 font-mono text-xs font-semibold">students</h3><p className="flex items-center gap-1.5 px-3 py-2 font-mono text-[11px]"><KeyRound size={12} aria-hidden="true" />student_id</p><p className="border-t border-border px-3 py-2 font-mono text-[11px]">name</p></div>
      <span aria-hidden="true" className="h-px bg-primary" />
      <div className="overflow-hidden rounded-md border border-border"><h3 className="bg-live-surface px-3 py-2 font-mono text-xs font-semibold">enrollments</h3><p className="px-3 py-2 font-mono text-[11px]">student_id · FK</p><p className="border-t border-border px-3 py-2 font-mono text-[11px]">course_id · FK</p></div>
    </div><p className="mt-3 text-xs leading-5 text-muted-foreground">Satu mahasiswa, beberapa pendaftaran.</p><div className="mt-5 border-t border-border pt-4"><p className="text-sm font-medium">Siapa mahasiswa angkatan 2024?</p><pre className="mt-3 overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs leading-6"><code><span className="text-primary">SELECT</span> name <span className="text-primary">FROM</span> students{"\n"}<span className="text-primary">WHERE</span> cohort = &apos;2024&apos;;</code></pre><ArrowDown size={17} className="mx-auto my-3 text-muted-foreground" aria-hidden="true" /><div className="flex items-center justify-between rounded-md bg-live-surface px-3 py-3 text-sm"><span>Alya · Citra</span><span className="text-xs text-muted-foreground">2 record</span></div></div></div>
  </figure>;
}
