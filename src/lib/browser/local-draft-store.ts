export type DraftStatus = "loading" | "empty" | "saved" | "failed" | "invalid";
export interface DraftSnapshot<T> { value: T; status: DraftStatus; restored: boolean }

const MAX_DRAFT_CHARS = 384_000;

/** Local input recovery only. Never use this data as progress or grading evidence. */
export function createLocalDraftStore<T>({ key, signature, initial, parse }: {
  key: string | null; signature: string; initial: T; parse: (value: unknown) => T | null;
}) {
  const serverSnapshot: DraftSnapshot<T> = { value: initial, status: "loading", restored: false };
  let snapshot: DraftSnapshot<T> | undefined;
  const listeners = new Set<() => void>();
  function emit() { listeners.forEach((listener) => listener()); }
  function getSnapshot(): DraftSnapshot<T> {
    if (snapshot) return snapshot;
    snapshot = { value: initial, status: "empty", restored: false };
    if (!key) return snapshot;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return snapshot;
      if (raw.length > MAX_DRAFT_CHARS) throw new Error("Oversized draft");
      const saved: unknown = JSON.parse(raw);
      if (!saved || typeof saved !== "object" || !("version" in saved) || saved.version !== 1 ||
        !("signature" in saved) || saved.signature !== signature || !("value" in saved)) throw new Error("Changed draft");
      const value = parse(saved.value);
      if (value === null) throw new Error("Invalid draft");
      snapshot = { value, status: "saved", restored: true };
    } catch (cause) {
      snapshot = { value: initial, status: cause instanceof SyntaxError || cause instanceof Error && ["Oversized draft", "Changed draft", "Invalid draft"].includes(cause.message) ? "invalid" : "failed", restored: false };
    }
    return snapshot;
  }
  function save(value: T) {
    const previous = getSnapshot();
    snapshot = { value, status: "empty", restored: previous.restored };
    if (key) {
      try {
        const raw = JSON.stringify({ version: 1, signature, value });
        if (raw.length > MAX_DRAFT_CHARS || parse(value) === null) throw new Error("Invalid draft");
        localStorage.setItem(key, raw);
        snapshot.status = "saved";
      } catch { snapshot.status = "failed"; }
    }
    emit();
  }
  return {
    getSnapshot, getServerSnapshot: () => serverSnapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    save,
    clear() {
      let cleared = true;
      try { if (key) localStorage.removeItem(key); } catch { cleared = false; }
      snapshot = { value: initial, status: cleared ? "empty" : "failed", restored: false };
      emit();
      return cleared;
    },
  };
}
