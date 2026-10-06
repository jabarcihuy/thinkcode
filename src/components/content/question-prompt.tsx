import ReactMarkdown from "react-markdown";

/** Prose, instructions and code, without executable HTML, images or embedded lessons. */
export function QuestionPrompt({ content }: { content: string }) {
  return <div className="mt-4 max-w-[72ch] text-base leading-7 text-foreground">
    <ReactMarkdown allowedElements={["p", "strong", "em", "code", "pre", "ul", "ol", "li", "h3", "h4", "br"]} unwrapDisallowed components={{
      p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
      h3: ({ children }) => <h3 className="mb-2 mt-6 text-base font-semibold">{children}</h3>,
      h4: ({ children }) => <h4 className="mb-2 mt-6 text-base font-semibold">{children}</h4>,
      ul: ({ children }) => <ul className="mb-4 list-disc space-y-2 pl-5">{children}</ul>,
      ol: ({ children }) => <ol className="mb-4 list-decimal space-y-2 pl-5">{children}</ol>,
      pre: ({ children }) => <pre className="mb-4 max-w-full overflow-x-auto rounded-md bg-code-surface p-4 font-mono text-sm leading-6 text-code-foreground">{children}</pre>,
      code: ({ children }) => <code className="break-words font-mono text-[0.9em]">{children}</code>,
    }}>{content}</ReactMarkdown>
  </div>;
}
