"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useGuestMode } from "@/features/guest/components/guest-mode";
import { createLocalDraftStore } from "./local-draft-store";

export function useLocalDraft<T>(options: Parameters<typeof createLocalDraftStore<T>>[0]) {
  const guest = useGuestMode();
  const { signature, initial, parse } = options;
  const key = guest ? null : options.key;
  const store = useMemo(() => createLocalDraftStore({ key, signature, initial, parse }), [key, signature, initial, parse]);
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return { ...snapshot, save: store.save, clear: store.clear };
}
