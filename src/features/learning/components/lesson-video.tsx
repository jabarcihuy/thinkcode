"use client";

import { useText } from "@/i18n/use-text";


import { useLocale } from "next-intl";
import { useState } from "react";
import { youtubeVideoId } from "@/features/learning/video-url";

export function LessonVideo({ href, title }: { href: string; title: string }) {
  const tx = useText();

  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const id = youtubeVideoId(href);
  if (!id) return <a className="font-medium text-accent underline underline-offset-4" href={href}>{tx(title)}</a>;
  return <span className="block">
    <span className="block text-sm font-semibold leading-6">{tx(title)}</span>
    {locale === "en" && <span className="mt-1 block text-xs text-muted-foreground">Video in Indonesian · optional</span>}
    {open && <span className="mt-3 block overflow-hidden rounded-md bg-code-surface" style={{ aspectRatio: "16 / 9" }}>
      <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${id}`} title={tx(title)} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    </span>}
    <span className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1"><button type="button" className="min-h-11 text-sm font-semibold text-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring" aria-expanded={open} onClick={() => setOpen(!open)}>{tx(open ? "Tutup video" : "Putar video")}</button>
    <a className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring" href={href} target="_blank" rel="noopener noreferrer">{tx("Buka di YouTube")}</a></span>
  </span>;
}
