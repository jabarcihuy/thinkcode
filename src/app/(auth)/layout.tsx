import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main id="main-content" className="flex min-h-dvh flex-col px-5 py-8"><Link className="mx-auto inline-flex min-h-11 w-full max-w-sm items-center text-lg font-semibold tracking-tight" href="/">Que<span className="text-accent">think</span></Link><div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">{children}</div></main>;
}
