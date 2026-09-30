"use client";

import { useRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Motion tokens. Kept in one place so landing animations stay consistent and
 * easy to tune, mirroring the semantic CSS variable approach used for color.
 */
export const motion = {
  duration: { fast: 0.45, base: 0.7, slow: 0.9 },
  stagger: { tight: 0.06, base: 0.09, loose: 0.14 },
  ease: {
    out: "power3.out",
    inOut: "power2.inOut",
    // A calm, technical ease: quick settle without overshoot bounce.
    settle: "expo.out",
  },
  distance: { sm: 12, base: 20, lg: 28 },
} as const;

type RevealProps = Omit<ComponentPropsWithoutRef<"div">, "ref"> & {
  children: ReactNode;
  /** Stagger direct children instead of animating the wrapper as one block. */
  stagger?: boolean;
  /** Delay before the sequence starts, in seconds. */
  delay?: number;
  /** Vertical travel distance in px. */
  y?: number;
  /** Animate on scroll into view instead of on mount. */
  revealOnScroll?: boolean;
  /** Element type for the wrapper. */
  as?: ElementType;
};

/**
 * Reveals content with a short, calm fade-and-rise.
 *
 * Accessibility: when the user prefers reduced motion, the final state is
 * applied immediately with no animation, so content is never hidden or
 * delayed. The element is only ever made invisible by GSAP after mount, so
 * the server-rendered markup stays visible if JavaScript never runs.
 */
export function Reveal({
  children,
  stagger = false,
  delay = 0,
  y = motion.distance.base,
  revealOnScroll = false,
  as: Tag = "div",
  className,
  ...rest
}: RevealProps) {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const targets: Element[] = stagger ? Array.from(root.children) : [root];
      if (targets.length === 0) return;

      // Claim the handoff from the pre-paint CSS for this element only. From here
      // GSAP owns its opacity, so the fallback timer no longer needs to reveal it.
      const claim = () => root.setAttribute("data-motion-ready", "");
      const release = () => root.removeAttribute("data-motion-ready");
      claim();

      const media = gsap.matchMedia();

      media.add(
        { reduce: REDUCED_MOTION_QUERY, ok: `not ${REDUCED_MOTION_QUERY}` },
        (context) => {
          const { reduce } = context.conditions as { reduce: boolean; ok: boolean };

          // Reduced motion: show everything, no movement, no delay.
          if (reduce) {
            gsap.set(targets, { autoAlpha: 1, y: 0, clearProps: "transform" });
            return;
          }

          const tween = gsap.fromTo(
            targets,
            { autoAlpha: 0, y },
            {
              autoAlpha: 1,
              y: 0,
              duration: motion.duration.base,
              ease: motion.ease.settle,
              delay,
              stagger: stagger ? motion.stagger.base : 0,
              // Avoid a transform lingering on the wrapper after the tween.
              clearProps: "transform",
              onComplete: release,
              ...(revealOnScroll
                ? {
                    scrollTrigger: {
                      trigger: root,
                      start: "top 85%",
                      once: true,
                    },
                  }
                : {}),
            },
          );

          // If the tween is torn down before finishing, hand the element back to
          // the CSS fallback so it can never remain stuck invisible.
          return () => {
            tween.kill();
            release();
          };
        },
      );

      return () => media.revert();
    },
    { scope, dependencies: [stagger, delay, y, revealOnScroll] },
  );

  return (
    <Tag ref={scope} data-motion={stagger ? undefined : ""} data-motion-stagger={stagger ? "" : undefined} className={className} {...rest}>
      {children}
    </Tag>
  );
}
