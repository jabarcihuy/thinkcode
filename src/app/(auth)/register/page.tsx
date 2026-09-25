import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Daftar" };

export default function RegisterPage() {
  return <><h1 className="text-3xl font-bold tracking-tight">Buat akun</h1><p className="mb-8 mt-3 text-muted-foreground">Mulai belajar logika pemrograman dengan ThinkCode.</p><AuthForm mode="register" /></>;
}
