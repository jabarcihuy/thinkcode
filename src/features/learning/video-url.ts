export function youtubeVideoId(href: string | undefined) {
  if (!href) return null;
  try {
    const url = new URL(href);
    const host = url.hostname.toLowerCase();
    const id = host === "youtu.be" ? url.pathname.slice(1) : host === "youtube.com" || host === "www.youtube.com" ? url.searchParams.get("v") : null;
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}
