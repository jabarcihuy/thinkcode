import { localizeMetadata } from "@/i18n/metadata";
import { requireAccount } from "@/lib/auth/session";
import { DEFAULT_LEARNING_PATH_SLUG } from "@/features/learning/config";
import { getLearningOverview } from "@/features/learning/data/learning-repository";
import { ChatbotPageView } from "@/features/ai/components/chatbot-page-view";
const pageMetadata = { title: "Chatbot" };
export default async function ChatbotPage() {
 const account = await requireAccount();
 const overview = await getLearningOverview(DEFAULT_LEARNING_PATH_SLUG, account.userId);
 return <ChatbotPageView overview={overview} />;
}

export async function generateMetadata() { return localizeMetadata(pageMetadata); }
