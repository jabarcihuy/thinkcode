import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SkipLink } from "@/components/layout/skip-link";

export const metadata: Metadata = {
  title: { default: "Quethink", template: "%s | Quethink" },
  description: "Pelajari tabel, relasi, dan query SQL dengan data latihan yang dapat diamati langsung.",
};

/**
 * Runs before the first paint, and now has one job only.
 *
 * The product ships a single dark theme, so there is nothing to resolve and no
 * light flash to prevent: the palette in globals.css is already the final one.
 * What remains is the motion handoff. Animated elements are hidden by CSS until
 * GSAP claims them, and this timer is the fallback that marks every motion root
 * ready so content still appears if the animation bundle never runs.
 */
const prePaintScript =
  "window.setTimeout(function(){document.querySelectorAll('[data-motion],[data-motion-stagger],[data-motion-scope]').forEach(function(el){el.setAttribute('data-motion-ready','')})},2500);";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id" className={`dark ${GeistSans.variable} ${GeistMono.variable}`} style={{ colorScheme: "dark" }}>
    <head>
      <script dangerouslySetInnerHTML={{ __html: prePaintScript }} />
    </head>
    <body className="min-h-[100dvh] antialiased">
      <SkipLink />
      {children}
    </body>
  </html>;
}
