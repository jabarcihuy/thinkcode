import type { Role } from "@/types/auth";

export function parseRole(value: unknown): Role | null {
  return value === "USER" || value === "ADMIN" ? value : null;
}

export function hasRole(role: Role, required: Role): boolean {
  return role === "ADMIN" || role === required;
}
