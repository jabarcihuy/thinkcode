import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { LogicLabPreview } from "@/features/landing/components/logic-lab-preview";
import { ProductSections } from "@/features/landing/components/product-sections";

export const metadata: Metadata = {
  title: "ThinkCode — Understand code, step by step",
  description: "Belajar logika pemrograman dengan prediksi output, visualisasi eksekusi, practice, dan feedback kontekstual.",
};

export default function HomePage() {
  return <div className="min-h-screen">
    <SiteHeader />
    <main className="mx-auto max-w-6xl px-5 sm:px-8">
      <section className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.86fr)] lg:gap-16 lg:py-24" aria-labelledby="hero-title">
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary">THINKCODE · INTERACTIVE PROGRAMMING LOGIC LAB</p>
          <h1 id="hero-title" className="mt-5 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Understand how code works, step by step.</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Pelajari logika di balik program. Prediksi hasilnya, jalankan JavaScript, lalu lihat bagaimana setiap langkah mengubah keadaan program.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg"><Link href="/register">Start learning<ArrowRight size={16} aria-hidden="true" /></Link></Button><Button asChild variant="outline" size="lg"><Link href="/learn/programming-logic-fundamentals">View learning path</Link></Button></div>
          <p className="mt-4 text-xs text-muted-foreground">Logic · Visualization · Reasoning · Practice</p>
        </div>
        <LogicLabPreview />
      </section>
      <HowItWorks />
      <ProductSections />
      <section className="mb-10 flex flex-col gap-5 border-t border-border py-10 sm:mb-14 sm:flex-row sm:items-center sm:justify-between sm:py-12" aria-labelledby="cta-title">
        <div><p className="text-sm font-semibold text-primary">Make your next step clear</p><h2 id="cta-title" className="mt-2 text-2xl font-bold tracking-tight">Start with one idea. Follow it through the code.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">A guided learning path helps you move from problem solving to core programming concepts.</p></div>
        <Button asChild size="lg"><Link href="/register">Begin the learning path<ArrowRight size={16} aria-hidden="true" /></Link></Button>
      </section>
    </main>
    <footer className="border-t border-border"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs text-muted-foreground sm:px-8"><span>ThinkCode · Interactive Programming Logic Lab</span><span>Learn to reason about every step.</span></div></footer>
  </div>;
}
