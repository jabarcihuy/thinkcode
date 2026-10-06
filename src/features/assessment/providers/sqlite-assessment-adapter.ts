import type { SqlAssessmentKey } from "../server/sql-assessment-key";
import "server-only";
import { Worker } from "node:worker_threads";
import { join } from "node:path";
import { z } from "zod";
import { getDataset } from "@/features/database/data/datasets";
import { datasetSchemaSql, datasetSeedOrder } from "@/features/database/browser/sqlite-seed";
import type { SqlAssessmentRunner, SqlAssessmentResult } from "../domain/sql-assessment-runner";
import { validateAssessmentQuery, type SqlAssessmentConfig } from "../validation/sql-assessment";

const replySchema = z.union([
  z.object({ type: z.literal("result"), passed: z.array(z.boolean()).min(2).max(4) }).strict(),
  z.object({ type: z.literal("configuration-error") }).strict(),
]);
export class SqliteAssessmentAdapter implements SqlAssessmentRunner {
  async grade(query: string, config: SqlAssessmentConfig, key: SqlAssessmentKey): Promise<SqlAssessmentResult> {
    const dataset = getDataset(config.datasetId);
    validateAssessmentQuery(key.referenceQuery, config);
    // Private fixture values never pass through a public API or a client component.
    for (const fixture of key.fixtures) {
      for (const [name, rows] of Object.entries(fixture.rows)) {
        const table = dataset.tables.find((table) => table.name === name);
        if (!table || rows.some((row) => Object.keys(row).length !== table.columns.length || table.columns.some((column) => !(column.name in row)))) {
          throw new Error("Assessment fixture configuration is invalid.");
        }
      }
    }
    let valid = true;
    try { validateAssessmentQuery(query, config); } catch { valid = false; }
    const passed = valid ? await this.execute(query, config, key) : key.fixtures.map(() => false);
    return {
      passedTests: passed.filter(Boolean).length, totalTests: passed.length,
      hiddenTotal: key.fixtures.filter((fixture) => fixture.isHidden).length,
      hiddenPassed: key.fixtures.filter((fixture, index) => fixture.isHidden && passed[index]).length,
      visibleTests: key.fixtures.flatMap((fixture, index) => fixture.isHidden ? [] : [{ position: index + 1, passed: passed[index]! }]),
    };
  }
  private execute(query: string, config: SqlAssessmentConfig, key: SqlAssessmentKey): Promise<boolean[]> {
    return new Promise((resolve, reject) => {
      const dataset = getDataset(config.datasetId);
      // Trace this static asset in next.config.ts; do not bundle a browser Worker on the server.
      const worker = new Worker(join(process.cwd(), "src/features/assessment/providers/sqlite-assessment.worker.mjs"), {
        workerData: { query, config, key, schema: datasetSchemaSql(dataset), tables: datasetSeedOrder(dataset) },
        env: {}, execArgv: [], resourceLimits: { maxOldGenerationSizeMb: 32, maxYoungGenerationSizeMb: 8, stackSizeMb: 2 },
        stdout: true, stderr: true,
      });
      // Discard SQLite diagnostics: they may include private fixture/query details.
      worker.stdout?.resume(); worker.stderr?.resume();
      let settled = false;
      const finish = (values?: boolean[]) => {
        if (settled) return;
        settled = true; clearTimeout(timer);
        void worker.terminate();
        if (values) resolve(values); else reject(new Error("Assessment SQL runtime unavailable."));
      };
      const timer = setTimeout(() => finish(), 5_000);
      worker.once("message", (message: unknown) => {
        const parsed = replySchema.safeParse(message);
        if (!parsed.success || parsed.data.type !== "result" || parsed.data.passed.length !== key.fixtures.length) finish();
        else finish(parsed.data.passed);
      });
      worker.once("error", () => finish());
      worker.once("exit", () => finish());
    });
  }
}
