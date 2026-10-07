import Link from "next/link";
import { GuestNameForm } from "@/features/guest/components/name-form";
export default function GuestStartPage() {
  return (
    <main id="main-content" className="mx-auto max-w-md px-5 py-12">
      <p className="text-sm font-medium text-primary">Mode tamu</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Coba dulu, cukup nama.
      </h1>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Jelajahi materi, Lab, SQLab, AI, dan tes. Progres, jawaban, dan draf SQLab tersimpan di perangkat ini, bukan di cloud.
      </p>
      <GuestNameForm />
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Ingin progres lintas perangkat?{" "}
        <Link href="/register" className="inline-flex min-h-11 items-center font-semibold text-primary underline">
          Buat akun
        </Link>
      </p>
    </main>
  );
}
