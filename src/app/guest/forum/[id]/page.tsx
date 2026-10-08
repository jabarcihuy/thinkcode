import { ForumPage } from "@/features/forum/components/forum-page";
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string }> }) {
  return <ForumPage guest id={(await params).id} page={(await searchParams).page} />;
}
