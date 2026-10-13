import { z } from "zod";
import { isCloudPhoto, isLocalPhoto } from "./photo";

export const avatars = ["initials", "cat", "bot", "sprout", "rocket", "graduate"] as const;
export const avatarColors = ["indigo", "apricot", "teal", "rose"] as const;
export const appearanceSchema = z.object({
  avatar: z.enum(avatars),
  color: z.enum(avatarColors),
  bio: z.string().trim().max(160),
  photo: z.string().max(180_000).refine(value => isCloudPhoto(value) || isLocalPhoto(value)).nullable().optional(),
});
export type ProfileAppearance = z.infer<typeof appearanceSchema>;
export const defaultAppearance: ProfileAppearance = { avatar: "initials", color: "indigo", bio: "" };
/** Cosmetic data only. Never use user-editable metadata for authorization. */
export function readAppearance(value: unknown): ProfileAppearance {
  const parsed = appearanceSchema.safeParse(value).data ?? { ...defaultAppearance };
  return parsed.photo?.startsWith("data:") ? { ...parsed, photo: null } : parsed;
}
