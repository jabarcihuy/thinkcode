import { getText } from "@/i18n/server";
export default async function Loading() { const tx = await getText(); return <main id="main-content" className="mx-auto max-w-3xl px-5 py-10"><h1 className="text-3xl font-semibold">{tx("Forum")}</h1><p role="status" className="mt-5 text-muted-foreground">{tx("Memuat diskusi…")}</p></main>; }
