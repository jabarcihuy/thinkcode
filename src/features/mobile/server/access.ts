import "server-only";
import { z } from "zod";
import { loadLearningOverviewWithClient } from "@/features/learning/data/learning-repository";
import { DEFAULT_LEARNING_PATH_SLUG } from "@/features/learning/config";
import { MobileError, type MobileActor } from "./auth";
export const mobileOverview = (actor: MobileActor) => loadLearningOverviewWithClient(actor.db, DEFAULT_LEARNING_PATH_SLUG, actor.userId);
export async function activeMobileAssessment(actor: MobileActor) {
  const result = await actor.db.rpc("current_user_has_active_assessment");
  if (result.error) throw new MobileError(503, "unavailable", "Challenge status could not be checked. Try again.");
  return result.data === true;
}
export async function requireMobileMaterial(actor: MobileActor, id: string, practice = false) {
  if (!z.uuid().safeParse(id).success) throw new MobileError(404, "not_found", "Material not found.");
  const [overview, active] = await Promise.all([mobileOverview(actor), activeMobileAssessment(actor)]);
  const lesson = overview?.lessons.find(item => item.id === id);
  if (!lesson) throw new MobileError(404, "not_found", "Material not found.");
  if (lesson.state === "LOCKED") throw new MobileError(403, "locked", "Complete the previous material and core Lab first.");
  if (practice && active) throw new MobileError(403, "assessment_active", "Labs are paused during your active challenge. Finish it on the website first.");
  if (practice && !lesson.readAt) throw new MobileError(403, "reading_required", "Finish reading this material before opening the Lab.");
  return { overview: overview!, lesson, active };
}
