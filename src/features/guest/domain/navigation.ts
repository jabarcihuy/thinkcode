/** Exactly one destination describes the current guest page. */
export function guestNavigationView(pathname: string, view: string | null): string {
  if (pathname.startsWith("/guest/forum")) return "menu";
  if (pathname.startsWith("/guest/lab/")) return "menu";
  if (pathname.startsWith("/guest/materials/")) return "materials";
  if (pathname.startsWith("/guest/tests/")) return "tests";
  if (view === "sqlab" || view === "chatbot" || view === "lab") return "menu";
  if (view === "pre-result") return "tests";
  if (view === "post-result") return "post-test";
  return view ?? "";
}
