import { ForumPage } from "@/features/forum/components/forum-page";
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <ForumPage page={(await searchParams).page} />;
}
