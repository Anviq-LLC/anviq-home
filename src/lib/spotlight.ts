// Sherlock's second mouse. On request it flies a labelled cursor out of the
// character to a real control, rings it, and clicks it if asked. Any real input
// from the visitor, or the Stop button, ends it at once.

export interface Step {
  selector: string;
  click?: boolean;
  caption?: string;
  /** How long to stay on a step that is only pointed at. */
  hold?: number;
}
export interface RouteOptions {
  from: { x: number; y: number };
}
export type RouteResult = "done" | "cancelled" | "missing";

const CANCEL_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
const GRACE_MS = 450;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** First visible element for a selector, or null when nothing is on screen. */
export function findTarget(selector: string): HTMLElement | null {
  for (const el of document.querySelectorAll<HTMLElement>(selector)) {
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") continue;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

function fullyInView(el: Element) {
  const r = el.getBoundingClientRect();
  return r.top >= 70 && r.bottom <= window.innerHeight - 90 && r.left >= 0 && r.right <= window.innerWidth;
}

export function runRoute(steps: Step[], { from }: RouteOptions): { cancel: () => void; finished: Promise<RouteResult> } {
  let cancelled = false;
  let done = false;
  let ghost: HTMLDivElement | null = null;
  let label: HTMLSpanElement | null = null;
  let tag: HTMLSpanElement | null = null;
  let stop: HTMLButtonElement | null = null;
  let pointed: HTMLElement | null = null;
  let pos = { ...from };
  const started = performance.now();
  const reduced = reducedMotion();
  let resolve!: (r: RouteResult) => void;
  const finished = new Promise<RouteResult>((r) => (resolve = r));

  const clear = () => {
    pointed?.removeAttribute("data-sherlock-pointed");
    pointed = null;
    tag?.remove();
    tag = null;
  };
  const end = (result: RouteResult) => {
    if (done) return;
    done = true;
    CANCEL_EVENTS.forEach((type) => window.removeEventListener(type, onUser, true));
    clear();
    stop?.remove();
    const g = ghost;
    ghost = null;
    if (g) {
      g.classList.add("is-leaving");
      window.setTimeout(() => g.remove(), 220);
    }
    resolve(result);
  };
  const onUser = (event: Event) => {
    if (!event.isTrusted || performance.now() - started < GRACE_MS) return;
    cancelled = true;
    end("cancelled");
  };
  CANCEL_EVENTS.forEach((type) => window.addEventListener(type, onUser, true));

  const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
  const waitFor = async (selector: string, timeout = 1800) => {
    const t0 = performance.now();
    while (!cancelled && performance.now() - t0 < timeout) {
      const el = findTarget(selector);
      if (el) return el;
      await wait(70);
    }
    return null;
  };
  const settle = async (el: HTMLElement) => {
    let last = -1;
    for (let i = 0; i < 14 && !cancelled; i++) {
      await wait(70);
      const top = el.getBoundingClientRect().top;
      if (Math.abs(top - last) < 0.5) return;
      last = top;
    }
  };
  const place = (x: number, y: number) => {
    pos = { x, y };
    if (ghost) ghost.style.transform = `translate(${x}px, ${y}px)`;
  };
  const fly = (to: { x: number; y: number }) =>
    new Promise<void>((resolveFly) => {
      const dx = to.x - pos.x;
      const dy = to.y - pos.y;
      const dist = Math.hypot(dx, dy);
      const duration = Math.min(1300, 620 + dist * 0.7);
      const bend = Math.min(110, dist * 0.2);
      const nx = -dy / (dist || 1);
      const ny = dx / (dist || 1);
      const start = { ...pos };
      const t0 = performance.now();
      const frame = (now: number) => {
        if (cancelled) return resolveFly();
        const t = Math.min(1, (now - t0) / duration);
        const e = ease(t);
        const bump = Math.sin(Math.PI * e) * bend;
        place(start.x + dx * e + nx * bump, start.y + dy * e + ny * bump);
        if (t < 1) requestAnimationFrame(frame);
        else resolveFly();
      };
      requestAnimationFrame(frame);
    });
  // With reduced motion there is no flying cursor, only a ring and a caption.
  const caption = (el: HTMLElement, text: string) => {
    const r = el.getBoundingClientRect();
    tag = document.createElement("span");
    tag.className = "sherlock-tag";
    tag.setAttribute("aria-hidden", "true");
    tag.textContent = text;
    const below = r.bottom + 56 < window.innerHeight;
    tag.style.left = `${Math.max(12, Math.min(r.left, window.innerWidth - 240))}px`;
    tag.style.top = below ? `${r.bottom + 12}px` : `${Math.max(8, r.top - 44)}px`;
    document.body.appendChild(tag);
  };

  (async () => {
    stop = document.createElement("button");
    stop.type = "button";
    stop.className = "sherlock-stop";
    stop.textContent = "Stop";
    stop.setAttribute("aria-label", "Stop Sherlock's demonstration");
    stop.addEventListener("click", (event) => {
      event.stopPropagation();
      cancelled = true;
      end("cancelled");
    });
    document.body.appendChild(stop);
    if (!reduced) {
      ghost = document.createElement("div");
      ghost.className = "sherlock-ghost";
      ghost.setAttribute("aria-hidden", "true");
      ghost.innerHTML =
        '<svg viewBox="0 0 24 28" width="30" height="34"><path d="M3 2l17 10-7.4 2L9.6 22 3 2z" fill="#fff" stroke="#18202c" stroke-width="1.6" stroke-linejoin="round"/></svg><span></span>';
      label = ghost.querySelector("span");
      document.body.appendChild(ghost);
      place(from.x, from.y);
    }
    for (const step of steps) {
      if (cancelled) return;
      const el = await waitFor(step.selector);
      if (!el) return end("missing");
      if (label) label.textContent = step.caption ?? "Sherlock";
      if (!fullyInView(el)) {
        el.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
        await settle(el);
      }
      if (cancelled) return;
      const rect = el.getBoundingClientRect();
      if (!reduced) await fly({ x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.58 });
      if (cancelled) return;
      clear();
      pointed = el;
      el.setAttribute("data-sherlock-pointed", "");
      if (reduced && step.caption) caption(el, step.caption);
      await wait(step.click ? 700 : (step.hold ?? 1500));
      if (cancelled) return;
      if (step.click) {
        el.click();
        await wait(420);
      }
      clear();
    }
    end("done");
  })();

  return {
    cancel: () => {
      cancelled = true;
      end("cancelled");
    },
    finished,
  };
}
