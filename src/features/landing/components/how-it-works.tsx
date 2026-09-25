const steps = [
  { label: "Predict", detail: "Reason about the result before running code." },
  { label: "Run", detail: "Try a small JavaScript example in the browser." },
  { label: "Visualize", detail: "Follow variables, branches, and loop steps." },
  { label: "Practice", detail: "Check your understanding and try again." },
];

export function HowItWorks() {
  return <section className="border-y border-border py-10 sm:py-12" aria-labelledby="how-title">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-primary">A clear learning loop</p><h2 id="how-title" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Think first. See what the code does.</h2></div><p className="max-w-md text-sm leading-6 text-muted-foreground">Move from a problem to a prediction, then use the execution trace to understand each change.</p></div>
    <ol className="mt-8 grid gap-0 sm:grid-cols-2 xl:grid-cols-4">{steps.map((step, index) => <li key={step.label} className="relative border-t border-border py-4 pr-5 sm:mt-0 sm:border-t-0 sm:pt-0"><span className="font-mono text-xs text-muted-foreground">0{index + 1}</span><h3 className="mt-2 text-lg font-semibold">{step.label}</h3><p className="mt-1 max-w-56 text-sm leading-6 text-muted-foreground">{step.detail}</p></li>)}</ol>
  </section>;
}
