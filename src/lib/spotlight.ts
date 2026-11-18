// Sherlock's second mouse. On request it flies a labelled cursor out of the
// character to a real control, rings it, and clicks it if asked. On a tour it
// also talks: the cursor arrives, an orange highlighter marks the text being
// discussed, and a speech bubble says it in plain words. Any real input from
// the visitor, or the Stop button, ends it at once.

export interface Step {
  selector: string;
  click?: boolean;
  caption?: string;
  /** What Sherlock says about this part of the page. */
  say?: string;
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
/** Time to read a sentence comfortably, with a floor. */
const readTime = (text: string) => Math.max(2600, text.split(/\s+/).length * 340 + 900);

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
  const phone = window.matchMedia("(max-width: 759px)").matches;
  return r.top >= 70 && r.bottom <= window.innerHeight - (phone ? 300 : 190) && r.left >= 0 && r.right <= window.innerWidth;
}

/** Light text sits on a dark ground, where the marker must not blend away. */
function isLight(el: Element): boolean {
  const c = getComputedStyle(el).color.match(/[\d.]+/g)?.map(Number) ?? [];
  return c.length >= 3 && (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255 > 0.6;
}

/** One rectangle per line of text, merged so a marker follows the lines like a pen. */
function lineRects(el: Element): DOMRect[] {
  const range = document.createRange();
  range.selectNodeContents(el);
  const rects = [...range.getClientRects()].filter((r) => r.width > 2 && r.height > 2).sort((a, b) => a.top - b.top || a.left - b.left);
  const lines: { left: number; right: number; top: number; bottom: number }[] = [];
  for (const r of rects) {
    const line = lines.find((l) => Math.abs(l.top - r.top) < r.height * 0.5);
    if (line) {
      line.left = Math.min(line.left, r.left);
      line.right = Math.max(line.right, r.right);
      line.top = Math.min(line.top, r.top);
      line.bottom = Math.max(line.bottom, r.bottom);
    } else lines.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
  }
  return lines.map((l) => new DOMRect(l.left, l.top, l.right - l.left, l.bottom - l.top));
}

export function runRoute(steps: Step[], { from }: RouteOptions): { cancel: () => void; finished: Promise<RouteResult> } {
  let cancelled = false;
  let done = false;
  let ghost: HTMLDivElement | null = null;
  let label: HTMLSpanElement | null = null;
  let tag: HTMLSpanElement | null = null;
  let stop: HTMLButtonElement | null = null;
  let bubble: HTMLDivElement | null = null;
  let pointed: HTMLElement | null = null;
  let marks: HTMLElement[] = [];
  let skip: (() => void) | null = null;
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
    bubble?.remove();
    bubble = null;
    marks.forEach((m) => m.remove());
    marks = [];
  };
  const end = (result: RouteResult) => {
    if (done) return;
    done = true;
    CANCEL_EVENTS.forEach((type) => window.removeEventListener(type, onUser, true));
    window.removeEventListener("resize", onResize);
    window.removeEventListener("scroll", onScroll);
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
    if (event.target instanceof Element && event.target.closest(".sherlock-say")) return;
    cancelled = true;
    end("cancelled");
  };
  const onResize = () => {
    cancelled = true;
    end("cancelled");
  };
  CANCEL_EVENTS.forEach((type) => window.addEventListener(type, onUser, true));
  window.addEventListener("resize", onResize);

  const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
  /** Waits for the time to pass, or for the visitor to press Next. */
  const waitOrNext = (ms: number) =>
    new Promise<void>((r) => {
      const t = window.setTimeout(() => {
        skip = null;
        r();
      }, ms);
      skip = () => {
        window.clearTimeout(t);
        skip = null;
        r();
      };
    });
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

  // The text being discussed: the heading, and the paragraph right after it.
  const markTargets = (el: HTMLElement): Element[] => {
    const out: Element[] = [el];
    let next = el.nextElementSibling;
    while (next && !/^(P|UL|OL)$/.test(next.tagName) && !/^H[1-6]$/.test(next.tagName)) next = next.firstElementChild ? next.firstElementChild : next.nextElementSibling;
    if (next && /^(P)$/.test(next.tagName)) out.push(next);
    return out;
  };
  // Cards, buttons and anything with a picture get a clean rounded outline.
  // The text marker is only for text, where it lines up with the words.
  const needsFrame = (el: HTMLElement) => el.matches("a, button") || !!el.querySelector("img, picture, svg");
  const frameAround = (el: HTMLElement, instant = false) => {
    const r = el.getBoundingClientRect();
    const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    const f = document.createElement("span");
    f.className = "sherlock-frame";
    f.setAttribute("aria-hidden", "true");
    f.style.left = `${r.left - 6}px`;
    f.style.top = `${r.top - 6}px`;
    f.style.width = `${r.width + 12}px`;
    f.style.height = `${r.height + 12}px`;
    f.style.borderRadius = `${Math.max(12, radius + 6)}px`;
    if (reduced || instant) f.style.animation = "none";
    document.body.appendChild(f);
    marks.push(f);
    return r.bottom + 6;
  };
  const highlight = (el: HTMLElement, instant = false) => {
    if (needsFrame(el)) return frameAround(el, instant);
    let delay = 0;
    let bottom = el.getBoundingClientRect().bottom;
    const light = isLight(el);
    for (const target of markTargets(el)) {
      for (const r of lineRects(target)) {
        const m = document.createElement("span");
        m.className = light ? "sherlock-mark is-light" : "sherlock-mark";
        m.setAttribute("aria-hidden", "true");
        const padX = 5;
        m.style.left = `${r.left - padX}px`;
        m.style.top = `${r.top + r.height * 0.14}px`;
        m.style.width = `${r.width + padX * 2}px`;
        m.style.height = `${r.height * 0.74}px`;
        m.style.transform = `rotate(${(Math.random() - 0.5) * 0.7}deg)`;
        if (!reduced && !instant) {
          m.style.animationDelay = `${delay}ms`;
          m.style.animationDuration = `${Math.min(700, 260 + r.width * 1.1)}ms`;
        } else m.style.animation = "none";
        delay += reduced ? 0 : Math.min(700, 260 + r.width * 1.1) * 0.8;
        document.body.appendChild(m);
        marks.push(m);
        bottom = Math.max(bottom, r.bottom);
      }
    }
    return bottom;
  };
  let shown: { el: HTMLElement; bottom: number } | null = null;
  // Below the text, else above, else beside it, else docked low, so the heading is never covered.
  const positionBubble = (el: HTMLElement, bottom: number) => {
    if (!bubble) return;
    const r = el.getBoundingClientRect();
    const h = bubble.offsetHeight;
    const w = bubble.offsetWidth;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = Math.max(12, Math.min(r.left, vw - w - 12));
    let top: number;
    if (bottom + 16 + h < vh - 8) top = bottom + 16;
    else if (r.top - h - 16 >= 8) top = r.top - h - 16;
    else if (r.right + 16 + w <= vw - 12) {
      left = r.right + 16;
      top = Math.max(8, Math.min(r.top, vh - h - 8));
    } else if (r.left - 16 - w >= 12) {
      left = r.left - 16 - w;
      top = Math.max(8, Math.min(r.top, vh - h - 8));
    } else top = Math.max(8, vh - h - 24);
    bubble.style.left = `${left}px`;
    bubble.style.top = `${top}px`;
  };
  // Highlights that would sit under the bubble are dropped, so he never talks over the text he marks.
  const trimCovered = () => {
    if (!bubble) return;
    const b = bubble.getBoundingClientRect();
    marks = marks.filter((m) => {
      if (!m.classList.contains("sherlock-mark")) return true;
      const r = m.getBoundingClientRect();
      const w = Math.min(r.right, b.right) - Math.max(r.left, b.left);
      const h = Math.min(r.bottom, b.bottom) - Math.max(r.top, b.top);
      if (w > 0 && h > 0 && (w * h) / (r.width * r.height) > 0.25) {
        m.remove();
        return false;
      }
      return true;
    });
  };
  let tick = 0;
  const onScroll = () => {
    if (tick) return;
    tick = requestAnimationFrame(() => {
      tick = 0;
      if (!shown || cancelled || !bubble) return;
      marks.forEach((m) => m.remove());
      marks = [];
      shown.bottom = highlight(shown.el, true);
      positionBubble(shown.el, shown.bottom);
      trimCovered();
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  const speak = (el: HTMLElement, text: string, bottom: number, last: boolean) => {
    bubble = document.createElement("div");
    bubble.className = "sherlock-say";
    bubble.setAttribute("role", "status");
    const p = document.createElement("p");
    p.textContent = text;
    bubble.appendChild(p);
    const next = document.createElement("button");
    next.type = "button";
    next.textContent = last ? "Done" : "Next";
    next.addEventListener("click", (event) => {
      event.stopPropagation();
      skip?.();
    });
    const row = document.createElement("div");
    row.className = "sherlock-say-row";
    row.appendChild(next);
    const pause = document.createElement("button");
    pause.type = "button";
    pause.className = "sherlock-inpause";
    pause.textContent = "Stop";
    pause.addEventListener("click", (event) => {
      event.stopPropagation();
      cancelled = true;
      end("cancelled");
    });
    row.appendChild(pause);
    bubble.appendChild(row);
    document.body.appendChild(bubble);
    shown = { el, bottom };
    positionBubble(el, bottom);
    trimCovered();
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
    for (let index = 0; index < steps.length; index++) {
      const step = steps[index];
      if (cancelled) return;
      const el = await waitFor(step.selector);
      if (!el) return end("missing");
      if (label) label.textContent = step.say ? "Sherlock" : (step.caption ?? "Sherlock");
      if (!fullyInView(el)) {
        if (window.matchMedia("(max-width: 759px)").matches) window.scrollTo({ top: window.pageYOffset + el.getBoundingClientRect().top - 110, behavior: reduced ? "auto" : "smooth" });
        else window.scrollTo({ top: window.pageYOffset + el.getBoundingClientRect().top - Math.round(window.innerHeight * 0.2), behavior: reduced ? "auto" : "smooth" });
        await settle(el);
      }
      if (cancelled) return;
      const rect = el.getBoundingClientRect();
      if (!reduced) await fly({ x: rect.left + Math.min(rect.width * 0.5, 160), y: rect.top + rect.height * 0.62 });
      if (cancelled) return;
      clear();
      if (step.say) {
        const bottom = highlight(el);
        speak(el, step.say, bottom, index === steps.length - 1);
        await waitOrNext(readTime(step.say));
        if (cancelled) return;
        clear();
        continue;
      }
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
