
import { useText } from "@/i18n/use-text";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DEFAULT_LEARNING_PATH_SLUG } from "@/features/learning/config";

export default function LearningNotFound() {
  const tx = useText();

  return <main id="main-content" className="mx-auto max-w-4xl px-5 py-16"><h1 className="text-2xl font-semibold">{tx("Lesson belum tersedia")}</h1><p className="mt-3 text-muted-foreground">{tx("Lesson ini mungkin terkunci, belum dipublikasikan, atau tautannya tidak ditemukan.")}</p><Button asChild className="mt-6"><Link href={`/learn/${DEFAULT_LEARNING_PATH_SLUG}`}>{tx("Lihat jalur belajar")}</Link></Button></main>;
}
