import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

export const registerSchema = loginSchema.extend({
  password: z.string().min(8, "Password minimal 8 karakter."),
});
