import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";

export const metadata: Metadata = {
  title: { default: "ThinkCode", template: "%s | ThinkCode" },
  description: "Belajar logika pemrograman secara bertahap dan terarah.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id" className="system"><body className="min-h-screen antialiased"><ThemeProvider>{children}</ThemeProvider></body></html>;
}
