import { SqlabPageView } from "@/features/sqlab/components/sqlab-page-view";
import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SqlabWorkspace } from "@/features/sqlab/components/sqlab-workspace";
import { createClient } from "@/lib/supabase/server";
import { requireAccount } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "SQLab",
  description:
    "Buat skema, isi tabel, dan jalankan query di database lokal milikmu.",
};

export default async function PlaygroundPage() {
  const account = await requireAccount();
  const supabase = await createClient();
  const { data: assessmentActive, error } = await supabase.rpc(
    "current_user_has_active_assessment",
  );

  return <SqlabPageView>      {error ? (
        <p
          role="alert"
          className="mt-8 border-y border-destructive/50 py-5 text-sm leading-6 text-destructive"
        >
          Status assessment belum dapat diperiksa. Muat ulang halaman sebelum
          memakai playground.
        </p>
      ) : assessmentActive ? (
        <section
          className="mt-8 border-y border-border py-7"
          aria-labelledby="playground-locked-title"
        >
          <LockKeyhole
            size={20}
            className="text-muted-foreground"
            aria-hidden="true"
          />
          <h2
            id="playground-locked-title"
            className="mt-3 text-lg font-semibold"
          >
            SQLab dijeda
          </h2>
          <p className="mt-2 max-w-[65ch] text-sm leading-6 text-muted-foreground">
            Selesaikan assessment yang sedang berlangsung sebelum kembali
            berlatih dengan query.
          </p>
          <Button asChild className="mt-4">
            <Link href="/assessments">Kembali ke assessment</Link>
          </Button>
        </section>
      ) : (
        <SqlabWorkspace userId={account.userId} />
      )}</SqlabPageView>;
}
