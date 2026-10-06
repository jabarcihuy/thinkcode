import { afterEach, describe, expect, it, vi } from "vitest";
import { createLocalDraftStore } from "./local-draft-store";

afterEach(() => vi.unstubAllGlobals());
const parse = (value: unknown) => typeof value === "string" && value.length < 20 ? value : null;
function setup() {
  const values = new Map<string, string>();
  vi.stubGlobal("localStorage", { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) });
  const create = (key = "user-a:session-a", signature = "questions-v1") => createLocalDraftStore({ key, signature, initial: "", parse });
  return { values, create };
}
describe("input draft recovery", () => {
  it("restores a saved value across a remount, without storing scores", () => {
    const { create, values } = setup();
    const store = create(); store.save("answer");
    expect(create().getSnapshot()).toEqual({ value: "answer", status: "saved", restored: true });
    expect([...values.values()].join()).not.toContain("score");
  });
  it("does not mix accounts or sessions", () => {
    const { create } = setup(); create().save("first");
    expect(create("user-b:session-a").getSnapshot().value).toBe("");
    expect(create("user-a:session-b").getSnapshot().value).toBe("");
  });
  it("rejects changed questions and corrupted data", () => {
    const { create, values } = setup(); create().save("answer");
    expect(create(undefined, "questions-v2").getSnapshot().status).toBe("invalid");
    values.set("user-a:session-a", "broken-json");
    expect(create().getSnapshot().status).toBe("invalid");
  });
  it("rejects malformed and oversized values without crashing", () => {
    const { create, values } = setup();
    values.set("user-a:session-a", JSON.stringify({ version: 1, signature: "questions-v1", value: { score: 100 } }));
    expect(create().getSnapshot().status).toBe("invalid");
    values.set("user-a:session-a", "x".repeat(384_001));
    expect(create().getSnapshot().status).toBe("invalid");
  });
  it("keeps input in memory and reports failure when storage is blocked", () => {
    vi.stubGlobal("localStorage", { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("quota"); } });
    const store = createLocalDraftStore({ key: "a", signature: "a", initial: "", parse });
    expect(store.getSnapshot().status).toBe("failed");
    store.save("answer");
    expect(store.getSnapshot()).toMatchObject({ value: "answer", status: "failed" });
  });
  it("allows retry after storage becomes available", () => {
    const { create, values } = setup(), store = create();
    vi.stubGlobal("localStorage", { getItem: () => null, setItem() { throw new Error("quota"); } });
    store.save("retry");
    vi.stubGlobal("localStorage", { setItem: (key: string, value: string) => values.set(key, value), getItem: (key: string) => values.get(key) ?? null });
    store.save(store.getSnapshot().value);
    expect(store.getSnapshot().status).toBe("saved");
    expect(create().getSnapshot().value).toBe("retry");
  });
  it("removes only this draft after successful submission/reset", () => {
    const { create } = setup(); const store = create(); store.save("first"); create("other").save("keep");
    expect(store.clear()).toBe(true);
    expect(create().getSnapshot().status).toBe("empty");
    expect(create("other").getSnapshot().value).toBe("keep");
  });
  it("notifies listeners and has a deterministic SSR loading snapshot", () => {
    const { create } = setup(), store = create(), listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    expect(store.getServerSnapshot()).toEqual({ value: "", status: "loading", restored: false });
    store.save("answer"); expect(listener).toHaveBeenCalledOnce(); unsubscribe();
    store.clear(); expect(listener).toHaveBeenCalledOnce();
  });
});
