import { getDataset } from "../data/datasets";
import type { DatasetId } from "../data/dataset-types";
import {
  inspectSqlStatement,
  SqlQueryValidationError,
  type SqliteRow,
} from "@/features/database/domain/sql-query";

const QUERY_TIMEOUT_MS = 1_800;
const STARTUP_TIMEOUT_MS = 15_000;

export type SqliteRunResult =
  | { type: "query"; rows: SqliteRow[]; columns: string[] }
  | { type: "mutation-preview"; previewId: string; action: "INSERT" | "UPDATE" | "DELETE"; table: string; affectedRows: number; beforeRows: SqliteRow[]; afterRows: SqliteRow[] }
  | { type: "mutation-result"; action: "INSERT" | "UPDATE" | "DELETE"; table: string; affectedRows: number; beforeRows: SqliteRow[]; afterRows: SqliteRow[]; tableRows: SqliteRow[] }
  | { type: "mutation-cancelled" };

type WorkerResponse =
  | { type: "ready" }
  | { type: "result"; requestId: number; rows: SqliteRow[]; columns: string[] }
  | { type: "mutation-preview"; requestId: number; previewId: string; action: "INSERT" | "UPDATE" | "DELETE"; table: string; affectedRows: number; beforeRows: SqliteRow[]; afterRows: SqliteRow[] }
  | { type: "mutation-result"; requestId: number; action: "INSERT" | "UPDATE" | "DELETE"; table: string; affectedRows: number; beforeRows: SqliteRow[]; afterRows: SqliteRow[]; tableRows: SqliteRow[] }
  | { type: "mutation-cancelled"; requestId: number }
  | { type: "query-error"; requestId: number; message: string }
  | { type: "startup-error" };

export class SqliteRunnerError extends Error {
  constructor(message: string, readonly code: "timeout" | "startup" | "query") {
    super(message);
    this.name = "SqliteRunnerError";
  }
}

type WorkerRequest =
  | { action: "run"; query: string }
  | { action: "confirm"; previewId: string }
  | { action: "cancel"; previewId: string };

type PendingRun = {
  requestId: number;
  resolve: (value: SqliteRunResult) => void;
  reject: (error: Error) => void;
  timer: number;
};

export class SqliteBrowserRunner {
  private worker: Worker | null = null;
  private readyPromise: Promise<void> | null = null;
  private resolveReady: (() => void) | null = null;
  private rejectReady: ((error: Error) => void) | null = null;
  private startupTimer: number | null = null;
  private pendingRun: PendingRun | null = null;
  private nextRequestId = 1;

  constructor(private readonly datasetId: DatasetId = "campus") { getDataset(datasetId); }

  async run(query: string): Promise<SqliteRunResult> {
    inspectSqlStatement(query, getDataset(this.datasetId));
    return this.send({ action: "run", query });
  }

  confirmMutation(previewId: string): Promise<SqliteRunResult> {
    return this.send({ action: "confirm", previewId });
  }

  cancelMutation(previewId: string): Promise<SqliteRunResult> {
    return this.send({ action: "cancel", previewId });
  }

  dispose() {
    this.resetWorker(new SqliteRunnerError("Sesi database latihan direset.", "startup"));
  }

  private async send(request: WorkerRequest): Promise<SqliteRunResult> {
    await this.ensureWorker();
    const worker = this.worker;
    if (!worker) throw new SqliteRunnerError("Mesin SQLite perlu dimuat ulang.", "startup");
    if (this.pendingRun) throw new SqliteRunnerError("Tunggu operasi database selesai.", "query");

    return new Promise((resolve, reject) => {
      const requestId = this.nextRequestId++;
      const timer = window.setTimeout(() => {
        this.resetWorker(new SqliteRunnerError(
          "Query dihentikan karena melewati batas waktu. Reset data latihan dan coba lagi.",
          "timeout",
        ));
      }, QUERY_TIMEOUT_MS);
      this.pendingRun = { requestId, resolve, reject, timer };
      worker.postMessage({ requestId, ...request });
    });
  }

  private ensureWorker(): Promise<void> {
    if (this.readyPromise) return this.readyPromise;
    const worker = new Worker(new URL("./sqlite-query.worker.ts", import.meta.url), {
      type: "module",
      name: "quethink-sqlite-playground",
    });
    this.worker = worker;

    this.readyPromise = new Promise<void>((resolve, reject) => {
      this.resolveReady = resolve;
      this.rejectReady = reject;
      this.startupTimer = window.setTimeout(() => {
        this.resetWorker(new SqliteRunnerError("Mesin SQLite gagal dimuat. Coba muat ulang halaman.", "startup"));
      }, STARTUP_TIMEOUT_MS);
      worker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => this.onWorkerMessage(event.data));
      worker.addEventListener("error", () => {
        this.resetWorker(new SqliteRunnerError("Mesin SQLite mengalami gangguan. Coba reset data latihan.", "startup"));
      });
    });
    worker.postMessage({ action: "init", datasetId: this.datasetId });
    return this.readyPromise;
  }

  private onWorkerMessage(message: WorkerResponse) {
    if (message.type === "ready") {
      if (this.startupTimer !== null) window.clearTimeout(this.startupTimer);
      this.startupTimer = null;
      this.resolveReady?.();
      this.resolveReady = null;
      this.rejectReady = null;
      return;
    }
    if (message.type === "startup-error") {
      this.resetWorker(new SqliteRunnerError("Mesin SQLite gagal dimuat. Coba muat ulang halaman.", "startup"));
      return;
    }
    const pending = this.pendingRun;
    if (!pending || pending.requestId !== message.requestId) return;
    window.clearTimeout(pending.timer);
    this.pendingRun = null;
    if (message.type === "query-error") {
      pending.reject(new SqliteRunnerError(message.message, "query"));
      return;
    }
    if (message.type === "result") {
      pending.resolve({ type: "query", rows: message.rows, columns: message.columns });
      return;
    }
    if (message.type === "mutation-preview") {
      const { previewId, action, table, affectedRows, beforeRows, afterRows } = message;
      pending.resolve({ type: "mutation-preview", previewId, action, table, affectedRows, beforeRows, afterRows });
      return;
    }
    if (message.type === "mutation-result") {
      const { action, table, affectedRows, beforeRows, afterRows, tableRows } = message;
      pending.resolve({ type: "mutation-result", action, table, affectedRows, beforeRows, afterRows, tableRows });
      return;
    }
    pending.resolve({ type: "mutation-cancelled" });
  }

  private resetWorker(error: Error) {
    if (this.startupTimer !== null) window.clearTimeout(this.startupTimer);
    this.startupTimer = null;
    this.worker?.terminate();
    this.worker = null;
    this.readyPromise = null;
    const readyReject = this.rejectReady;
    this.resolveReady = null;
    this.rejectReady = null;
    readyReject?.(error);
    if (this.pendingRun) {
      window.clearTimeout(this.pendingRun.timer);
      const pending = this.pendingRun;
      this.pendingRun = null;
      pending.reject(error);
    }
  }
}

export { SqlQueryValidationError };
