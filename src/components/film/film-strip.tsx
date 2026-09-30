"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

/**
 * FilmStrip — the world's core primitive.
 *
 * A film strip is pulled through a gate: frames sit in sequence, one is live at
 * a time, and transport controls move the strip. That is exactly the shape of an
 * execution trace, so this one component serves the landing hero, the lesson
 * workspace, and the practice feedback without inventing a second language.
 *
 * State is carried by line form and weight (a solid tick, a filled frame), not
 * by hue alone, so it survives greyscale and colour-blind viewing. The single
 * amber accent marks only the live frame.
 *
 * Accessibility: the strip is a real tablist. Arrow keys, Home and End move
 * between frames, each frame is a tab with aria-selected, and the panel below
 * is the tabpanel. Live changes announce through aria-live on the readout.
 */

export type Frame = {
  /** Sequence number shown in the frame, 1-based. */
  n: number;
  title: string;
  body?: string;
  /** Optional monospace line, e.g. the code line this frame represents. */
  code?: string;
  /** Marks the frame as already completed (a passed step or finished lesson). */
  done?: boolean;
};

type Props = {
  frames: Frame[];
  /** Controlled index. Omit to let the strip manage its own state. */
  index?: number;
  onIndexChange?: (index: number) => void;
  /** Show play/pause. Off for strips that are only read, never played. */
  transport?: boolean;
  /** Autoplay advance interval in ms. Only used when `transport` is on. */
  intervalMs?: number;
  /** Accessible name for the strip. */
  label: string;
  /** Optional className applied to the outer wrapper. */
  className?: string;
};

export function FilmStrip({
  frames,
  index: controlledIndex,
  onIndexChange,
  transport = false,
  intervalMs = 1400,
  label,
  className,
}: Props) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const index = controlledIndex ?? internalIndex;
  const last = frames.length - 1;
  const frame = frames[index];

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(last, next));
      if (controlledIndex === undefined) setInternalIndex(clamped);
      onIndexChange?.(clamped);
    },
    [controlledIndex, last, onIndexChange],
  );

  const stop = useCallback(() => setPlaying(false), []);

  useEffect(() => {
    if (!playing || !transport) return;
    const timer = window.setInterval(() => {
      setInternalIndex((current) => {
        if (current >= last) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [playing, transport, intervalMs, last]);

  // Keep the controlled parent in step while autoplaying.
  useEffect(() => {
    if (transport && controlledIndex !== undefined) onIndexChange?.(internalIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalIndex]);

  function onKeyDown(event: React.KeyboardEvent) {
    const keys: Record<string, number> = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: last,
    };
    const target = keys[event.key];
    if (target === undefined) return;
    event.preventDefault();
    stop();
    go(target);
    const tabs = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[Math.max(0, Math.min(last, target))]?.focus();
  }

  if (!frame) return null;

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3 pb-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>{label}</span>
        <span>{frame.code ? "main.js" : "JavaScript · browser"}</span>
      </div>

      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="flex gap-px overflow-hidden rounded-lg bg-border outline outline-1 outline-border"
      >
        {frames.map((item, i) => {
          const live = i === index;
          return (
            <button
              key={item.n}
              type="button"
              role="tab"
              id={`${baseId}-tab-${i}`}
              aria-selected={live}
              aria-controls={`${baseId}-panel`}
              tabIndex={live ? 0 : -1}
              onClick={() => {
                stop();
                go(i);
              }}
              /* Below 860px a four-up strip squeezes every frame past reading
                 width, so only the live frame is pulled into the gate. The film
                 does not reflow, it advances. The rule lives in CSS (see
                 .film-frame in globals.css) because competing Tailwind
                 `hidden` / `max-[860px]:flex` utilities cancel each other out. */
              data-live={live ? "true" : "false"}
              className={`film-frame min-w-0 flex-1 basis-0 cursor-pointer border-0 p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-live ${
                live ? "bg-background" : "bg-background/40 hover:bg-background/70"
              }`}
            >
              <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] text-muted-foreground">
                {/* Line form carries state: hairline idle, solid live. */}
                <span
                  aria-hidden="true"
                  className={`h-0.5 rounded-full transition-all ${
                    live ? "w-5 bg-live" : item.done ? "w-5 bg-muted-foreground" : "w-5 bg-border"
                  }`}
                />
                {String(item.n).padStart(2, "0")}
              </span>
              <span className="mt-3 block text-[15px] font-medium leading-snug text-foreground">
                {item.title}
              </span>
              {item.body && (
                <span className="mt-1.5 block text-[13px] leading-relaxed text-muted-foreground">
                  {item.body}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/*
        The gate: what the projector actually shows. A film strip carries the
        sequence, but a frame at strip scale is far too narrow for a readable
        line of code, so the live frame's code is projected below at full width.
        This is also why each frame above carries no code: repeating it in two
        places at two sizes is how the earlier draft ended up clipping.
      */}
      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${index}`}
        tabIndex={0}
        className="mt-2.5 rounded-lg bg-code-surface px-3.5 py-3 font-mono text-[13px] leading-relaxed text-code-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-live"
      >
        <span className="block whitespace-pre">{frame.code ?? frame.body ?? frame.title}</span>
      </div>

      {transport && (
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <TransportButton label="Ulangi dari awal" disabled={index === 0} onClick={() => { stop(); go(0); }}>
            ↺
          </TransportButton>
          <TransportButton label="Langkah sebelumnya" disabled={index === 0} onClick={() => { stop(); go(index - 1); }}>
            ‹
          </TransportButton>
          <TransportButton
            label={playing ? "Jeda" : "Putar"}
            onClick={() => setPlaying((current) => !current)}
          >
            {playing ? "❙❙" : "▶"}
          </TransportButton>
          <TransportButton label="Langkah berikutnya" disabled={index >= last} onClick={() => { stop(); go(index + 1); }}>
            ›
          </TransportButton>
          <span aria-live="polite" className="ml-auto font-mono text-xs text-muted-foreground">
            <span className="text-foreground">{index + 1}</span> / {frames.length}
          </span>
        </div>
      )}
    </div>
  );
}

function TransportButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-9 place-items-center rounded-md border border-border bg-background text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-35"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
