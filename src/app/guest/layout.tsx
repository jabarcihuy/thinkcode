import Link from "next/link";
import { Suspense } from "react";
import { getGuest } from "@/features/guest/server/session";
import { GuestModeProvider } from "@/features/guest/components/guest-mode";
import { GuestNavigation } from "@/features/guest/components/navigation";
export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const guest = await getGuest();
  return (
    <GuestModeProvider>
      <div className="mobile-page-content min-h-dvh lg:pb-0">
        <header className="border-b border-border bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-8">
            <Link
              href={guest ? "/guest" : "/"}
              className="min-h-11 content-center font-semibold"
            >
              Que<span className="text-primary">think</span>
            </Link>
            {guest ? (
              <Suspense>
                <GuestNavigation />
              </Suspense>
            ) : (
              <Link href="/login" className="inline-flex min-h-11 items-center text-sm font-medium">
                Masuk akun
              </Link>
            )}
          </div>
        </header>
        {children}
      </div>
    </GuestModeProvider>
  );
}
