import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  return <><h1 className="text-3xl font-bold tracking-tight">Masuk ke ThinkCode</h1><p className="mb-8 mt-3 text-muted-foreground">Lanjutkan perjalanan belajar Anda.</p>{message === "confirmation-failed" && <p role="alert" className="mb-5 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">Konfirmasi email gagal atau tautan sudah kedaluwarsa. Coba daftar ulang atau hubungi pengelola.</p>}<AuthForm mode="login" /></>;
}
