import { afterEach, describe, expect, it, vi } from "vitest";
import { SqliteBrowserRunner } from "./sqlite-browser-runner";

class FakeWorker {
  static instances: FakeWorker[] = [];
  messages: unknown[] = [];
  terminated = false;
  private listener: ((event: { data: unknown }) => void) | null = null;
  constructor() { FakeWorker.instances.push(this); }
  addEventListener(type: string, listener: (event: { data: unknown }) => void) { if (type === "message") this.listener = listener; }
  postMessage(message: unknown) {
    this.messages.push(message);
    if (message && typeof message === "object" && "action" in message && message.action === "init") this.reply({ type: "ready" });
  }
  reply(data: unknown) { this.listener?.({ data }); }
  terminate() { this.terminated = true; }
}
afterEach(() => { vi.unstubAllGlobals(); FakeWorker.instances = []; });
function setup() { vi.stubGlobal("Worker", FakeWorker); vi.stubGlobal("window", globalThis); }

describe("dataset-scoped browser runner", () => {
  it("sends only a registered dataset ID at initialization, before SQL", async () => {
    setup();
    const runner = new SqliteBrowserRunner("library");
    const result = runner.run("SELECT title FROM books;");
    await vi.waitFor(() => expect(FakeWorker.instances[0]?.messages).toHaveLength(2));
    const worker = FakeWorker.instances[0]!;
    expect(worker.messages[0]).toEqual({ action: "init", datasetId: "library" });
    expect(worker.messages[1]).toEqual({ requestId: 1, action: "run", query: "SELECT title FROM books;" });
    worker.reply({ type: "result", requestId: 1, rows: [{ title: "Dasar Basis Data" }], columns: ["title"] });
    expect(await result).toEqual({ type: "query", rows: [{ title: "Dasar Basis Data" }], columns: ["title"] });
    runner.dispose();
    expect(worker.terminated).toBe(true);
  });
  it("rejects a foreign-schema write before starting a Worker", async () => {
    setup();
    await expect(new SqliteBrowserRunner("library").run("DELETE FROM students WHERE student_id = 1;")).rejects.toThrow();
    expect(FakeWorker.instances).toHaveLength(0);
  });
  it("terminates the prior session and rejects pending operations on disposal", async () => {
    setup();
    const runner = new SqliteBrowserRunner("shop");
    const result = runner.run("SELECT name FROM products;");
    const rejection = expect(result).rejects.toThrow("direset");
    await vi.waitFor(() => expect(FakeWorker.instances[0]?.messages).toHaveLength(2));
    runner.dispose();
    await rejection;
    expect(FakeWorker.instances[0]!.terminated).toBe(true);
  });
});
