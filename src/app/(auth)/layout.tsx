import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-screen flex-col px-5 py-8"><Link className="mx-auto w-full max-w-sm text-lg font-bold tracking-tight" href="/">Think<span className="text-primary">Code</span></Link><div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">{children}</div></main>;
}
