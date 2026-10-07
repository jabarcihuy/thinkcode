import type { LearningOverview } from "../types";
import { lessonHref, lessonPracticeHref } from "../config";

export function nextLearningAction(overview: LearningOverview, activeSessionId: string | null, postPassed: boolean) {
  if (activeSessionId) return { href: `/assessments/sessions/${activeSessionId}`, title: "Lanjutkan tes", label: "Lanjutkan tes", description: "Selesaikan sesi yang masih aktif. Status penyimpanan jawaban dapat dilihat di halaman tes." };
  if (!overview.baselineComplete) return { href: "/pre-test", title: "Kenali titik awalmu", label: "Mulai tes awal", description: "Sepuluh pertanyaan singkat, tanpa syarat lulus. Setelahnya, mulai materi pertama." };
  const lesson = overview.metrics.currentLesson;
  if (lesson) {
    const index = overview.lessons.findIndex((entry) => entry.id === lesson.id) + 1;
    const lab = Boolean(lesson.readAt);
    return { href: lab ? `${lessonPracticeHref(overview.path.slug, lesson.slug)}#lesson-practice` : lessonHref(overview.path.slug, lesson.slug), title: lab ? "Saatnya mencoba di Lab" : "Lanjutkan belajar", label: lab ? "Buka latihan inti" : "Baca materi", description: `Materi ${index} · ${lesson.title}` };
  }
  return { href: "/post-test", title: postPassed ? "Jalur belajarmu tuntas" : "Siap menguji pemahaman", label: postPassed ? "Lihat hasil" : "Mulai tes akhir", description: postPassed ? "Semua materi tuntas dan tes akhir lulus. Kamu tetap bisa mengulang Lab." : "Semua materi dan latihan inti tuntas. Kerjakan tes akhir mandiri untuk menyelesaikan jalur ini." };
}
