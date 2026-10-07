import { MaterialLabView } from "@/features/learning/components/material-lab-view";
import { notFound } from "next/navigation";
import { requireAccount } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { LearningHeader } from "@/features/learning/components/learning-header";
import { getAccessibleMaterial } from "@/features/learning/server/material-access";
import { getPublicExercises } from "@/features/practice/data/exercise-repository";

export default async function PracticePage({ params }: { params: Promise<{ pathSlug: string; lessonSlug: string }> }) {
  const account = await requireAccount();
  const { pathSlug, lessonSlug } = await params;
  const access = await getAccessibleMaterial(pathSlug, lessonSlug);
  if (!access) notFound();
  const { lesson, material, index, overview } = access;
  const supabase = await createClient();
  const { data: assessmentActive, error } = await supabase.rpc("current_user_has_active_assessment");
  if (error) throw error;
  const exercises = assessmentActive ? [] : (await getPublicExercises(lesson.id, account.userId)).filter((exercise) => exercise.isRequired);
  return <div className="mobile-page-content min-h-dvh lg:pb-0"><LearningHeader account={account} /><MaterialLabView overview={overview} index={index} exampleSql={material.exampleSql} exercises={exercises} userId={account.userId} assessmentActive={Boolean(assessmentActive)} /></div>;
}
