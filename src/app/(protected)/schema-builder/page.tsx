import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAccount } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { SchemaBuilder } from "@/features/schema-builder/components/schema-builder";

export const metadata: Metadata = { title: "Pembuat Skema" };

export default async function SchemaBuilderPage() {
  await requireAccount();
  const supabase = await createClient();
  const { data: active, error } = await supabase.rpc("current_user_has_active_assessment");
  return <main id="main-content" className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-12">
    <header className="max-w-[65ch]"><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Pembuat Skema</h1><p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">Susun tabel dan hubungan dari sebuah kasus.</p></header>
    {error ? <p role="alert" className="mt-8 text-sm leading-6 text-destructive">Status assessment belum dapat diperiksa. Muat ulang halaman sebelum berlatih.</p> : active ? <section className="mt-8 border-y border-border py-6"><h2 className="text-lg font-semibold">Latihan skema dijeda</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Selesaikan assessment yang sedang berlangsung untuk kembali menyusun skema.</p><Button asChild className="mt-4"><Link href="/assessments">Kembali ke assessment</Link></Button></section> : <SchemaBuilder />}
  </main>;
}
