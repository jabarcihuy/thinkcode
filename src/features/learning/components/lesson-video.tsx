"use client";

import { useState } from "react";
import { youtubeVideoId } from "@/features/learning/video-url";

export function LessonVideo({ href, title }: { href: string; title: string }) {
  const [open, setOpen] = useState(false);
  const id = youtubeVideoId(href);
  if (!id) return <a className="font-medium text-accent underline underline-offset-4" href={href}>{title}</a>;
  return <span>
    <span className="font-medium">{title}</span>{" · "}
    {open ? <span className="block overflow-hidden rounded-md bg-code-surface" style={{ aspectRatio: "16 / 9" }}>
      <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${id}`} title={title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    </span> : <button type="button" className="min-h-11 text-sm font-semibold text-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent" onClick={() => setOpen(true)}>Putar video pendukung</button>}{" · "}
    <a className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground" href={href} target="_blank" rel="noopener noreferrer">Buka di YouTube</a>
  </span>;
}
