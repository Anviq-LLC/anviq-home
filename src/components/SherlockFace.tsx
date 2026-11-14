import { useEffect, useId, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { SHERLOCK_SHAPE } from "@/lib/sherlockShape";

const C = 114.2705;

// The same character family as the Anviq Agents bots: a soft cloud with a
// layered edge and pill eyes, drawn like the app icons. The eyes follow the pointer and blink now and then.
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
    <svg ref={svg} className={`sherlock-face${thinking ? " is-thinking" : ""}`} viewBox="-15 -15 259 274" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${uid}b`} x1=".2" y1="0" x2=".8" y2="1">
          <stop offset="0" stopColor="#FFB46B" />
          <stop offset="1" stopColor="#EE5A12" />
        </linearGradient>
        <linearGradient id={`${uid}d`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D2530E" />
          <stop offset="1" stopColor="#A9390A" />
        </linearGradient>
      </defs>
      <path d={SHERLOCK_SHAPE} fill={`url(#${uid}d)`} transform="translate(0 9)" />
      <path d={SHERLOCK_SHAPE} fill={`url(#${uid}b)`} />
      <g className="sherlock-eyes" fill="#fff">
        <rect x={C - 45} y={C - 34} width="22" height="58" rx="11" />
        <rect x={C + 23} y={C - 34} width="22" height="58" rx="11" />
      </g>
    </svg>
  );
}
