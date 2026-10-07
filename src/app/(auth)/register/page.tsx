import { localizeMetadata } from "@/i18n/metadata";

import { useText } from "@/i18n/use-text";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

const pageMetadata: Metadata = { title: "Daftar" };

export default function RegisterPage() {
  const tx = useText();

  return <div className="mx-auto w-full max-w-sm"><h1 className="text-3xl font-semibold tracking-tight">{tx("Buat akun")}</h1><p className="mb-8 mt-3 text-muted-foreground">{tx("Mulai belajar basis data dan SQL dengan Quethink.")}</p><AuthForm mode="register" /></div>;
}

export async function generateMetadata() { return localizeMetadata(pageMetadata); }
