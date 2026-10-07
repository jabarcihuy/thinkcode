import { describe, expect, it } from "vitest";
import { resetGuestStorage } from "./reset";
import { GUEST_LOCAL_PREFIX } from "../domain/local-progress";
describe("guest reset isolation", () => {
 it("clears guest data and schema drafts, preserves account drafts and unrelated settings", () => {
  const entries = new Map([[GUEST_LOCAL_PREFIX + "progress", "guest"], ["quethink:schema-draft:v1:" + GUEST_LOCAL_PREFIX + "core", "schema"], ["quethink:practice-draft:v1:account:exercise", "account"], ["theme", "dark"]]);
  const storage = { get length() { return entries.size; }, key: (i: number) => [...entries.keys()][i] ?? null, removeItem: (key: string) => { entries.delete(key); } };
  expect(resetGuestStorage(storage)).toBe(true); expect([...entries.keys()]).toEqual(["quethink:practice-draft:v1:account:exercise", "theme"]);
 });
 it("reports a storage denial instead of claiming reset succeeded", () => { expect(resetGuestStorage({ length: 1, key: () => GUEST_LOCAL_PREFIX + "progress", removeItem: () => { throw new Error("denied"); } })).toBe(false); });
});
