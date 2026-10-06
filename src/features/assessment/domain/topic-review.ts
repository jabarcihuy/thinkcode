import { DEFAULT_LEARNING_PATH_SLUG, learningPathHref, lessonHref } from "@/features/learning/config";

const firstMaterial: Record<string, string> = {
  Relasi: "membaca-bentuk-data", Read: "memilih-sumber-dan-kolom", Write: "menambahkan-record-dengan-insert",
};
export function topicReviewHref(topic: string, diagnostic: boolean): string {
  const slug = firstMaterial[topic];
  // The diagnostic does not bypass sequential material access.
  return diagnostic || !slug ? learningPathHref(DEFAULT_LEARNING_PATH_SLUG) : lessonHref(DEFAULT_LEARNING_PATH_SLUG, slug);
}
