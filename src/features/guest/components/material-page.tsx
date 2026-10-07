"use client";
import { useText } from "@/i18n/use-text";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGuestLearning } from "./guest-mode";
import { MaterialReadingView } from "@/features/learning/components/material-reading-view";
import { MaterialLabView } from "@/features/learning/components/material-lab-view";
import type { PublicExercise } from "@/features/practice/types";
export function GuestMaterialPageView({ lessonId, content, exampleSql, exercises, userId, lab = false }: { lessonId: string; content: string; exampleSql: string | null; exercises: PublicExercise[]; userId: string; lab?: boolean }) {
  const tx = useText();

 const local = useGuestLearning();
 const overview = local?.overview;
 const index = overview?.lessons.findIndex((lesson) => lesson.id === lessonId) ?? -1;
 if (local?.status === "loading") return <main id="main-content" className="mx-auto max-w-3xl px-5 py-8"><p role="status">{tx("Menyiapkan materi…")}</p></main>;
 if (!overview || index < 0) return <main id="main-content" className="px-5 py-8">{tx("Materi tidak tersedia.")}</main>;
 const lesson = overview.lessons[index]!;
 if (lesson.state === "LOCKED") return <main id="main-content" className="mx-auto max-w-3xl px-5 py-8"><h1 className="text-2xl font-semibold">{tx("Materi belum terbuka")}</h1><p className="mt-3 text-muted-foreground">{tx(overview.baselineComplete ? "Tuntaskan bacaan dan latihan inti sebelumnya untuk melanjutkan." : "Selesaikan tes awal untuk memulai belajar.")}</p><Button asChild className="mt-5"><Link href={overview.baselineComplete ? "/guest?view=materials" : "/guest?view=tests"}>{tx(overview.baselineComplete ? "Buka materi" : "Mulai tes awal")}</Link></Button></main>;
 if (lab) return <MaterialLabView overview={overview} index={index} exampleSql={exampleSql} exercises={exercises.map((exercise) => ({ ...exercise, passed: Boolean(local?.value.passedExercises.includes(exercise.id)) }))} userId={userId} guest />;
 return <MaterialReadingView overview={overview} index={index} content={content} authenticated guest />;
}
