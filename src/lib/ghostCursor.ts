// Sherlock's second mouse. It flies a small labelled cursor to a real element
// and, when asked, clicks it. Any real input from the visitor cancels it, so it
// never fights them for the page.

const CANCEL_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

export interface PointOptions {
  from: { x: number; y: number };
  click: boolean;
  onDone?: (result: "clicked" | "pointed" | "cancelled") => void;
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function inViewport(el: Element) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
}

/** First visible element for a link target, or null when nothing is on screen. */
export function findTarget(selector: string): HTMLElement | null {
  for (const el of document.querySelectorAll<HTMLElement>(selector)) {
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") continue;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

export function pointAt(target: HTMLElement, { from, click, onDone }: PointOptions): () => void {
  let cancelled = false;
  let finished = false;
  const timers: number[] = [];
  const nodes: HTMLElement[] = [];
  let anim: Animation | undefined;

  const cleanup = () => {
    timers.forEach((t) => window.clearTimeout(t));
    anim?.cancel();
    nodes.forEach((n) => n.remove());
    target.removeAttribute("data-sherlock-pointed");
    CANCEL_EVENTS.forEach((type) => window.removeEventListener(type, onUser, true));
  };
  const finish = (result: "clicked" | "pointed" | "cancelled") => {
    if (finished) return;
    finished = true;
    cleanup();
    onDone?.(result);
  };
  const onUser = (event: Event) => {
    if (!event.isTrusted) return;
    cancelled = true;
    finish("cancelled");
  };
  CANCEL_EVENTS.forEach((type) => window.addEventListener(type, onUser, true));

  const run = () => {
    if (cancelled) return;
    const rect = target.getBoundingClientRect();
    const end = { x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.58 };
    const land = () => {
      if (cancelled) return;
      target.setAttribute("data-sherlock-pointed", "");
      const ring = document.createElement("span");
      ring.className = "sherlock-ring";
      ring.style.left = `${end.x}px`;
      ring.style.top = `${end.y}px`;
      document.body.appendChild(ring);
      nodes.push(ring);
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          if (click) {
            target.click();
            timers.push(window.setTimeout(() => finish("clicked"), 260));
          } else {
            timers.push(window.setTimeout(() => finish("pointed"), 2600));
          }
        }, click ? 420 : 200),
      );
    };

    if (reducedMotion()) {
      land();
      return;
    }
    const ghost = document.createElement("div");
    ghost.className = "sherlock-ghost";
    ghost.setAttribute("aria-hidden", "true");
    ghost.innerHTML =
      '<svg viewBox="0 0 24 28" width="26" height="30"><path d="M3 2l17 10-7.4 2L9.6 22 3 2z" fill="#fff" stroke="#18202c" stroke-width="1.6" stroke-linejoin="round"/></svg><span>Sherlock</span>';
    document.body.appendChild(ghost);
    nodes.push(ghost);
    const dx = end.x - from.x;
    const dy = end.y - from.y;
    const dist = Math.hypot(dx, dy);
    const bend = Math.min(90, dist * 0.18);
    const mid = { x: from.x + dx * 0.5 - (dy / (dist || 1)) * bend, y: from.y + dy * 0.5 + (dx / (dist || 1)) * bend };
    const at = (p: { x: number; y: number }) => `translate(${p.x}px, ${p.y}px)`;
    anim = ghost.animate([{ transform: at(from), opacity: 0 }, { transform: at(mid), opacity: 1, offset: 0.5 }, { transform: at(end), opacity: 1 }], {
      duration: Math.min(900, 320 + dist * 0.6),
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      fill: "forwards",
    });
    anim.onfinish = land;
  };

  if (inViewport(target)) run();
  else {
    target.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
    timers.push(window.setTimeout(run, reducedMotion() ? 0 : 450));
  }
  return () => {
    cancelled = true;
    finish("cancelled");
  };
}
