import React, { useEffect, useRef, useState } from 'react';
import { Virtualizer } from 'virtua';
import type { CustomItemComponentProps } from 'virtua';

const Item = (props: CustomItemComponentProps) => <div {...props} />;

/** Minimal wrapper around virtua's Virtualizer (mirrors the product's list). */
function VirtualList({
  itemSize,
  children,
}: {
  itemSize?: number;
  children: React.ReactNode;
}) {
  return (
    <Virtualizer itemSize={itemSize} item={Item}>
      {children}
    </Virtualizer>
  );
}

const ROWS = 400;

export default function App() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tick, setTick] = useState(0);

  // (1) Keep a text input focused so a caret is painted each frame.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    const iv = setInterval(() => {
      if (document.activeElement !== el) el.focus();
    }, 100);
    return () => clearInterval(iv);
  }, []);

  // (3) Perturb layout every frame: bump the row-height seed and nudge scroll,
  // keeping virtua's RO -> flushSync + fixScrollJump churning.
  useEffect(() => {
    let raf = 0;
    let dir = 1;
    const loop = () => {
      setTick((t) => t + 1);
      const s = scrollRef.current;
      if (s) {
        s.scrollTop += dir * 8;
        if (
          s.scrollTop <= 0 ||
          s.scrollTop + s.clientHeight >= s.scrollHeight
        ) {
          dir = -dir;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 8 }}>
      <input
        ref={inputRef}
        defaultValue="focused caret — do not blur"
        data-testid="caret"
        style={{ fontSize: 16, width: 320 }}
      />
      <div
        ref={scrollRef}
        data-testid="scroll"
        style={{
          height: 400,
          width: 320,
          overflow: 'auto',
          border: '1px solid #ccc',
          marginTop: 8,
        }}
      >
        <VirtualList itemSize={39}>
          {Array.from({ length: ROWS }, (_, i) => {
            // Heights differ from `itemSize` (39) and change with `tick`, so the
            // first (and every) measurement dispatches ITEM_RESIZE.
            const h = 24 + ((i * 7 + tick) % 11) * 6;
            return (
              <div
                key={i}
                style={{ height: h, padding: 4, boxSizing: 'border-box' }}
              >
                row {i}
              </div>
            );
          })}
        </VirtualList>
      </div>
    </div>
  );
}
