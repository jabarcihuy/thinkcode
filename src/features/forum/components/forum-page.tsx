import Link from "next/link";
import { notFound } from "next/navigation";
import { getText } from "@/i18n/server";
import { forumViewer, ForumError } from "../server/access";
import { forumTopics, forumThread } from "../server/repository";
import { forumPage, topicId } from "../validation/input";
import { ForumListView, ForumThreadView } from "./forum-view";
export async function ForumPage({ id, page, guest = false }: { id?: string; page?: string; guest?: boolean }) {
  const tx = await getText();
  if (id && !topicId.safeParse(id).success) notFound();
  let viewer;
  try { viewer = await forumViewer(guest); }
  catch (error) {
    if (!(error instanceof ForumError) && !(error instanceof Error && "status" in error)) throw error;
    return <main id="main-content" className="mx-auto max-w-3xl px-5 py-10"><h1 className="text-2xl font-semibold">{tx("Forum dijeda")}</h1><p role="status" className="mt-4 leading-7 text-muted-foreground">{tx(error.message)}</p><Link className="mt-5 inline-flex min-h-11 items-center font-medium text-primary" href={guest ? "/guest?view=post-test" : "/post-test"}>{tx("Kembali ke tantangan")}</Link></main>;
  }
  const currentPage = forumPage(page);
  if (id) {
    const thread = await forumThread(viewer, id, currentPage);
    if (!thread) notFound();
    return <ForumThreadView viewer={viewer} {...thread} page={currentPage} />;
  }
  const topics = await forumTopics(viewer, currentPage);
  return <ForumListView viewer={viewer} topics={topics.items} hasNext={topics.hasNext} page={currentPage} />;
}
