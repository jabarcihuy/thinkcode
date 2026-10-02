import { z } from "zod";

export const displayNameSchema = z.string()
  .trim()
  .max(60, "Nama tampilan maksimal 60 karakter.")
  .transform((value) => value || null);
