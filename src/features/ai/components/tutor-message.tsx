import ReactMarkdown from "react-markdown";

/** Provider text is prose only: no HTML, images, links, or executable embeds. */
export function TutorMessageContent({ content }: { content: string }) {
  return <ReactMarkdown allowedElements={["p", "strong", "em", "code", "pre", "ul", "ol", "li", "br"]} unwrapDisallowed components={{
    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>,
    ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>,
    pre: ({ children }) => <pre tabIndex={0} className="my-3 max-w-full overflow-x-auto whitespace-pre rounded-md bg-code-surface p-3 font-mono text-sm text-code-foreground focus-visible:outline-2 focus-visible:outline-ring">{children}</pre>,
    code: ({ children }) => <code className="font-mono text-sm">{children}</code>,
  }}>{content}</ReactMarkdown>;
}
