import { z } from "zod";
// The SQLite authorizer is the security boundary; this only enforces a single statement.
export const querySchema = z
  .string()
  .trim()
  .min(1)
  .max(4096)
  .superRefine((sql, ctx) => {
    let quote = "";
    let ended = false;
    for (let i = 0; i < sql.length; i++) {
      const c = sql[i]!;
      if (quote) {
        if (c === quote) {
          if (sql[i + 1] === quote) i++;
          else quote = "";
        }
        continue;
      }
      if (c === "'" || c === '"' || c === "`") {
        if (ended) {
          ctx.addIssue({
            code: "custom",
            message: "Jalankan satu query setiap kali.",
          });
          return;
        }
        quote = c;
        continue;
      }
      if (
        c === "[" ||
        (c === "-" && sql[i + 1] === "-") ||
        (c === "/" && sql[i + 1] === "*")
      ) {
        ctx.addIssue({
          code: "custom",
          message:
            "Hapus komentar atau gunakan nama kolom dengan tanda kutip ganda.",
        });
        return;
      }
      if (c === ";") {
        if (ended) {
          ctx.addIssue({
            code: "custom",
            message: "Jalankan satu query setiap kali.",
          });
          return;
        }
        ended = true;
      } else if (ended && !/\s/.test(c)) {
        ctx.addIssue({
          code: "custom",
          message: "Jalankan satu query setiap kali.",
        });
        return;
      }
    }
    if (quote || !/^(SELECT|INSERT|UPDATE|DELETE)\b/i.test(sql))
      ctx.addIssue({
        code: "custom",
        message:
          "Gunakan SELECT, INSERT, UPDATE, atau DELETE. Susun struktur melalui tab Skema.",
      });
  });
