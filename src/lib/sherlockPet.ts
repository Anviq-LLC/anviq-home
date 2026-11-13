// Moves Sherlock's character around the page. On a desktop pointer it trails
// the cursor and settles beside it when the cursor stops. On touch it slides
// along the right edge with the finger. Otherwise it stays in its corner.

const SIZE = 60;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export interface Pet {
  /** Fly to a point with the second mouse (follows until released). */
  follow(x: number, y: number): void;
  release(): void;
  setHome(atHome: boolean): void;
  setEnabled(enabled: boolean): void;
  /** Stay put while a bubble is showing. */
  hold(on: boolean): void;
  refreshHome(): void;
  destroy(): void;
}

export function createPet(el: HTMLElement, homePoint: () => { x: number; y: number }): Pet {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let enabled = !reduced;
  let atHome = false;
  let routed = false;
  let raf = 0;
  let home = homePoint();
  let x = home.x;
  let y = home.y;
  let tx = x;
  let ty = y;
  let hovering = false;
  let holding = false;
  let lastX = 0;
  let lastY = 0;
  let settleTimer = 0;
  let homeTimer = 0;

  const apply = () => {
    el.style.transform = `translate(${x - SIZE / 2}px, ${y - SIZE / 2}px)`;
  };
  const tick = () => {
    raf = 0;
    const dx = tx - x;
    const dy = ty - y;
    x += dx * 0.17;
    y += dy * 0.17;
    el.dataset.side = x < 300 ? "l" : "r";
    el.dataset.edge = y < 220 ? "t" : "b";
    apply();
    if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) raf = requestAnimationFrame(tick);
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const goTo = (px: number, py: number) => {
    tx = clamp(px, SIZE / 2 + 4, window.innerWidth - SIZE / 2 - 4);
    ty = clamp(py, SIZE / 2 + 4, window.innerHeight - SIZE / 2 - 4);
    kick();
  };
  const goHome = () => {
    home = homePoint();
    tx = home.x;
    ty = home.y;
    kick();
  };
  const travelling = (on: boolean) => el.classList.toggle("is-travelling", on);
  const free = () => enabled && !atHome && !routed && !holding;

  const onPointer = (event: PointerEvent) => {
    if (!free() || !fine || event.pointerType !== "mouse" || hovering) return;
    // Moving toward the character means "let me click you": hold still.
    const toX = x - event.clientX;
    const toY = y - event.clientY;
    const dist = Math.hypot(toX, toY);
    const moveX = event.clientX - lastX;
    const moveY = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    if (dist < 140 && moveX * toX + moveY * toY > 0) {
      tx = x;
      ty = y;
      travelling(false);
      return;
    }
    goTo(event.clientX + 46, event.clientY + 38);
    travelling(true);
    window.clearTimeout(settleTimer);
    window.clearTimeout(homeTimer);
    settleTimer = window.setTimeout(() => travelling(false), 650);
    homeTimer = window.setTimeout(() => {
      if (free()) goHome();
    }, 9000);
  };
  const onTouch = (event: TouchEvent) => {
    if (!free() || fine) return;
    const t = event.touches[0];
    if (!t) return;
    goTo(home.x, t.clientY - 30);
    window.clearTimeout(homeTimer);
    homeTimer = window.setTimeout(() => {
      if (free()) goHome();
    }, 2600);
  };
  const onLeave = () => {
    if (free()) goHome();
  };
  const onResize = () => {
    home = homePoint();
    if (atHome && !routed) {
      tx = home.x;
      ty = home.y;
      kick();
    }
  };
  const onEnter = () => {
    hovering = true;
    tx = x;
    ty = y;
  };
  const onExit = () => {
    hovering = false;
  };

  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("touchmove", onTouch, { passive: true });
  document.documentElement.addEventListener("mouseleave", onLeave);
  window.addEventListener("resize", onResize);
  el.addEventListener("pointerenter", onEnter);
  el.addEventListener("pointerleave", onExit);
  apply();

  return {
    follow(px, py) {
      routed = true;
      travelling(true);
      goTo(px + 34, py + 30);
    },
    release() {
      routed = false;
      travelling(false);
      window.clearTimeout(homeTimer);
      homeTimer = window.setTimeout(() => goHome(), 2200);
    },
    setHome(value) {
      atHome = value;
      if (value) {
        travelling(false);
        goHome();
      }
    },
    setEnabled(value) {
      enabled = value && !reduced;
      if (!enabled) goHome();
    },
    hold(on) {
      holding = on;
      if (on) {
        tx = x;
        ty = y;
        travelling(false);
      }
    },
    refreshHome: onResize,
    destroy() {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchmove", onTouch);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onExit);
      window.clearTimeout(settleTimer);
      window.clearTimeout(homeTimer);
      if (raf) cancelAnimationFrame(raf);
    },
  };
}
