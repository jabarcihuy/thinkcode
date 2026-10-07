import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Daftar" };

export default function RegisterPage() {
  return <div className="mx-auto w-full max-w-sm"><h1 className="text-3xl font-semibold tracking-tight">Buat akun</h1><p className="mb-8 mt-3 text-muted-foreground">Mulai belajar basis data dan SQL dengan Quethink.</p><AuthForm mode="register" /></div>;
}
