import { localizeMetadata } from "@/i18n/metadata";
import { CourseTestPage } from "@/features/assessment/components/course-test-page";
const pageMetadata = { title: "Tes Awal" };
export default function PreTestPage() { return <CourseTestPage diagnostic />; }

export async function generateMetadata() { return localizeMetadata(pageMetadata); }
