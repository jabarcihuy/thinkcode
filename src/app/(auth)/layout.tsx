import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main id="main-content" className="flex min-h-dvh flex-col px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-8 sm:pb-[calc(2rem+env(safe-area-inset-bottom))]">
    <div className="mx-auto w-full max-w-5xl"><Link className="inline-flex min-h-11 items-center text-xl font-semibold tracking-tight" href="/" aria-label="Quethink, beranda">Que<span className="text-primary">think</span></Link></div>
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center py-5 sm:py-8">{children}</div>
  </main>;
}
