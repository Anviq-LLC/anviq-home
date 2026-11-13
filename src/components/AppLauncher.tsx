import { useEffect, useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { APPS } from "@/data/content";

type App = (typeof APPS)[number];
type Box = { left: number; top: number; size: number };

const HOP_MS = 340;
const NAVIGATE_MS = 760;

// Click: the icon hops, grows into a full-screen splash in the app's colours,
// then the site opens with the same splash so the two read as one movement.
export function AppLink({ app, className, children }: { app: App; className?: string; children: ReactNode }) {
  const reduced = useReducedMotion();
  const [hop, setHop] = useState(false);
  const [box, setBox] = useState<Box | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const reset = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setBox(null);
        setOpen(false);
        setHop(false);
      }
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  useEffect(() => {
    if (!box) return;
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
    return () => cancelAnimationFrame(frame);
  }, [box]);

  function launch(event: MouseEvent<HTMLAnchorElement>) {
    if (reduced || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (hop || box) return;
    const target = event.currentTarget;
    const icon = target.querySelector<HTMLElement>(".app-icon") ?? target;
    setHop(true);
    window.setTimeout(() => {
      const rect = icon.getBoundingClientRect();
      setBox({ left: rect.left, top: rect.top, size: rect.width });
    }, HOP_MS);
    window.setTimeout(() => {
      window.location.href = app.href;
    }, NAVIGATE_MS);
  }

  const frame: CSSProperties = box
    ? open
      ? { left: 0, top: 0, width: "100vw", height: "100dvh", borderRadius: 0 }
      : { left: box.left, top: box.top, width: box.size, height: box.size, borderRadius: "22%" }
    : {};

  return (
    <>
      <a
        className={`${className ?? ""}${hop ? " is-hopping" : ""}${box ? " is-launching" : ""}`}
        href={app.href}
        onClick={launch}
      >
        {children}
      </a>
      {hop && <p className="sr-only" role="status">Opening {app.name}</p>}
      {box && (
        <div
          className={`app-launch${open ? " is-open" : ""}`}
          style={{ ...frame, "--l1": app.c1, "--l2": app.c2 } as CSSProperties}
          aria-hidden="true"
        >
          <div className="app-launch-in">
            <img src={app.icon} alt="" width="112" height="112" style={{ width: open ? 112 : box.size, height: open ? 112 : box.size }} />
            <b>{app.name}</b>
          </div>
        </div>
      )}
    </>
  );
}

export function AppLauncher({ headingId, heading = "What we do" }: { headingId: string; heading?: string }) {
  return (
    <section className="apps" aria-labelledby={headingId}>
      <div className="apps-head">
        <h2 id={headingId}>{heading}</h2>
        <p>Pick the one that fits.</p>
      </div>
      <div className="apps-grid">
        {APPS.map((app) => (
          <AppLink key={app.id} app={app} className="app-tile">
            <span className="app-icon">
              <img src={app.icon} alt="" width="112" height="112" draggable="false" />
            </span>
            <span className="app-name">{app.name}</span>
            <span className="app-tag">{app.tag}</span>
          </AppLink>
        ))}
      </div>
    </section>
  );
}
