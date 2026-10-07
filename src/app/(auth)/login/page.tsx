import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return <><h1 className="text-3xl font-semibold tracking-tight">Masuk ke Quethink</h1><p className="mb-8 mt-3 text-muted-foreground">Lanjutkan perjalanan belajar Anda.</p><AuthForm mode="login" /><Link href="/guest/start" className="mt-5 flex min-h-11 items-center justify-center text-sm font-semibold text-primary underline">Coba sebagai tamu</Link></>;
}
