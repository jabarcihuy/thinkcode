import { localizeMetadata } from "@/i18n/metadata";
import { requireAccount } from "@/lib/auth/session";
import { getLearningOverview } from "@/features/learning/data/learning-repository";
import { DEFAULT_LEARNING_PATH_SLUG } from "@/features/learning/config";
import { LabListView } from "@/features/learning/components/lab-list-view";
const pageMetadata = { title: "Lab Materi" };
export default async function LabPage() {
 const { userId } = await requireAccount();
 const overview = await getLearningOverview(DEFAULT_LEARNING_PATH_SLUG, userId);
 return <LabListView overview={overview} />;
}

export async function generateMetadata() { return localizeMetadata(pageMetadata); }
