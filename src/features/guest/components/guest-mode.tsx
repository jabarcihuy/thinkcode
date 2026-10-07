"use client";
import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { resetGuestStorage } from "../browser/reset";
import { createLocalDraftStore } from "@/lib/browser/local-draft-store";
import { emptyGuestProgress, GUEST_LOCAL_PREFIX, guestOverview, guestProgressSchema, type GuestLearningCatalog, type GuestLocalProgress } from "../domain/local-progress";
const GuestMode = createContext(false);
function useGuestStore(catalog: GuestLearningCatalog, name: string) {
  const store = useMemo(() => createLocalDraftStore({ key: GUEST_LOCAL_PREFIX + "progress", signature: "guest-progress-v1", initial: emptyGuestProgress, parse: (value: unknown) => guestProgressSchema.safeParse(value).data ?? null }), []);
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  function update(change: (value: GuestLocalProgress) => GuestLocalProgress) { store.save(change(store.getSnapshot().value)); }
  return {
    ...snapshot,
    name: snapshot.value.name || name,
    overview: guestOverview(catalog, snapshot.value),
    catalog,
    markRead: (id: string) => update((value) => ({ ...value, read: { ...value.read, [id]: new Date().toISOString() } })),
    markPassed: (id: string) => update((value) => ({ ...value, passedExercises: [...new Set([...value.passedExercises, id])] })),
    recordTest: (id: string, result: GuestLocalProgress["tests"][string]) => update((value) => ({ ...value, tests: { ...value.tests, [id]: { ...result, highestScore: Math.max(value.tests[id]?.highestScore ?? value.tests[id]?.score ?? 0, result.score), passed: result.passed || Boolean(value.tests[id]?.passed) } } })),
    rename: (name: string) => update((value) => ({ ...value, name })),
    reset: () => {
      try { if (!resetGuestStorage(localStorage)) return false; } catch { return false; }
      return store.clear();
    },
  };
}
const GuestLearning = createContext<ReturnType<typeof useGuestStore> | null>(null);
export function GuestModeProvider({ children, catalog = { path: null, lessons: [], exercises: [], tests: [] }, name = "" }: { children: React.ReactNode; catalog?: GuestLearningCatalog; name?: string }) {
  const store = useGuestStore(catalog, name);
  return <GuestMode.Provider value={true}><GuestLearning.Provider value={store}>{children}</GuestLearning.Provider></GuestMode.Provider>;
}
export const useGuestMode = () => useContext(GuestMode);
export const useGuestLearning = () => useContext(GuestLearning);
