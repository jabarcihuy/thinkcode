
import { useText } from "@/i18n/use-text";
import { ArrowDown, KeyRound } from "lucide-react";

/** Static example: no SQL runtime or user draft is loaded on the public page. */
export function SqlabPreview() {
  const tx = useText();

  return (
    <figure aria-labelledby="sqlab-preview-title" className="min-w-0 rounded-lg border border-border bg-white">
      <figcaption className="border-b border-border px-5 py-4">
        <h3 id="sqlab-preview-title" className="font-semibold">{tx("Dari skema menjadi data")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{tx("Contoh Katalog Buku di SQLab.")}</p>
      </figcaption>
      <div className="p-5 sm:p-6">
        <div className="grid min-w-0 gap-3 min-[480px]:grid-cols-[minmax(0,1fr)_1.5rem_minmax(0,1fr)] min-[480px]:items-center">
          <div className="overflow-hidden rounded-md border border-border">
            <p className="bg-secondary px-3 py-2 font-mono text-sm font-semibold">{"authors"}</p>
            <p className="flex items-center gap-2 px-3 py-2 font-mono text-xs"><KeyRound size={12} aria-hidden="true" />{"author_id · PK"}</p>
            <p className="border-t border-border px-3 py-2 font-mono text-xs">{"name"}</p>
          </div>
          <span aria-hidden="true" className="mx-auto h-5 w-px bg-primary min-[480px]:h-px min-[480px]:w-full" />
          <div className="overflow-hidden rounded-md border border-border">
            <p className="bg-live-surface px-3 py-2 font-mono text-sm font-semibold">{"books"}</p>
            <p className="px-3 py-2 font-mono text-xs">{"book_id · PK"}</p>
            <p className="border-t border-border px-3 py-2 font-mono text-xs">{"title"}</p>
            <p className="border-t border-border px-3 py-2 font-mono text-xs">{"author_id · FK"}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{tx("Satu penulis dapat memiliki beberapa buku.")}</p>
        <ArrowDown size={18} className="mx-auto my-4 text-muted-foreground" aria-hidden="true" />
        <div className="overflow-x-auto rounded-md border border-border" role="region" aria-label={tx("Contoh data buku")} tabIndex={0}>
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{tx("Dua buku dari penulis yang sama")}</caption>
            <thead className="bg-muted"><tr><th scope="col" className="px-3 py-2 font-medium">{tx("Judul")}</th><th scope="col" className="px-3 py-2 font-medium">{tx("Penulis")}</th></tr></thead>
            <tbody className="divide-y divide-border">
              <tr><td className="px-3 py-3">Dasar Basis Data</td><td className="px-3 py-3">Rani</td></tr>
              <tr><td className="px-3 py-3">Logika Data</td><td className="px-3 py-3">Rani</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </figure>
  );
}
