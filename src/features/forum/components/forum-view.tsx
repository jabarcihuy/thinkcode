import Link from "next/link";
import { getText } from "@/i18n/server";
import { Button } from "@/components/ui/button";
import { ForumPostForm } from "./post-form";
import { ForumModeration } from "./moderation";
import type { ForumReply, ForumTopic, ForumViewer } from "../types";

async function Pagination({ base, page, hasNext }: { base: string; page: number; hasNext: boolean }) {
  const tx = await getText();
  if (page === 1 && !hasNext) return null;
  return <nav aria-label={tx("Halaman diskusi")} className="mt-7 flex items-center justify-between gap-3">
    {page > 1 ? <Button asChild variant="outline"><Link href={`${base}?page=${page - 1}`}>{tx("Sebelumnya")}</Link></Button> : <span />}
    <span className="text-sm text-muted-foreground">{tx("Halaman")} {page}</span>
    {hasNext ? <Button asChild variant="outline"><Link href={`${base}?page=${page + 1}`}>{tx("Berikutnya")}</Link></Button> : <span />}
  </nav>;
}
async function GuestNotice() {
  const tx = await getText();
  return <div className="mt-6 border-t border-border pt-5"><p className="text-sm leading-6 text-muted-foreground">{tx("Masuk dengan akun untuk membuat diskusi dan membalas.")}</p><Button asChild variant="outline" className="mt-3"><Link href="/login">{tx("Masuk")}</Link></Button></div>;
}
export async function ForumListView({ viewer, topics, page, hasNext }: { viewer: ForumViewer; topics: ForumTopic[]; page: number; hasNext: boolean }) {
  const tx = await getText(), base = viewer.guest ? "/guest/forum" : "/forum";
  return <main id="main-content" className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
    <h1 className="text-3xl font-semibold tracking-tight">{tx("Forum")}</h1>
    <p className="mt-3 text-base leading-7 text-muted-foreground">{tx("Tanya tentang basis data, bagikan cara berpikir, atau mulai obrolan umum.")}</p>
    {viewer.guest ? <GuestNotice /> : <details className="mt-6 border-y border-border py-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold text-primary focus-visible:outline-2 focus-visible:outline-ring">{tx("Buat diskusi")}</summary><div className="py-4"><ForumPostForm /></div></details>}
    {topics.length ? <ul className="mt-7 divide-y divide-border border-y border-border">{topics.map(topic => <li key={topic.id}><Link href={`${base}/${topic.id}`} className="block min-h-16 py-5 focus-visible:outline-2 focus-visible:outline-ring">
      <p className="text-xs font-medium text-muted-foreground">{tx(topic.category === "GENERAL" ? "Umum" : "Basis Data")}{topic.locked && ` · ${tx("Balasan ditutup")}`}{topic.hidden && ` · ${tx("Disembunyikan")}`}</p>
      <h2 className="mt-2 break-words text-lg font-semibold leading-7">{topic.title}</h2>
      <p className="mt-2 break-words text-sm text-muted-foreground">{topic.author} · {topic.createdAt.slice(0, 10)}</p>
    </Link></li>)}</ul> : <section className="mt-8 border-y border-border py-8"><h2 className="text-lg font-semibold">{tx("Belum ada diskusi")}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{tx("Mulai dari pertanyaan yang sedang kamu pikirkan. Sertakan contoh agar mudah dipahami.")}</p></section>}
    <Pagination base={base} page={page} hasNext={hasNext} />
  </main>;
}
export async function ForumThreadView({ viewer, topic, replies, page, hasNext }: { viewer: ForumViewer; topic: ForumTopic; replies: ForumReply[]; page: number; hasNext: boolean }) {
  const tx = await getText(), base = viewer.guest ? "/guest/forum" : "/forum";
  return <main id="main-content" className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
    <Link href={base} className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline">{tx("Kembali ke forum")}</Link>
    <article className="mt-4 border-b border-border pb-7">
      <p className="text-sm text-muted-foreground">{tx(topic.category === "GENERAL" ? "Umum" : "Basis Data")}{topic.hidden && ` · ${tx("Disembunyikan")}`}</p>
      <h1 className="mt-2 break-words text-2xl font-semibold leading-9 tracking-tight sm:text-3xl">{topic.title}</h1>
      <p className="mt-3 break-words text-sm text-muted-foreground">{topic.author} · {topic.createdAt.slice(0, 10)}</p>
      <p className="mt-6 whitespace-pre-wrap break-words text-base leading-7">{topic.body}</p>
      {viewer.role === "ADMIN" && <ForumModeration id={topic.id} hidden={topic.hidden} locked={topic.locked} />}
    </article>
    <section className="mt-7" aria-labelledby="forum-replies"><h2 id="forum-replies" className="text-lg font-semibold">{tx("Balasan")}</h2>
      {replies.length ? <ol className="mt-4 divide-y divide-border border-y border-border">{replies.map(reply => <li key={reply.id} className="py-5"><article><p className="break-words text-sm text-muted-foreground">{reply.author} · {reply.createdAt.slice(0, 10)}{reply.hidden && ` · ${tx("Disembunyikan")}`}</p><p className="mt-3 whitespace-pre-wrap break-words text-base leading-7">{reply.body}</p>{viewer.role === "ADMIN" && <ForumModeration id={reply.id} hidden={reply.hidden} reply />}</article></li>)}</ol> : <p className="mt-4 text-sm leading-6 text-muted-foreground">{tx("Belum ada balasan. Bagikan penjelasan atau pengalamanmu.")}</p>}
      <Pagination base={`${base}/${topic.id}`} page={page} hasNext={hasNext} />
    </section>
    {topic.locked || topic.hidden ? <p role="status" className="mt-7 rounded-md bg-secondary p-4 text-sm leading-6">{tx("Balasan untuk diskusi ini ditutup.")}</p> : viewer.guest ? <GuestNotice /> : <section className="mt-8 border-t border-border pt-6" aria-labelledby="forum-reply-form"><h2 id="forum-reply-form" className="mb-5 text-lg font-semibold">{tx("Tulis balasan")}</h2><ForumPostForm topicId={topic.id} /></section>}
  </main>;
}
