import { localizeMetadata } from "@/i18n/metadata";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import localFont from "next/font/local";
const dmSans = localFont({ src: "./fonts/dm-sans.ttf", variable: "--font-dm-sans", display: "swap", weight: "100 1000" });
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { OfflineRegistration } from "@/components/layout/offline-registration";
import { SkipLink } from "@/components/layout/skip-link";

const pageMetadata: Metadata = {
  manifest: "/manifest.json",
  icons: {
    icon: { url: "/assets/quethink/quethink-mark.svg", type: "image/svg+xml" },
    apple: "/icons/apple-touch-icon.png",
  },
  title: { default: "Quethink", template: "%s | Quethink" },
  description: "Pelajari tabel, relasi, dan query SQL dengan data latihan yang dapat diamati langsung.",
};

export const viewport: Viewport = { viewportFit: "cover", themeColor: "#4f46e5", interactiveWidget: "resizes-content" };

const prePaintScript =
  "window.setTimeout(function(){document.querySelectorAll('[data-motion],[data-motion-stagger],[data-motion-scope]').forEach(function(el){el.setAttribute('data-motion-ready','')})},2500);";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return <html lang={locale} className={`${dmSans.variable} ${GeistMono.variable}`} style={{ colorScheme: "light" }}>
    <head>
      <script dangerouslySetInnerHTML={{ __html: prePaintScript }} />
    </head>
    <body className="min-h-[100dvh] antialiased">
      <NextIntlClientProvider messages={null}>
      <SkipLink />
      <OfflineRegistration />
      {children}
      </NextIntlClientProvider>
    </body>
  </html>;
}

export async function generateMetadata() { return localizeMetadata(pageMetadata); }
