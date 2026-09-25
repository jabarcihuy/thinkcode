import ReactMarkdown from "react-markdown";

export function LessonContent({ content }: { content: string }) {
  return <div className="max-w-[72ch] text-base leading-8 text-foreground">
    <ReactMarkdown components={{
      h2: ({ children }) => <h2 className="mb-4 mt-10 text-2xl font-bold tracking-tight first:mt-0">{children}</h2>,
      h3: ({ children }) => <h3 className="mb-3 mt-8 text-xl font-semibold">{children}</h3>,
      p: ({ children }) => <p className="mb-5">{children}</p>,
      ul: ({ children }) => <ul className="mb-5 list-disc space-y-2 pl-6">{children}</ul>,
      ol: ({ children }) => <ol className="mb-5 list-decimal space-y-2 pl-6">{children}</ol>,
      li: ({ children }) => <li>{children}</li>,
      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
      pre: ({ children }) => <pre className="mb-6 overflow-x-auto rounded-xl bg-code-surface p-5 font-mono text-sm leading-6 text-code-foreground">{children}</pre>,
      code: ({ children, className }) => className
        ? <code className={className}>{children}</code>
        : <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>,
      a: ({ children, href }) => <a className="font-medium text-primary underline underline-offset-4" href={href}>{children}</a>,
    }}>{content}</ReactMarkdown>
  </div>;
}
