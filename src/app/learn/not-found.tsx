import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DEFAULT_LEARNING_PATH_SLUG } from "@/features/learning/config";

export default function LearningNotFound() {
  return <main className="mx-auto max-w-4xl px-5 py-16"><h1 className="text-2xl font-bold">Lesson belum tersedia</h1><p className="mt-3 text-muted-foreground">Lesson ini mungkin terkunci, belum dipublikasikan, atau tautannya tidak ditemukan.</p><Button asChild className="mt-6"><Link href={`/learn/${DEFAULT_LEARNING_PATH_SLUG}`}>Lihat jalur belajar</Link></Button></main>;
}
