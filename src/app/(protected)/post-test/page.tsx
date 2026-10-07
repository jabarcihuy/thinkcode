import { localizeMetadata } from "@/i18n/metadata";
import { CourseTestPage } from "@/features/assessment/components/course-test-page";
const pageMetadata = { title: "Tes Akhir" };
export default function PostTestPage() { return <CourseTestPage diagnostic={false} />; }

export async function generateMetadata() { return localizeMetadata(pageMetadata); }
