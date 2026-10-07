import "server-only";
import type { Metadata } from "next";
import { getText } from "./server";
export async function localizeMetadata(metadata: Metadata): Promise<Metadata> {
  const tx = await getText();
  const title = metadata.title;
  return { ...metadata, description: metadata.description ? tx(metadata.description) : metadata.description,
    title: typeof title === "string" ? tx(title) : title && "default" in title ? { ...title, default: tx(title.default) } : title };
}
