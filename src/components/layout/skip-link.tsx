
import { useText } from "@/i18n/use-text";
/**
 * Keyboard escape hatch past the header.
 *
 * Visually hidden until focused, then pinned to the top-left. It targets
 * `#main-content`, which every page's <main> carries. Placed first in the DOM so
 * it is the first thing a keyboard or screen-reader user reaches.
 */
export function SkipLink() {
  const tx = useText();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-surface focus:outline-2 focus:outline-offset-2 focus:outline-ring"
    >
      {tx("Lewati ke konten utama")}</a>
  );
}
