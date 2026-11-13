import { useEffect, useId, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { SHERLOCK_SHAPE } from "@/lib/sherlockShape";

const C = 114.2705;

// The same character family as the Anviq Agents bots: a soft shape with pill
// eyes. The eyes follow the pointer and blink now and then.
export function SherlockFace({ thinking = false }: { thinking?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const svg = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = svg.current;
    if (!el || reduced) return;
    let frame = 0;
    let last: PointerEvent | null = null;
    const look = () => {
      frame = 0;
      if (!last) return;
      const r = el.getBoundingClientRect();
      const dx = last.clientX - (r.left + r.width / 2);
      const dy = last.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 220);
      el.style.setProperty("--ex", `${((dx / d) * 15 * k).toFixed(1)}px`);
      el.style.setProperty("--ey", `${((dy / d) * 11 * k).toFixed(1)}px`);
    };
    const onMove = (event: PointerEvent) => {
      last = event;
      if (!frame) frame = requestAnimationFrame(look);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    let blink = 0;
    const schedule = () => {
      blink = window.setTimeout(() => {
        el.classList.add("is-blinking");
        window.setTimeout(() => el.classList.remove("is-blinking"), 130);
        schedule();
      }, 2800 + Math.random() * 3400);
    };
    schedule();
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.clearTimeout(blink);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <svg ref={svg} className={`sherlock-face${thinking ? " is-thinking" : ""}`} viewBox="-15 -15 259 259" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${uid}b`} x1=".2" y1="0" x2=".8" y2="1">
          <stop offset="0" stopColor="#FFC25C" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <radialGradient id={`${uid}h`} cx=".3" cy=".18" r=".7">
          <stop offset="0" stopColor="#fff" stopOpacity=".6" />
          <stop offset=".6" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".7" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".22" />
        </linearGradient>
        <clipPath id={`${uid}c`}>
          <path d={SHERLOCK_SHAPE} />
        </clipPath>
      </defs>
      <path d={SHERLOCK_SHAPE} fill={`url(#${uid}b)`} />
      <path d={SHERLOCK_SHAPE} fill={`url(#${uid}h)`} />
      <g clipPath={`url(#${uid}c)`}>
        <path d={SHERLOCK_SHAPE} fill="none" stroke={`url(#${uid}r)`} strokeWidth="14" />
      </g>
      <g className="sherlock-eyes" fill="#141414">
        <rect x={C - 45} y={C - 34} width="22" height="58" rx="11" />
        <rect x={C + 23} y={C - 34} width="22" height="58" rx="11" />
      </g>
    </svg>
  );
}
