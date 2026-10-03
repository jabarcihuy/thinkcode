import type { SchemaDraft } from "../domain/schema-draft";

export function createDraftStore(scenarioId: string) {
  const key = `quethink:schema-draft:v1:${scenarioId}`;
  let snapshot: string | null | undefined;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  return {
    getSnapshot() {
      if (snapshot === undefined) {
        try { snapshot = localStorage.getItem(key); } catch { snapshot = null; }
      }
      return snapshot;
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => { if (event.key === key || event.key === null) { snapshot = event.newValue; emit(); } };
      window.addEventListener("storage", onStorage);
      return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
    },
    save(draft: SchemaDraft) {
      snapshot = JSON.stringify(draft);
      let persisted = true;
      try { localStorage.setItem(key, snapshot); } catch { persisted = false; }
      emit();
      return persisted;
    },
  };
}
