import { redirect } from "next/navigation";
import { DEFAULT_LEARNING_PATH_SLUG, learningPathHref } from "@/features/learning/config";
/** Retired diagnostic bookmark: start with the learning materials. */
export default function PreTestPage() { redirect(learningPathHref(DEFAULT_LEARNING_PATH_SLUG)); }
