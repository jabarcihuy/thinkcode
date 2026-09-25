import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const chapters = ["Computational thinking", "Algorithms & flowcharts", "Programming basics", "Variables & data types", "Operators", "Conditional logic", "Loops", "Functions", "Arrays", "Problem solving"];

export function ProductSections() {
  return <>
    <section className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16" aria-labelledby="path-title">
      <div><p className="text-sm font-semibold text-primary">Logic-first curriculum</p><h2 id="path-title" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Build the reasoning behind the syntax.</h2><p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">Start with computational thinking. Work through algorithms and core programming logic using JavaScript as a practical medium.</p><Button asChild variant="outline" className="mt-6"><Link href="/learn/programming-logic-fundamentals">Explore the learning path<ArrowRight size={15} aria-hidden="true" /></Link></Button></div>
      <ol className="grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">{chapters.map((chapter, index) => <li key={chapter} className="flex items-center gap-4 py-3 sm:border-b sm:border-border"><span className="font-mono text-xs tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span><span className="text-sm font-medium">{chapter}</span></li>)}</ol>
    </section>
    <section className="grid gap-8 border-t border-border py-12 sm:py-16 md:grid-cols-3 md:gap-0" aria-label="Learning support">
      <div className="md:border-r md:border-border md:pr-8"><h2 className="text-lg font-semibold">A tutor that follows your work</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Ask for a hint about the active lesson, your code, output, or execution trace.</p></div>
      <div className="md:border-r md:border-border md:px-8"><h2 className="text-lg font-semibold">Practice with useful feedback</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Retry exercises and build confidence before each checkpoint.</p></div>
      <div className="md:pl-8"><h2 className="text-lg font-semibold">Assessment with a clear boundary</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Show what you understand without hints. Scores are checked on the server.</p></div>
    </section>
  </>;
}
