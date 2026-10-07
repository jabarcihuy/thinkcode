"use client";
import { useEffect, type RefObject } from "react";

/** Size the upward menu to the actual bar and leave room for mobile text entry. */
export function useMobileShell(bar: RefObject<HTMLElement | null>, panel: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const navigation = bar.current, menu = panel.current;
    if (!navigation || !menu) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const touch = window.matchMedia("(hover: none) and (pointer: coarse)");
    const update = () => {
      const height = navigation.getBoundingClientRect().height;
      menu.style.setProperty("--mobile-navigation-height", `${height}px`);
      document.documentElement.style.setProperty("--bottom-navigation-height", `${height}px`);
    };
    const editing = () => {
      const element = document.activeElement;
      const textInput = element instanceof HTMLTextAreaElement || (element instanceof HTMLInputElement && !["checkbox", "radio", "button", "submit", "range", "file"].includes(element.type)) || (element instanceof HTMLElement && element.isContentEditable);
      const hidden = touch.matches && !desktop.matches && textInput;
      navigation.toggleAttribute("data-editing", hidden);
      if (hidden || desktop.matches) menu.hidePopover();
      update();
    };
    const focusOut = () => queueMicrotask(editing);
    const observer = new ResizeObserver(update);
    observer.observe(navigation);
    document.addEventListener("focusin", editing);
    document.addEventListener("focusout", focusOut);
    desktop.addEventListener("change", editing);
    touch.addEventListener("change", editing);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", editing);
      document.removeEventListener("focusout", focusOut);
      desktop.removeEventListener("change", editing);
      touch.removeEventListener("change", editing);
      document.documentElement.style.removeProperty("--bottom-navigation-height");
    };
  }, [bar, panel]);
}
