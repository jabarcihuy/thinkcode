import { localizeMetadata } from "@/i18n/metadata";

import { useText } from "@/i18n/use-text";
import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { LoginIntroduction } from "@/components/auth/login-introduction";
import { Button } from "@/components/ui/button";

const pageMetadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  const tx = useText();

  return <div className="grid min-w-0 gap-7 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-center lg:gap-20">
    <LoginIntroduction />
    <section aria-labelledby="login-form-title" className="min-w-0 lg:rounded-lg lg:bg-white lg:p-8">
      <h2 id="login-form-title" className="mb-5 text-xl font-semibold tracking-tight">{tx("Masuk untuk melanjutkan")}</h2>
      <AuthForm mode="login" />
      <Button asChild variant="outline" className="mt-3 min-h-12 w-full"><Link href="/guest/start">{tx("Coba sebagai tamu")}</Link></Button>
    </section>
  </div>;
}

export async function generateMetadata() { return localizeMetadata(pageMetadata); }
