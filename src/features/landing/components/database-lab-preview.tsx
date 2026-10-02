import { Database } from "lucide-react";

export function DatabaseLabPreview() {
  return (
    <figure className="min-w-0" aria-labelledby="lab-preview-title">
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-surface">
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <Database size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
            <h2 id="lab-preview-title" className="truncate text-sm font-semibold">Lab SQL</h2>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">Kampus Mini</span>
        </div>

        <div className="border-b border-border px-4 py-2.5 sm:px-5">
          <p className="text-sm font-medium leading-5">Siapa yang mengambil Basis Data?</p>
        </div>

        <div className="border-b border-border bg-code-surface">
          <pre className="overflow-x-auto px-4 py-2.5 font-mono text-[11px] leading-[1.65] text-code-foreground sm:px-5 sm:text-xs"><code><span className="text-muted-foreground">SELECT</span> s.name{"\n"}<span className="text-muted-foreground">FROM</span> students s{"\n"}<span className="text-muted-foreground">JOIN</span> enrollments e USING (student_id){"\n"}<span className="text-muted-foreground">JOIN</span> courses c USING (course_id){"\n"}<span className="text-muted-foreground">WHERE</span> c.course_name = &apos;Basis Data&apos;;</code></pre>
        </div>

        <div className="px-4 py-2.5 sm:px-5">
          <div className="mb-1 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold">Hasil query</p>
            <span className="font-mono text-[10px] text-muted-foreground">2 baris</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">Hasil query: Alya dan Citra mengambil mata kuliah Basis Data</caption>
              <tbody>
                <tr className="border-t border-border"><td className="py-1.5">Alya</td></tr>
                <tr className="border-t border-border"><td className="py-1.5">Citra</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </figure>
  );
}
