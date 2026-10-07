"use client";
import { useEffect } from "react";
export function OfflineRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !window.isSecureContext || !("serviceWorker" in navigator)) return;
    // This worker only caches a public fallback, never pages, API results or credentials.
    void navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
