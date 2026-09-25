export function LogicLabPreview() {
  return <div aria-label="Contoh JavaScript dan execution trace" className="overflow-hidden rounded-xl border border-border bg-code-surface text-code-foreground shadow-sm">
    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs text-code-foreground/70"><span>main.js</span><span>JavaScript · browser</span></div>
    <pre className="overflow-x-auto p-5 font-mono text-sm leading-7"><code><span className="text-[#95c9b5]">let</span> score = <span className="text-[#e6c58b]">80</span>;{"\n"}<span className="text-[#95c9b5]">if</span> (score &gt;= <span className="text-[#e6c58b]">75</span>) {'{'}{"\n"}  console.log(<span className="text-[#d4b5da]">&quot;Pass&quot;</span>);{"\n"}{'}'}</code></pre>
    <div className="grid gap-4 border-t border-white/10 px-5 py-4 sm:grid-cols-2"><div><p className="text-[11px] font-semibold uppercase tracking-wider text-code-foreground/55">Current step</p><p className="mt-1 text-sm">score &gt;= 75 → true</p></div><div><p className="text-[11px] font-semibold uppercase tracking-wider text-code-foreground/55">Output</p><p className="mt-1 font-mono text-sm">Pass</p></div></div>
    <div className="border-t border-white/10 px-5 py-3 text-xs text-code-foreground/70">See the condition, value, and output change as the program runs.</div>
  </div>;
}
