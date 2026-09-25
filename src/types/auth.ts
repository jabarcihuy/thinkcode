export const roles = ["USER", "ADMIN"] as const;
export type Role = (typeof roles)[number];

export interface Profile {
  id: string;
  role: Role;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}
