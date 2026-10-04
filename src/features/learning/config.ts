export const DEFAULT_LEARNING_PATH_SLUG = "database-fundamentals";

export function learningPathHref(slug: string) {
  return `/learn/${slug}`;
}

export function lessonHref(pathSlug: string, lessonSlug: string) {
  return `/learn/${pathSlug}/lessons/${lessonSlug}`;
}

export function lessonPracticeHref(pathSlug: string, lessonSlug: string) {
  return `${lessonHref(pathSlug, lessonSlug)}/practice`;
}

export function lessonPdfHref(pathSlug: string, lessonSlug: string) {
  return `${lessonHref(pathSlug, lessonSlug)}/pdf`;
}
