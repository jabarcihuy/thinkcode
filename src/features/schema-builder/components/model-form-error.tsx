"use client";
import { useText } from "@/i18n/use-text";


import { useEffect, useRef } from "react";

export function ModelFormError({ id, message }: { id: string; message: string }) {
  const tx = useText();

  const element = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (!message) return;
    element.current?.focus({ preventScroll: true });
    element.current?.scrollIntoView({ block: "nearest" });
  }, [message]);
  if (!message) return null;
  return <p ref={element} id={id} role="alert" tabIndex={-1} className="mt-2 text-sm leading-6 text-destructive focus-visible:outline-2 focus-visible:outline-ring">{tx(message)}</p>;
}
