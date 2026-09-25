import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return <><h1 className="text-3xl font-bold tracking-tight">Masuk ke ThinkCode</h1><p className="mb-8 mt-3 text-muted-foreground">Lanjutkan perjalanan belajar Anda.</p><AuthForm mode="login" /></>;
}
