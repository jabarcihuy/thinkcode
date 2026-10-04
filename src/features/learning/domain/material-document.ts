import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Root, RootContent } from "mdast";

export type MaterialBlock =
  | { type: "heading"; text: string; depth: number }
  | { type: "paragraph" | "code"; text: string }
  | { type: "table"; rows: string[][] };

/** One parser for prose, examples and static tables; no HTML or remote resources. */
export function parseMaterialDocument(content: string): MaterialBlock[] {
  if (content.length > 30_000) throw new Error("Materi terlalu panjang untuk PDF.");
  const root = unified().use(remarkParse).use(remarkGfm).parse(content) as Root;
  function text(node: { type: string; value?: string; url?: string; alt?: string | null; children?: unknown[] }): string {
    if (node.type === "image") return node.alt ?? "";
    if (node.type === "html") return "";
    if (node.value !== undefined) return node.value;
    const children = (node.children ?? []).map((child) => text(child as Parameters<typeof text>[0])).join("");
    return node.type === "link" && node.url && /^https:\/\//.test(node.url) ? `${children} (${node.url})` : children;
  }
  const blocks: MaterialBlock[] = [];
  function visit(node: RootContent) {
    if (node.type === "heading") blocks.push({ type: "heading", depth: node.depth, text: text(node) });
    else if (node.type === "code") blocks.push({ type: "code", text: node.value });
    else if (node.type === "paragraph") blocks.push({ type: "paragraph", text: text(node) });
    else if (node.type === "table") blocks.push({ type: "table", rows: node.children.map((row) => row.children.map(text)) });
    else if (node.type === "list") node.children.forEach((item, index) => blocks.push({ type: "paragraph", text: `${node.ordered ? `${(node.start ?? 1) + index}.` : "•"} ${text(item)}` }));
    else if (node.type === "blockquote") node.children.forEach(visit);
  }
  root.children.forEach(visit);
  return blocks;
}
