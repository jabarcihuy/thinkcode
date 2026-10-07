import { afterEach, describe, expect, it, vi } from "vitest";
import { createDraftStore } from "./draft-store";
import { MODELING_SCENARIOS } from "../data/scenarios";
import { readDraft } from "../domain/schema-draft";

afterEach(() => vi.unstubAllGlobals());

describe("local visual drafts", () => {
  it("persists separately for each case and restores a draft after reopening", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) });
    const draft = MODELING_SCENARIOS[0]!.reference;
    expect(createDraftStore("library").save(draft)).toBe(true);
    expect(readDraft(createDraftStore("library").getSnapshot())).toEqual(draft);
    expect(createDraftStore("shop").getSnapshot()).toBeNull();
  });
  it("keeps a working session when browser storage is unavailable", () => {
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("quota"); } });
    const store = createDraftStore("library");
    expect(store.getSnapshot()).toBeNull();
    expect(store.save(MODELING_SCENARIOS[0]!.reference)).toBe(false);
    expect(readDraft(store.getSnapshot())).toEqual(MODELING_SCENARIOS[0]!.reference);
  });
});

it("keeps explicitly transient preview models memory-only without touching browser storage", () => {
  const getItem = vi.fn(), setItem = vi.fn();
  vi.stubGlobal("localStorage", { getItem, setItem });
  const store = createDraftStore("guest", false);
  expect(store.getSnapshot()).toBeNull();
  store.save(MODELING_SCENARIOS[0]!.reference);
  expect(readDraft(store.getSnapshot())).not.toBeNull();
  expect(getItem).not.toHaveBeenCalled(); expect(setItem).not.toHaveBeenCalled();
  expect(createDraftStore("guest", false).getSnapshot()).toBeNull();
});
