"use server";
import { cookies } from "next/headers";
import { localeCookie, locales, type Locale } from "./config";
export async function changeLocale(locale: Locale) {
  if (!locales.includes(locale)) throw new Error("Unsupported language.");
  (await cookies()).set(localeCookie, locale, { path: "/", sameSite: "lax", httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365 });
}
