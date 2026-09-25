export const DEFAULT_LEARNING_PATH_SLUG = "programming-logic-fundamentals";

export function learningPathHref(slug: string) {
  return `/learn/${slug}`;
}

export function lessonHref(pathSlug: string, lessonSlug: string) {
  return `/learn/${pathSlug}/lessons/${lessonSlug}`;
}
