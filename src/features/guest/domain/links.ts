/** Guest URLs mirror learner destinations without granting an account or role. */
export function guestHref(href: string): string {
  if (href.startsWith("#")) return href;
  const [pathname, hash] = href.split("#");
  const suffix = hash ? `#${hash}` : "";
  const material = pathname.match(/^\/learn\/[^/]+\/lessons\/([^/]+)(\/practice)?$/);
  if (material) return `/guest/${material[2] ? "lab" : "materials"}/${material[1]}${suffix}`;
  if (pathname.startsWith("/learn/")) return "/guest?view=materials";
  const views: Record<string, string> = { "/dashboard": "", "/lab": "lab", "/playground": "sqlab", "/schema-builder": "sqlab", "/chatbot": "chatbot", "/pre-test": "tests", "/post-test": "post-test", "/profile": "profile" };
  if (pathname in views) return `/guest${views[pathname] ? `?view=${views[pathname]}` : ""}${suffix}`;
  return href;
}
