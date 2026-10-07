import type { SqlabDocument } from "../domain/document";
export type SqlabResult = {
  document: SqlabDocument;
  columns: string[];
  rows: Record<string, string | number | null>[];
  changes: number;
};
export function runSqlab(
  document: SqlabDocument,
  query: string,
  signal?: AbortSignal,
): Promise<SqlabResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./sqlab.worker.ts", import.meta.url), {
      type: "module",
    });
    let timer: ReturnType<typeof setTimeout>;
    const finish = (error?: string, result?: SqlabResult) => {
      clearTimeout(timer);
      worker.terminate();
      signal?.removeEventListener("abort", abort);
      if (error) reject(new Error(error));
      else resolve(result!);
    };
    const abort = () => finish("Query dibatalkan.");
    timer = setTimeout(
      () => finish("SQLite belum berhasil dimuat. Coba lagi."),
      15_000,
    );
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) {
      abort();
      return;
    }
    worker.onmessage = ({ data }) => {
      if (data.ready) {
        clearTimeout(timer);
        timer = setTimeout(
          () => finish("Query terlalu lama dan sudah dihentikan."),
          2000,
        );
      } else if (data.error) finish(data.error);
      else finish(undefined, data);
    };
    worker.onerror = () => finish("SQLab mengalami masalah. Coba lagi.");
    worker.postMessage({ document, query });
  });
}
