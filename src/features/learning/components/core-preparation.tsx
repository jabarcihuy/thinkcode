import { corePreparation } from "../domain/core-preparation";
export function CorePreparation({ slug }: { slug: string }) {
  const example = corePreparation(slug);
  if (!example) return null;
  return <details className="mt-4 rounded-lg bg-secondary px-4 py-2">
    <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring">Butuh contoh sebelum mencoba?</summary>
    <p className="mt-2 max-w-[72ch] text-sm leading-7">{example.explanation}</p>
    <pre className="my-4 overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-white p-4 font-mono text-sm leading-6">{example.example}</pre>
  </details>;
}
